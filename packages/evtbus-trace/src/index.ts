import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import { Evt, TopicEvent } from '@bsorrentino/evtbus'

import * as logger from '@bsorrentino/bus-logger'
import { style } from '@bsorrentino/bus-logger'


type TraceFunction<T = any> = ( event:TopicEvent<T> ) => void 


const log = logger.getLogger( 'TRACE' )

class TraceModule implements bus.Module {

    readonly name = "TRACE"
    
    #ctx = Evt.newCtx()


    onStart() {
        
        log.trace( this.name, 'start' )

        for( let topic of evtbus.topics() ) {
            
            log.trace( `subscribe on ${topic.name}`)

            const trace:TraceFunction = ( { topic$, data } ) => 
                log.info( style.Reverse, `trace: got message on topic '${topic$}' ==> `, data, style.Reset)

            topic.asNonPostable().attach( this.#ctx, trace )
 
        }
    }

    onStop() {
        log.trace( this.name, 'stop' )
        
        this.#ctx.getHandlers()
            .forEach( ( { handler } ) => handler.detach() )
    }
}



//const Module = new TraceModule()

export default new TraceModule()