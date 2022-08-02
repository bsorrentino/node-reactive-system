import * as bus from '@bsorrentino/bus-core'
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

import { getLogger, style } from '@bsorrentino/bus-logger'

const log = getLogger( 'EVTBUS-SAMPLE')

/**
 * 
 */
async function print_timer_ticks() {

    const timerTopic = evtbus.createPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) 
            log.info( 'tick', tick.data )
    
    }

}

/**
 * Route message from Timer to WebSocket
 * 
 * MUST: Call it before bus start
 */
 async function route_timer_to_ws_channel(channel:string) {

    const timerTopic = evtbus.createPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick )

    const wsTopic = evtbus.createPubSubTopic<number>( channel, HTTPSubjects.WSMessage )

    // Request register a new WS route  
    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) {
            log.info( `wsTopic.post( ${tick.data} )`)
            wsTopic.post( tick.data )
        }
    
    }
    
}

async function route_timer_to_worker( worker:Worker|null ) {

    if( !worker ) return // GUARD

    // get worker related topics 
    const { publisher, observable } = 
        evtbus.createWorkerTopics<number,{input:any,waitTime:number}>( worker ) 

     // get topic handling the timer event
    const timerTopic = evtbus.createPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick )

    // observing for timer events
    const observe_timer = async () => {
        // Request register a new WS route  
        for await ( const tick of timerTopic.observe() ) {

            if( tick.data%10 === 0 ) {
                log.info( 'send tick to worker', tick.data )
                publisher.post( tick.data )
            }
        
        }
    }
    
     // observing for worker events
    const observe_worker = async () => {
        for await ( const event of observable.observe() ) {

            log.info('worker event', event)
        
        }
    }

    // start observing
    Promise.all( [observe_timer(),observe_worker() ])
}

async function main() {

    log.info( 'start' )

    bus.modules.register( TimerModule )
    bus.modules.register<HTTPConfig>( HTTPModule, 
        { 
            port:8888, 
            requestTimeout:5000
        }) 
    bus.modules.register( WorkerModule )
    bus.modules.register( TraceModule )

    for( let module of bus.modules.names ) {
        log.info( `${module}`, 'registerd' )
    }

    bus.modules.start()

    return Promise.all([
        print_timer_ticks(),
        route_timer_to_ws_channel( 'wsmain' ),
        route_timer_to_worker( WorkerModule.worker )
    ])

}

main()

