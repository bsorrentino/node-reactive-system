import * as bus from '@bsorrentino/bus-core'
import * as rxbus from '@bsorrentino/rxbus'
import { interval, Subscription } from 'rxjs'
// import { tap } from 'rxjs/operators'

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
    /**
     * The interval size in milliseconds.
     * 
     * default 1000
     */
    period: number

}

/**
 *  Tick    = 'TICK'
 */
export const Subjects = {
    Tick: 'TICK'
}

class TimerModule implements bus.Module<Config> {

    readonly name = 'TIMER'

    private config: Config = {
        period: 1000
    }

    private _subscription?: Subscription

    onRegister(config?: Config) {
        if (config) this.config = config
    }

    onStart() {

        const emitter$ = rxbus.subject<number>(this.name, Subjects.Tick)

        this._subscription = interval(this.config.period)
            // .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe(emitter$)
    }

    onStop() {
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


export const Module = new TimerModule()

