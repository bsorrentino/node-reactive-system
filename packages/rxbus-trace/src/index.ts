import { MessageBus } from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { Subscription } from 'rxjs'

class TraceModule implements MessageBus.Module {

    readonly name = "TraceModule"
    
    private _subscriptions:Array<Subscription> = []

    onStart() {
        for( let c of Bus.channels.channelNames ) {
            
            console.log( `trace: subscribe on ${c}`)

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



export const Module = new TraceModule()