import * as bus from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { Subscription } from 'rxjs'

class TraceModule implements bus.Module {

    readonly name = "TraceModule"
    
    private _subscriptions:Array<Subscription> = []

    onStart() {
        console.log( this.name, 'start' )

        for( let c of Bus.channels.names ) {
            
            console.log( `trace: subscribe on ${c}`)

            const trace = ( data:any ) => 
                console.log( `trace: got message from  ${c}`, data)

            this._subscriptions.push( 
                Bus.channels.channel( c ).observe( "*" ).subscribe( { next: trace }))

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