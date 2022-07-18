import * as rxbus from '@bsorrentino/rxbus'
import * as bus  from '@bsorrentino/bus-core'
import path from 'path'
import Fastify from 'fastify'
import '@fastify/websocket'
import '@fastify/static'

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
        
        const messagePublisher$    = rxbus.lookupPubSubTopic<M>( channelName, Subjects.WSMessageIn )
        const messageObserver$   = rxbus.lookupPubSubTopic<any>( channelName, Subjects.WSMessage )

        this.server.get( `/${this.name}/channel/${channelName}/*`, { websocket: true }, (connection /* SocketStream */, req /* FastifyRequest */) => {
            connection.socket.on( 'message', (message:M) => messagePublisher$.post( message ) )

            messageObserver$.evt.attach( ( event ) => {
                console.log( 'ws send', event.data )
                connection.socket.emit( event.data )
            })
        })
        
    }

    /**
     * 
     */
    onRegister( config?:Config ) {
        if( config ) this.config = config
    
        //
        // add Web Socket plugin
        //
        this.server.register( require('@fastify/websocket'), {} )
        //
        // add static plugin
        //
        // this.server.register(require('@fastify/static'), {
        //     root: path.join(process.cwd(), 'www'),
        //     prefix: '/', // optional: default '/'
        // })
        this.server.register(require('@fastify/static'), {
            root: __dirname,
        })
        
        this.server.get(`/${this.name}/wstest`, (req, reply) => {
            return reply.sendFile('websocket.html', __dirname ) // serving path.join(__dirname, 'public', 'myHtml.html') directly
        })

        const rxp = new RegExp( `/${this.name}/channel/([\\w]+)([?].+)?`)

        this.server.get(`/${this.name}/channel/*`, async (request, reply) => {
            
            const cmd = rxp.exec(request.url)
            if( cmd ) {

                const requestTopic = rxbus.lookupRequestReplyTopic<RequestData,ResponseData>( this.name, cmd[1] )
                
                try {
                    const result = await requestTopic.request( request, this.config.requestTimeout || 5000 )

                    reply.send(result)

                }
                catch( err:any ) {
                    reply.code(500).send(err)
                }

            }
            else {
                reply.status( 404 ).send('command not found!')
            }
            await reply
        })

          
        //
        // Listen for adding Web Socket channel
        //
        rxbus.lookupRequestReplyTopic<string,boolean>(this.name,Subjects.WSAdd)
            .evt.attach( event => {
                console.log( 'request add channel ', event.data )
                event.reply.done( true )
            })
        
    }

    onStart() {
        
        this.server.listen( { port: this.config.port || 3000 }, (err, address) => {
            if (err) {
                console.error(err)
                rxbus.lookupPubSubTopic(this.name, Subjects.ServerStart)
                    .abort( err )
            }
            else {
                console.log(`Server listening at ${address}`)
                rxbus.lookupPubSubTopic<ServerInfo>(this.name, Subjects.ServerStart)
                    .post( { address:address } )
                    .done()
                        
            }
          })    
    }

    onStop() {
        this.server.close().then( v => { 
            console.log( 'server closed!');
            rxbus.lookupPubSubTopic(this.name, Subjects.ServerClose)
                    .done() 
        })
    }
}

export const Module = new FastifyModule()