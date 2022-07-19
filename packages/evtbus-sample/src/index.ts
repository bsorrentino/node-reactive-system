import * as evtbus from '@bsorrentino/evtbus'


import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/evtbus-timer'

import { Module as TraceModule } from '@bsorrentino/evtbus-trace'
// import { 
//     Module as FastifyModule, 
//     Config as FastifyConfig
// } from '@bsorrentino/rxbus-fastify'

async function printTicks() {

    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    for await ( const tick of timerTopic.observe() ) {
        
        if( tick.data%10 === 0 ) 
            console.log( 'tick', tick.data )
    
    }

}

async function main() {

    console.log( 'start' )

    evtbus.modules.register( TimerModule )
    // rxbus.modules.register<FastifyConfig>( FastifyModule, 
    //     { 
    //         port:8888, 
    //         requestTimeout:5000
    //     }) 
    evtbus.modules.register( TraceModule )

    for( let module of evtbus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    evtbus.modules.start()

    return Promise.all([
        printTicks()
    ])

    
}

main()

