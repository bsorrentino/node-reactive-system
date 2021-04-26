## Experiment on developing a message bus in nodejs

Idea is to develop a **Message Bus** as core of simple a flexible **Module Based System** to develop complex and scalable backend services.

Currently we are evaluating as **message bus back-bone** to use:
* [EventEmitter](https://nodejs.org/docs/latest-v12.x/api/events.html)
* [RxJS](https://rxjs-dev.firebaseapp.com/guide/overview) 


### Samples

In package `rxsample` there is an example how to work, below a code snippet extract from there

```typescript

import { Bus } from 'rxbus'
import { MessageBus } from 'bus-module'
import { interval, Subject, Subscription } from 'rxjs'
import { tap } from 'rxjs/operators'

class MyModule implements MessageBus.Module {

    readonly name = "MyModule"
    
    private _myChannel?:Subject<string>
    private _subscription?:Subscription

    get myChannel() { return this._myChannel }
    
    onRegister() {
        this._myChannel = Bus.channels.newChannel( `${this.name}/channel` )
    }

    onStart() {
        this._subscription = 
            Bus.channels.channel( 'TimerModule/channel')
                .subscribe( { next: time => console.log( `${this.name} got time:`, time) })
    }

    onStop() {
        if( this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}

class TimerModule implements MessageBus.Module {

    readonly name = "TimerModule"
    
    private _myChannel?:Subject<number>

    get myChannel() { return this._myChannel }
    private _subscription?:Subscription

    onRegister() {
        this._myChannel = Bus.channels.newChannel( `${this.name}/channel` )
    }

    onStart() {
        this._subscription = interval(1000)
            .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe( this._myChannel )
    }

    onStop() {
        if( this._subscription ) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}


function main() {

    console.log( 'start' )

    Bus.modules.registerModule( new MyModule() )
    Bus.modules.registerModule( new TimerModule() )

    for( let module of Bus.channels.channelNames ) {
        console.log( module, 'registerd' )
    }
    Bus.modules.start()


}

main()

```