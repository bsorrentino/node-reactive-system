
import { Bus } from '@soulsoftware/rxbus'
import { MessageBus } from '@soulsoftware/bus-module'
import { interval, Subject, Subscription } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Module as FastifyModule } from '@soulsoftware/rxbus-fastify'

class TraceModule implements MessageBus.Module {

    readonly name = "TraceModule"
    
    private _subscriptions:Array<Subscription> = []

    onStart() {

        for( let c of Bus.channels.channelNames ) {

            const trace = ( data:any ) => 
                console.log( `trace: got message from  ${c}`, data)

            this._subscriptions.push( 
                Bus.channels.channel( c ).subscribe( { next: trace }))

        }
    }

    onStop() {
        for( let s of this._subscriptions) {
           s.unsubscribe() 
        }
        this._subscriptions = []
    }
}

class TimerModule implements MessageBus.Module {

    readonly name = "TimerModule"
    
    private _myChannel?:Subject<number>

    get myChannel() { return this._myChannel }
    private _subscription?:Subscription

    onRegister() {
        this._myChannel = Bus.channels.newChannel( `${this.name}/channel` )
    }

    onStart() {
        this._subscription = interval(1000)
            .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe( this._myChannel )
    }

    onStop() {
        if( this._subscription ) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


function main() {

    console.log( 'start' )

    Bus.modules.registerModule( new TraceModule() )
    Bus.modules.registerModule( new TimerModule() )
    Bus.modules.registerModule( FastifyModule )

    for( let module of Bus.channels.channelNames ) {
        console.log( module, 'registerd' )
    }
    Bus.modules.start()


}

main()