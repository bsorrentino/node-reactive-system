import * as bus from '@soulsoftware/bus-core'
import { Bus } from '@soulsoftware/rxbus'
import { interval, Subject, Subscription } from 'rxjs'
// import { tap } from 'rxjs/operators'

export const Subjects = { 
    Tick: 'tick'
}

class TimerModule implements bus.Module {

    readonly name = 'timer'

    private _subscription?:Subscription

    onRegister() {            
    }

    onStart() {
        // console.log( this.name, 'start' )
        const subject = Bus.channels.channel<number>( this.name )
                                .subject( Subjects.Tick )
        this._subscription = interval(1000)
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

