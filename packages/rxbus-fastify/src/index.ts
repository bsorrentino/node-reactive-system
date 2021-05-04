import { Bus } from '@soulsoftware/rxbus'
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
 *  WSSend      = 'ws.send'
 *  WSMessage   = 'ws.message.out'
 *  WSMessageIn = 'ws.message.in',
 *  WSAdd       = 'ws.add'
 *  ServerStart = 'server.start'
 *  ServerClose = 'server.close'
 */
export const Subjects = { 
    WSSend:'ws.send',
    WSMessage:'ws.message.out',
    WSMessageIn:'ws.message.in',
    WSAdd:'ws.add',
    ServerStart:'server.start',
    ServerClose:'server.close'
}

/**
 * Module to manage HTTP and WebSocket channels
 */
class FastifyModule implements bus.Module<Config> {
    private  server = Fastify( {} )
    readonly name = "fastify"

    private config:Config = {
        port: 3000,
        requestTimeout: 5000
    }

    private setupWebSocketChannel<M>( module:string ) {
        const channelName = module
        
        const channel           = Bus.channels.channel(channelName)
        const messageSubject    = channel.subject( Subjects.WSMessageIn )
        const messageObserver   = channel.observe( Subjects.WSMessage )

        this.server.get( `/${this.name}/channel/${channelName}/*`, { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on( 'message', (message:M) => messageSubject.next( message ) )

            messageObserver.subscribe( (message:any) => {
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
    
        const httpChannel = Bus.channels.replyChannel<RequestData,ResponseData>( this.name )

        const rxp = new RegExp( `/${this.name}/channel/([\\w]+)([?].+)?`)

        this.server.get(`/${this.name}/channel/*`, async (request, reply) => {
            
            const cmd = rxp.exec(request.url)
            if( cmd ) {
                httpChannel.request( { topic: cmd[1], data:request } )
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
        Bus.channels.replyChannel<string,any>( this.name )
                                .observe( Subjects.WSAdd)
                                .subscribe( ({data,replySubject}) => {
                                    console.log( 'request add channel ', data )
                                    this.setupWebSocketChannel( data )
                                    replySubject.complete()
                                })
        
    }

    onStart() {
        
        this.server.listen( this.config.port || 3000, (err, address) => {
            if (err) {
                console.error(err)
                Bus.channels.channel(this.name)
                    .subject(Subjects.ServerStart).error( err )
            }
            else {
                console.log(`Server listening at ${address}`)
                Bus.channels.channel<ServerInfo>(this.name)
                    .subject(Subjects.ServerStart).next( { address:address })
            }
          })    
    }

    onStop() {
        this.server.close().then( v => { 
            console.log( 'server closed!');
            Bus.channels.channel(this.name)
                .subject(Subjects.ServerClose).complete() 
        })
    }
}

export const Module = new FastifyModule()