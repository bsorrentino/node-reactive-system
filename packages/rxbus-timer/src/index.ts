import * as bus from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { interval, Subject, Subscription } from 'rxjs'
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
    period:number

}

/**
 *  Tick    = 'tick'
 */
export const Subjects = { 
    Tick: 'tick'
}

class TimerModule implements bus.Module<Config> {

    readonly name = 'timer'

    private config:Config = {
        period:1000
    }

    private _subscription?:Subscription

    onRegister( config?:Config ) {  
        if( config ) this.config = config
    }

    onStart() {

        const subject = Bus.channel<number>( this.name )
                                .subject( Subjects.Tick )
        this._subscription = interval( this.config.period )
            // .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe( subject )
    }

    onStop() {
        if( this._subscription ) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


export const Module = new TimerModule()

