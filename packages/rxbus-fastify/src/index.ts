import { Bus } from '@soulsoftware/rxbus'
import * as bus  from '@soulsoftware/bus-core'

import Fastify from 'fastify'
import {  RequestResponseChannel } from '@soulsoftware/rxmq'

type RequestData = any  
type ResponseData = any
type ServerInfo = {
    address:string
}

class FastifyModule implements bus.Module {
    private  server = Fastify( {} )
    readonly name = "fastify"
    
    private _myChannel?:RequestResponseChannel<RequestData,ResponseData>

    /**
     * 
     */
    onRegister() {
        const channelName = `${this.name}/channel`
        
        this.server.register( require('fastify-websocket') )

        this._myChannel = Bus.channels.requestChannel<RequestData,ResponseData>( channelName )

        const rxp = new RegExp( `/${channelName}/([\\w]+)([?].+)?`)

        this.server.get(`/${channelName}/*`, (request, reply) => {
        
            const cmd = rxp.exec(request.url)
            if( cmd ) {
                this._myChannel?.request( { topic: cmd[1], data:request } ) 
                    .subscribe({ 
                        next: data => reply.send(data),
                        error: err => reply.code(500).send(err),
                        complete: () => {}
                    })
            }
            else {
                reply.status( 404 ).send('command not found!')
            }
        })
        
    }

    onStart() {
        const channelName = `${this.name}/channel`
        

        this.server.listen(8080, (err, address) => {
            if (err) {
                console.error(err)
                Bus.channels.channel(channelName).subject('server.start').error( err )
            }
            else {
                console.log(`Server listening at ${address}`)
                Bus.channels.channel<ServerInfo>(channelName).subject('server.start').next( { address:address })
            }
          })    
    }

    onStop() {
        this.server.close().then( v => console.log( 'server closed!') )
    }
}

export const Module = new FastifyModule()