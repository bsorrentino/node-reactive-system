import * as bus from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { interval, Subject, Subscription } from 'rxjs'
// import { tap } from 'rxjs/operators'

class TimerModule implements bus.Module {

    readonly name = "timer"
    
    private _myChannel?:Subject<number>

    private _subscription?:Subscription

    onRegister() {
        // console.log( this.name, 'onRegister' )

        this._myChannel = 
            Bus.channels.channel<number>( `${this.name}/channel` )
                .subject( 'tick')
    }

    onStart() {
        // console.log( this.name, 'start' )

        this._subscription = interval(1000)
            // .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe( this._myChannel )
    }

    onStop() {
        if( this._subscription ) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


export const Module = new TimerModule()

