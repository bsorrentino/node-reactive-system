import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import  { 
    Name as TimerChannel, 
    Topics as TimerTopics
} from '@bsorrentino/evtbus-timer'

import { 
    Config as HTTPConfig,
    Topics as HTTPTopics
} from '@bsorrentino/evtbus-http'

import { 
    Worker,
    Module as WorkerModule, 
} from '@bsorrentino/evtbus-worker'

import { getLogger, style } from '@bsorrentino/bus-logger'

const log = getLogger( 'EVTBUS-SAMPLE')

/**
 * 
 */
async function print_timer_ticks() {

    const timerTopic = evtbus.createPubSubTopic<number>( TimerChannel, TimerTopics.Tick)

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

    const timerTopic = evtbus.createPubSubTopic<number>( TimerChannel, TimerTopics.Tick )

    const wsTopic = evtbus.createPubSubTopic<number>( channel, HTTPTopics.WSMessage )

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
    const timerTopic = evtbus.createPubSubTopic<number>( TimerChannel, TimerTopics.Tick )

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

/**
 * 
 */
async function importAndRegister<CONF extends bus.ModuleConfiguration>( path: string, config?:CONF) {

    const module = await import( path ) 

    if( !module )  throw `module '${path}' not found!`
    if( !module.default )  throw `module '${path}' does not not export default!`

    bus.modules.register( module.default, config )

}


async function main() {

    log.info( 'start' )

    await importAndRegister( '@bsorrentino/evtbus-timer' ) 
    await importAndRegister<HTTPConfig>( '@bsorrentino/evtbus-http',
        { 
            port:8888, 
            requestTimeout:5000
        }) 
    await importAndRegister( '@bsorrentino/evtbus-trace' ) 
    
    bus.modules.register( WorkerModule )

    bus.modules.start()

    return Promise.all([
        print_timer_ticks(),
        route_timer_to_ws_channel( 'wsmain' ),
        route_timer_to_worker( WorkerModule.worker )
    ])

}

main()

