import {filter} from 'rxjs/operators'

import * as rxbus from '@soulsoftware/rxbus'

import { 
    Module as FastifyModule, 
    Subjects as FastifySubjects,
    Config as FastifyConfig
} from '@soulsoftware/rxbus-fastify'

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@soulsoftware/rxbus-timer'

import { Module as TraceModule } from '@soulsoftware/rxbus-trace'
import { Module as WorkerModule, Subjects as WorkerSubjects } from '@soulsoftware/rxbus-worker'


/**
 * Route message from Timer to WebSocket
 * 
 * MUST: Call it before bus start
 */
function routeTimerToWS() {
    
    const ws_route_name = 'WS_MAIN'

    const tick_observer$ = rxbus.observe( TimerModule.name, TimerSubjects.Tick )

    const ws_event_subject$ = rxbus.subject( ws_route_name, FastifySubjects.WSMessage )

    // Request register a new WS route  

    rxbus.request<string,any>( FastifyModule.name, { topic: FastifySubjects.WSAdd, data:ws_route_name } )
        .then( () => tick_observer$.subscribe( tick => ws_event_subject$.next( tick.data )) )
        .catch( e => console.error(e) )
    
}

function runWorkerModule( ) {

    const worker_subject$ = rxbus.subject<number>(WorkerModule.name, WorkerSubjects.Run)

    rxbus.observe<number>( TimerModule.name, TimerSubjects.Tick )
            .pipe( filter( ({ data }) => data%10 == 0 ) )
            .subscribe({
                next: ({ data }) => { 
                    console.log( 'send tick to worker', data )
                    worker_subject$.next( data ) 
                },
                error: err => console.error( 'worker error', err),
            })
            
}

function main() {

    console.log( 'start' )

    rxbus.modules.register( TraceModule )
    rxbus.modules.register( TimerModule )
    rxbus.modules.register( WorkerModule )
    rxbus.modules.register<FastifyConfig>( FastifyModule, 
        { 
            port:8888, 
            requestTimeout:5000
        })

    for( let module of rxbus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    routeTimerToWS()

    runWorkerModule()
    
    rxbus.modules.start()
}

main()