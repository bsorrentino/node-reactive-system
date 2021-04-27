import { Bus } from '@soulsoftware/rxbus'
import { MessageBus } from '@soulsoftware/bus-module'

import fastify from 'fastify'
import { Subject } from 'rxjs'

export class FastifyModule implements MessageBus.Module {
    private  server = fastify()
    readonly name = "FastifyModule"
    
    private _myChannel?:Subject<any>

    get myChannel() { return this._myChannel }

    onRegister() {
        const channelName = `${this.name}/channel`
        this._myChannel = Bus.channels.newChannel( channelName )

        this.server.get(`'${channelName}/*'`, (request, reply) => {
            
            this._myChannel?.next( request.query )
            reply.status( 200 )
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