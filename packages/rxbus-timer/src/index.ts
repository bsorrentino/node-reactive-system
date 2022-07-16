import * as bus from '@bsorrentino/bus-core'
import { PubSubTopic } from '@bsorrentino/evt-bus'
import * as rxbus from '@bsorrentino/rxbus'

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

    private topic?: PubSubTopic<number>

    #interval?:any = undefined

    onRegister(config?: Config) {
        if (config) this.config = config
    }

    onStart() {

        this.topic = rxbus.lookupPubSubTopic<number>(this.name, Subjects.Tick)

        let tick = 0
        this.#interval = 
            setInterval( () => this.topic?.post( ++tick ), this.config.period)

    }

    onStop() {
        if (this.#interval) {
            clearInterval( this.#interval)
            this.#interval = undefined
        }
    }
}


export const Module = new TimerModule()

