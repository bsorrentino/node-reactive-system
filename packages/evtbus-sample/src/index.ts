import * as evtbus from '@bsorrentino/evtbus'
import {Worker} from 'worker_threads'
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

import { 
    Module as WorkerModule, 
} from '@bsorrentino/evtbus-worker'

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
 async function route_timer_to_ws_channel(channel:string) {

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

async function route_timer_to_worker( worker:Worker|null ) {

    if( !worker ) return // GUARD

    // get worker related topics 
    const { publisher, observable } = 
        evtbus.workerTopics<number,{input:any,waitTime:number}>( worker ) 

     // get topic handling the timer event
    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick )

    // observing for timer events
    const observe_timer = async () => {
        // Request register a new WS route  
        for await ( const tick of timerTopic.observe() ) {

            if( tick.data%10 === 0 ) {
                console.log( 'send tick to worker', tick.data )
                publisher.post( tick.data )
            }
        
        }
    }
    
     // observing for worker events
    const observe_worker = async () => {
        for await ( const event of observable.observe() ) {

            console.log('worker event', event)
        
        }
    }

    // start observing
    Promise.all( [observe_timer(),observe_worker() ])
}

async function main() {

    console.log( 'start' )

    evtbus.modules.register( TimerModule )
    evtbus.modules.register<HTTPConfig>( HTTPModule, 
        { 
            port:8888, 
            requestTimeout:5000
        }) 
    evtbus.modules.register( WorkerModule )
    evtbus.modules.register( TraceModule )

    for( let module of evtbus.modules.names ) {
        console.log( `${module}`, 'registerd' )
    }

    evtbus.modules.start()

    return Promise.all([
        print_timer_ticks(),
        route_timer_to_ws_channel( 'wsmain' ),
        route_timer_to_worker( WorkerModule.worker )
    ])

}

main()

