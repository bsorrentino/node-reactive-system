# Timer Module

> Module that emit a number every configured intervals (in milliseconds)

## Sample

```typescript
import { 
    Module as TimerModule, 
    Subjects as TimerSubjects
} from '@bsorrentino/evtbus-timer'

async function print_timer_ticks() {

    // get topic handling the timer event
    const timerTopic = evtbus.lookupPubSubTopic<number>( TimerModule.name, TimerSubjects.Tick)

    // wait for timer events
    for await ( const tick of timerTopic.observe() ) {   
            console.log( 'tick', tick.data )
    }
}

async function main() {

    evtbus.modules.register( TimerModule )

    evtbus.modules.start()

    await print_timer_ticks()

}

```