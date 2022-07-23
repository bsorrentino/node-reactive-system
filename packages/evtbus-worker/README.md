# Worker Module

> Proof of Concept for using [Web Workers] module allowing to create a new **Web Worker** connecting it with a bidirection event channel

## Sample

```typescript

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/evtbus-timer'

import { 
    Module as WorkerModule 
} from '@bsorrentino/evtbus-worker'


async function print_timer_ticks() {

    // get topic handling the timer event
    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    // wait for timer events
    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) 
            console.log( 'tick', tick.data )
    
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
            
}

async function main() {

    evtbus.modules.register( WorkerModule )
    evtbus.modules.register( TimerModule )

    evtbus.modules.start()

    return Promise.all([
        print_timer_ticks(),
        route_timer_to_worker(WorkerModule.worker)
    ])

}

```


[Web Workers]: https://developer.mozilla.org/en-US/docs/Web/API/Web_Workers_API
