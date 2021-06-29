import { Bus, rxbus } from '@soulsoftware/rxbus'
import * as bus  from '@soulsoftware/bus-core'
import 'fastify-websocket'
import '@soulsoftware/rxmq'

import Fastify from 'fastify'
import { timeout } from 'rxjs/operators'

type RequestData = any  
type ResponseData = any
type ServerInfo = {
    address:string
}

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
    /**
     * server port
     * 
     * default 3000
     */
    port:number

    /**
     * request timeout in ms
     * 
     * default 5000
     */
    requestTimeout:number
}

/**
 *  WSSend      = 'ws_send'
 *  WSMessage   = 'ws_message_out'
 *  WSMessageIn = 'ws_message_in',
 *  WSAdd       = 'ws_add'
 *  ServerStart = 'server_start'
 *  ServerClose = 'server_close'
 */
export const Subjects = { 
    WSSend:'WS_SEND',
    WSMessage:'WS_MESSAGE_OUT',
    WSMessageIn:'WS_MESSAGE_IN',
    WSAdd:'WS_ADD',
    ServerStart:'SERVER_START',
    ServerClose:'SERVER_CLOSE'
}

/**
 * Module to manage HTTP and WebSocket channels
 */
class FastifyModule implements bus.Module<Config> {
    private  server = Fastify( {} )
    readonly name = "FASTIFY"

    private config:Config = {
        port: 3000,
        requestTimeout: 5000
    }

    private setupWebSocketChannel<M>( module:string ) {
        const channelName = module
        
        const messageSubject$    = rxbus.subject<M>( channelName, Subjects.WSMessageIn )
        const messageObserver$   = rxbus.observe<any>( channelName, Subjects.WSMessage )

        this.server.get( `/${this.name}/channel/${channelName}/*`, { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on( 'message', (message:M) => messageSubject$.next( message ) )

            messageObserver$.subscribe( message => {
                console.log( 'ws send', message )
                connection.socket.send( message )
            })
        })
        
    }

    /**
     * 
     */
    onRegister( config?:Config ) {
        if( config ) this.config = config
    
        const httpChannel$ = Bus.replyChannel<RequestData,ResponseData>( this.name )

        const rxp = new RegExp( `/${this.name}/channel/([\\w]+)([?].+)?`)

        this.server.get(`/${this.name}/channel/*`, async (request, reply) => {
            
            const cmd = rxp.exec(request.url)
            if( cmd ) {
                httpChannel$.request( { topic: cmd[1], data:request } )
                    .pipe( timeout( this.config.requestTimeout || 5000) )
                    .subscribe({ 
                        next: data => reply.send(data),
                        error: err => reply.code(500).send(err),
                        complete: () => {}
                    })
            }
            else {
                reply.status( 404 ).send('command not found!')
            }
            await reply
        })

        //
        // add Web Socket middleware
        //
        this.server.register( require('fastify-websocket'), {} )

        //
        // Listen for adding Web Socket channel
        //
        rxbus.observeAndReply<string,boolean>(this.name,Subjects.WSAdd)
                .subscribe( ({data,replySubject}) => {
                    console.log( 'request add channel ', data )
                    this.setupWebSocketChannel( data )
                    replySubject.next( true )
                    replySubject.complete()
                })
        
    }

    onStart() {
        
        this.server.listen( this.config.port || 3000, (err, address) => {
            if (err) {
                console.error(err)
                rxbus.subject(this.name, Subjects.ServerStart)
                        .error( err )
            }
            else {
                console.log(`Server listening at ${address}`)
                rxbus.subject<ServerInfo>(this.name, Subjects.ServerStart)
                        .next( { address:address })
            }
          })    
    }

    onStop() {
        this.server.close().then( v => { 
            console.log( 'server closed!');
            rxbus.subject(this.name, Subjects.ServerClose)
                    .complete() 
        })
    }
}

export const Module = new FastifyModule()