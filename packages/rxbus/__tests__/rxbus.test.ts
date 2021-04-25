import { Subject } from 'rxjs/internal/Subject'
import { Bus, NewChannel, OnChannel } from '../src/rxbus'
import * as bus from 'bus-module'

it( 'test bus creation', () => {

    expect( Bus ).not.toBeNull()

})


class MyModule implements bus.Module {

    readonly name = "MyModule"
    
    private _myChannel:Subject<string>
    
    get myChannel() { return this._myChannel }
    
    onRegister() {
        this._myChannel = Bus.channels.newChannel( 'mychannel' )
    }

    onStart() {

        Bus.channels.channel( 'externalChannel').subscribe( { next: (v) => { console.log(v) } })
    }
}

it( 'test channel decorator creation', () => {

    const m = new MyModule()

    expect( m.myChannel ).not.toBeUndefined()

    const call1 = m.myChannel 
    expect( m.myChannel ).toStrictEqual( call1 )

})

