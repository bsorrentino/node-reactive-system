import {Worker} from 'worker_threads'
import path from 'path'
import {filter} from 'rxjs/operators'

import { Bus } from '@soulsoftware/rxbus'
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

/**
 * Route message from Timer to WebSocket
 * 
 * MUST: Call it before bus start
 */
function routeTimerToWS() {
    
    const ws_route_name = 'WS_MAIN'

    const tick_observer$ = Bus.channel<number>( TimerModule.name ).observe( TimerSubjects.Tick )

    const ws_event_subject$ = Bus.channel( ws_route_name  ).subject( FastifySubjects.WSMessage )

    const ws_add_route_req$ = Bus.replyChannel( FastifyModule.name ).request( { topic: FastifySubjects.WSAdd, data:ws_route_name } )

    // function to listen on a WS channel  
    const ws_observe = () => 
        tick_observer$.subscribe( tick => ws_event_subject$.next( tick ))

    // Request register a new WS route                 
    ws_add_route_req$.subscribe( { 
            next: v => console.log( `next: ${FastifySubjects.WSAdd}`),
            error: e => console.error( `error: ${FastifySubjects.WSAdd}`, e),
            complete: ws_observe 
        })
}

function runWorkerThread( ) {

    const workerPath = './lib/worker.js'

    try {
        const worker_thread = new Worker( workerPath, {} )

        console.log( 'worker thread id', worker_thread.threadId  )

        const worker_channel$ = Bus.workerChannel<number,number>( worker_thread ) 

        const tick_observer$ = Bus.channel<number>( TimerModule.name ).observe( TimerSubjects.Tick )

        worker_channel$.observable.subscribe({ 
            next: result => console.log( 'worker thread result ', result ),
            error: err => console.error( 'worker error', err),
        })
    
        tick_observer$.pipe( filter( ({ data }) => data%10 == 0 ) )
            .subscribe({
                next: ({ data }) => { 
                    console.log( 'send tick to worker', data )
                    worker_channel$.subject.next( data ) 
                },
                error: err => console.error( 'worker error', err),
            })
        
    }
    catch( e ) {
        console.error( 'error creating worker thread', e)
    }

}

function main() {

    console.log( 'start' )

    Bus.modules.register( TraceModule )
    Bus.modules.register( TimerModule )
    Bus.modules.register<FastifyConfig>( FastifyModule, 
        { 
            port:8888, 
            requestTimeout:5000
        })

    for( let module of Bus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    routeTimerToWS()

    runWorkerThread()
    
    Bus.modules.start()
}

main()