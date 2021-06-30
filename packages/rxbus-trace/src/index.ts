import * as bus from '@soulsoftware/bus-core'
import { rxbus } from '@soulsoftware/rxbus'
import { ChannelEvent } from '@soulsoftware/rxmq'
import { Subscription } from 'rxjs'

/*

Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"

Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
*/
const FgCyan = "\x1b[36m"
const Reverse = "\x1b[7m"
const Reset = "\x1b[0m"

type TraceFunction<T = any> = ( event:ChannelEvent<T> ) => void 

class TraceModule implements bus.Module {

    readonly name = "TRACE"
    
    private _subscriptions:Array<Subscription> = []

    onStart() {
        console.log( this.name, 'start' )

        for( let c of rxbus.channelNames() ) {
            
            console.log( `trace: subscribe on ${c}`)

            const trace:TraceFunction = ( { channel, data } ) => 
                console.log( Reverse, `trace: got message from '${c}' on channel '${channel}' ==> `, data, Reset)

            this._subscriptions.push( 
                rxbus.observe<any>( c, "*" ).subscribe( { next: trace }))

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