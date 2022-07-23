import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import { Evt, TopicEvent } from '@bsorrentino/evtbus'

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

type TraceFunction<T = any> = ( event:TopicEvent<T> ) => void 

class TraceModule implements bus.Module {

    readonly name = "TRACE"
    
    #ctx = Evt.newCtx()

    onStart() {
        console.log( this.name, 'start' )

        for( let topic of evtbus.topics() ) {
            
            console.log( `trace: subscribe on ${topic.name}`)

            const trace:TraceFunction = ( { topic$, data } ) => 
                console.log( Reverse, `trace: got message on topic '${topic$}' ==> `, data, Reset)

            topic.asNonPostable().attach( this.#ctx, trace )
 
        }
    }

    onStop() {
        this.#ctx.getHandlers()
            .forEach( ( { handler } ) => handler.detach() )
    }
}



export const Module = new TraceModule()