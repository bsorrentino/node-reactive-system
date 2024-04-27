import * as evtbus from '@bsorrentino/evtbus'
import * as bus  from '@bsorrentino/bus-core'
import { createServer, IncomingMessage } from 'http'
import { WebSocketServer, WebSocket } from 'ws'
import { parse } from 'url';
import { Server as StaticServer } from 'node-static'

import * as logger from '@bsorrentino/bus-logger'

// copied by ws BufferLike dclaration 
type BufferLike =
    | string
    | Buffer
    | DataView
    | number
    | ArrayBufferView
    | Uint8Array
    | ArrayBuffer
    | SharedArrayBuffer
    | readonly any[]
    | readonly number[]
    | { valueOf(): ArrayBuffer }
    | { valueOf(): SharedArrayBuffer }
    | { valueOf(): Uint8Array }
    | { valueOf(): readonly number[] }
    | { valueOf(): string }
    | { [Symbol.toPrimitive](hint: string): string };
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
export const Topics = { 
    WSSend:'WS_SEND',
    WSMessage:'WS_MESSAGE_OUT',
    WSMessageIn:'WS_MESSAGE_IN',
    WSAdd:'WS_ADD',
    ServerStart:'SERVER_START',
    ServerClose:'SERVER_CLOSE'
}

const parseChannel = ( req: IncomingMessage ) => {
    if( !req.url) return

    const { pathname } = parse(req.url);

    if( !pathname ) return

   const result = /\/channel\/([\w.]+)[\/]?/.exec(pathname)

   if( !result ) return

   return result[1]

}

export const Name = 'HTTP'

const log = logger.getLogger( Name )

/**
 * Module to manage HTTP and WebSocket channels
 */
class HTTPModule implements bus.Module<Config> {
    name = Name

    #server = createServer();

    private config:Config = {
        port: 3000,
        requestTimeout: 5000
    }
    
    /**
     * 
     * @param channel 
     * @param ws 
     */
    #setupWebSocketChannel = <IN,OUT extends BufferLike>( ws:WebSocket, channel:string ) => {
        
        const messagePublisher$ = evtbus.createPubSubTopic<IN>( channel, Topics.WSMessageIn )
        const messageObserver$  = evtbus.createPubSubTopic<OUT>( channel, Topics.WSMessage )

        ws.on( 'message', (message:IN, isBinary:boolean) => {
            
            if( isBinary ) {
                log.warn( 'ws message is binary. skipped!')
                return
            }

            messagePublisher$.post( message ) 
        })

        messageObserver$.asNonPostable().attach( event => {
                console.trace( 'ws send', event.data )
                ws.send( event.data )
            })
    }

    onRegister( config?:Config ) {
        if( config ) this.config = config
       
        const wss1 = new WebSocketServer({ noServer: true });

        wss1.on('connection', (ws:WebSocket, req:IncomingMessage, channel:string) => {

            log.info( `ws connect on channel ${channel}`)

            this.#setupWebSocketChannel( ws, channel )

        });

        this.#server.on('upgrade', (req, socket, head) => {

            const channel = parseChannel( req )

            if( channel ) {
                wss1.handleUpgrade(req, socket, head, (ws) => {
                    wss1.emit('connection', ws, req, channel);
                })
            }
            else {
                // Terminate request
                socket.destroy();                
            }

        });

        const fileServer = new StaticServer( __dirname, { } )

        this.#server.on( 'request', ( req, res ) => {

            if( !req.url ) {
                res.writeHead(500, 'url is not valid!')
                res.end()
                return
            }

            const { pathname  } = parse(req.url);

            if( pathname?.endsWith( 'wstest') || pathname?.endsWith( 'wstest/')) {

                fileServer.serveFile( 'websocket.html', 200, {}, req, res)
                return
            }

            res.writeHead(404, 'no request to serve')
            res.end()

        })

    }

    onStart() {
        this.#server.listen(this.config.port);

    }

    onStop() {
        this.#server.close()
    }

        
}

export default new HTTPModule()