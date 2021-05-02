import { Bus } from '@soulsoftware/rxbus'
import * as bus  from '@soulsoftware/bus-core'

import Fastify from 'fastify'
import { Subject } from 'rxjs'

type ChannelData = { 
    command: string,
    data: any
}

class FastifyModule implements bus.Module {
    private  server = Fastify( {} )
    readonly name = "fastify"
    
    private _myChannel?:Subject<ChannelData>

    private channelName = `${this.name}/channel`
    
    /**
     * 
     */
    onRegister() {

        this.server.register( require('fastify-websocket') )

        this._myChannel = Bus.channels.newChannel<ChannelData>( this.channelName )

        const rxp = new RegExp( `/${this.channelName}/([\\w]+)([?].+)?`)

        this.server.get(`/${this.channelName}/*`, (request, reply) => {
        
            const cmd = rxp.exec(request.url)
            if( cmd ) {
                this._myChannel?.next( { 
                    command: cmd[1],
                    data: request.query
                })    
            }
            reply.status( 200 ).send( JSON.stringify(request.query) )
        })
        
    }

    onStart() {

        this.server.listen(8080, (err, address) => {
            if (err) {
                console.error(err)
            }
            else {
                console.log(`Server listening at ${address}`)
            }
          })    
    }

    onStop() {
        this.server.close().then( v => console.log( 'server closed!') )
    }
}

export const Module = new FastifyModule()