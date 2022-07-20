import * as evtbus from '@bsorrentino/evtbus'

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/evtbus-timer'

import { Module as TraceModule } from '@bsorrentino/evtbus-trace'
import { 
    Module as HTTPModule, 
    Config as HTTPConfig,
    Subjects as HTTPSubjects
} from '@bsorrentino/evtbus-http'

/**
 * 
 */
async function print_timer_ticks() {

    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) 
            console.log( 'tick', tick.data )
    
    }

}

/**
 * Route message from Timer to WebSocket
 * 
 * MUST: Call it before bus start
 */
 async function routeTimer_to_ws_channel(channel:string) {

    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick )

    const wsTopic = evtbus.lookupPubSubTopic<number>( channel, HTTPSubjects.WSMessage )

    // Request register a new WS route  
    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) {
            console.log( 'main', `wsTopic.post( ${tick.data} )`)
            wsTopic.post( tick.data )
        }
    
    }
    
}

async function main() {

    console.log( 'start' )

    evtbus.modules.register( TimerModule )
    evtbus.modules.register<HTTPConfig>( HTTPModule, 
        { 
            port:8888, 
            requestTimeout:5000
        }) 
    evtbus.modules.register( TraceModule )

    for( let module of evtbus.modules.names ) {
        console.log( `${module}`, 'registerd' )
    }

    evtbus.modules.start()

    return Promise.all([
        print_timer_ticks(),
        routeTimer_to_ws_channel( 'wsmain' )
    ])

}

main()

