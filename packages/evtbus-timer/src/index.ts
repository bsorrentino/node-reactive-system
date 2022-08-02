import * as bus from '@bsorrentino/bus-core'
import * as evtbus from '@bsorrentino/evtbus'
import { PubSubTopic } from '@bsorrentino/evtbus'

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
export const Topics = {
    Tick: 'TICK'
}

export const Name = 'TIMER'

class TimerModule implements bus.Module<Config> {

    readonly name = Name

    private config: Config = {
        period: 1000
    }

    private topic?: PubSubTopic<number>

    #interval?:any = undefined

    onRegister(config?: Config) {
        if (config) this.config = config
    }

    onStart() {

        this.topic = evtbus.createPubSubTopic<number>(this.name, Topics.Tick)

        let tick = 0
        this.#interval = 
            setInterval( () => this.topic?.post(  ++tick ), this.config.period)

    }

    onStop() {
        if (this.#interval) {
            clearInterval( this.#interval)
            this.#interval = undefined
        }
    }
}


export default new TimerModule()

