import * as bus from '@bsorrentino/bus-core'
import { rxbus } from '@bsorrentino/rxbus'
import {  Subscription, of } from 'rxjs'

/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
    // custom configuration parameters
}

/**
 *  Event    = 'GENERIC_EVENT'
 */
export const Subjects = {
    Event: 'GENERIC_EVENT'
}

class <%= Module.Name %>Module implements bus.Module<Config> {

    readonly name = '<%= Module.Name.toUpperCase() %>'

    private config: Config = {
        // default configuration   
    }

    private _subscription?: Subscription

    /**
     * register and configure module
     * 
     * @param config module configuration
     */
    onRegister(config?: Config) {
        if (config) this.config = config
    }

    /**
     *  start 
     */
    onStart() {

        // example to setup an emitter
        const emitter$ = rxbus.subject<string>(this.name, Subjects.Event)

        this._subscription = of('this is a test for emitting data').subscribe(emitter$)
    }

    /**
     *  stop
     */
    onStop() {
        if (this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


export const Module = new <%= Module.Name %>Module()

