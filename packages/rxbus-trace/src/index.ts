import * as bus from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { ChannelEvent } from '@soulsoftware/rxmq'
import { Subscription } from 'rxjs'

type TraceFunction<T = any> = ( event:ChannelEvent<T> ) => void 

class TraceModule implements bus.Module {

    readonly name = "TraceModule"
    
    private _subscriptions:Array<Subscription> = []

    onStart() {
        console.log( this.name, 'start' )

        for( let c of Bus.channelNames ) {
            
            console.log( `trace: subscribe on ${c}`)

            const trace:TraceFunction = ( { channel, data } ) => 
                console.log( `trace: got message from '${c}' on channel '${channel}' ==>`, data)

            this._subscriptions.push( 
                Bus.channel<any>( c ).observe( "*" ).subscribe( { next: trace }))

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