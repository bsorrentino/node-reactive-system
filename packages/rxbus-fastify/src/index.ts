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

export const Subjects = { 
    WSSend:'ws.send',
    WSMessage:'ws.message',
    WSAdd:'ws.add',
    ServerStart:'server.start',
    ServerClose:'server.close'
}

class FastifyModule implements bus.Module {
    private  server = Fastify( {} )
    readonly name = "fastify"

    private setupWebSocketChannel<M>( module:string ) {
        const channelName = module
        
        const channel = Bus.channels.channel(channelName)
        const messageSubject    = channel.subject( Subjects.WSMessage )
        const messageObserver   = messageSubject.asObservable() // channel.observe( Subjects.WSMessage )

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
    onRegister() {
        
        const httpChannel = Bus.channels.requestChannel<RequestData,ResponseData>( this.name )

        const rxp = new RegExp( `/${this.name}/channel/([\\w]+)([?].+)?`)

        this.server.get(`/${this.name}/channel/*`, async (request, reply) => {
            
            const cmd = rxp.exec(request.url)
            if( cmd ) {
                httpChannel.request( { topic: cmd[1], data:request } )
                    .pipe( timeout(5000) )
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
        Bus.channels.requestChannel<string,any>( this.name )
                                .observe( Subjects.WSAdd)
                                .subscribe( ({data,replySubject}) => {
                                    console.log( 'request add channel ', data )
                                    this.setupWebSocketChannel( data )
                                    replySubject.complete()
                                })
        
    }

    onStart() {
        const channelName = this.name
        

        this.server.listen(8080, (err, address) => {
            if (err) {
                console.error(err)
                Bus.channels.channel(channelName).subject(Subjects.ServerStart).error( err )
            }
            else {
                console.log(`Server listening at ${address}`)
                Bus.channels.channel<ServerInfo>(channelName).subject(Subjects.ServerStart).next( { address:address })
            }
          })    
    }

    onStop() {
        this.server.close().then( v => { 
            console.log( 'server closed!');
            Bus.channels.channel(this.name).subject(Subjects.ServerClose).complete() 
        })
    }
}

export const Module = new FastifyModule()