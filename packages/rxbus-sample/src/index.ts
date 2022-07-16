import * as rxbus from '@bsorrentino/rxbus'

import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/rxbus-timer'
import { off } from 'process'

async function main() {

    console.log( 'start' )

    // rxbus.modules.register( TraceModule )
    rxbus.modules.register( TimerModule )

    for( let module of rxbus.modules.names ) {
        console.log( `"${module}"`, 'registerd' )
    }

    rxbus.modules.start()

    const timerTopic = rxbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    for await ( const tick of timerTopic.observe() ) {
        
        if( !tick.data ) break
        
        console.log( 'tick', tick.data )
    }

}

main()