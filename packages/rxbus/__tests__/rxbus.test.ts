import { Bus } from '../src/rxbus'
import { MessageBus } from 'bus-module'
import { Subject, Subscription } from 'rxjs'

it( 'test bus creation', () => {

    expect( Bus ).not.toBeNull()

})


class MyModule implements MessageBus.Module {

    readonly name = "MyModule"
    
    private _myChannel?:Subject<string>
    private _subscription?:Subscription

    get myChannel() { return this._myChannel }
    
    onRegister() {
        this._myChannel = Bus.channels.newChannel( 'mychannel' )
    }

    onStart() {
        this._subscription = 
            Bus.channels.channel( 'externalChannel')
                .subscribe( { next: v => console.log(v) })
    }

    onStop() {
        if( this._subscription) {
            this._subscription.unsubscribe()
            this._subscription = undefined
        }
    }
}

it( 'test channel decorator creation', () => {

    const m = new MyModule()

    expect( m.myChannel ).toBeUndefined()

    Bus.modules.registerModule( m )

    expect( m.myChannel ).not.toBeUndefined()

    const call1 = m.myChannel 
    expect( m.myChannel ).toStrictEqual( call1 )

})

