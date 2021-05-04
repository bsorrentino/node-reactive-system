import { Bus } from '../src/index'
import * as bus from '@soulsoftware/bus-core'
import { Subject, Subscription } from 'rxjs'

it( 'test bus creation', () => {

    expect( Bus ).not.toBeNull()

})


class MyModule implements bus.Module {

    readonly name = "MyModule"
    
    onRegister() {
    }

    onStart() {
    }

    onStop() {
    }
}

it( 'test channel decorator creation', () => {

    const m = new MyModule()

    Bus.modules.register( m )

    const channelUniqueId = [
        Symbol('worker'),
        Symbol('worker'),
    ]
    expect( channelUniqueId[0] ).not.toBeNull()
    expect( channelUniqueId[1] ).not.toBeNull()

    expect( channelUniqueId[0] ).not.toEqual( channelUniqueId[1] )
    expect( channelUniqueId[0].toString() ).toEqual( channelUniqueId[1].toString() )

})

