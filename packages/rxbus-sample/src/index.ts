import * as rxbus from '@bsorrentino/rxbus'

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/rxbus-timer'

import { Module as TraceModule } from '@bsorrentino/rxbus-trace'
// import { 
//     Module as FastifyModule, 
//     Config as FastifyConfig
// } from '@bsorrentino/rxbus-fastify'

async function printTicks() {

    const timerTopic = rxbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%100 === 0 ) 
            console.log( 'tick', tick.data )
    
    }

}

async function main() {

    console.log( 'start' )

    rxbus.modules.register( TimerModule )
    // rxbus.modules.register<FastifyConfig>( FastifyModule, 
    //     { 
    //         port:8888, 
    //         requestTimeout:5000
    //     }) 
    rxbus.modules.register( TraceModule )

    for( let module of rxbus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    rxbus.modules.start()

    return Promise.all([
        printTicks()
    ])

    
}

main()

