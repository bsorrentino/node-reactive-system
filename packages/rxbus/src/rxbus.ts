import assert from 'assert'

import { Observable, Subject } from 'rxjs'

namespace event {

    class Bus {
    
        private _channels = new Map<string,Subject<any>>()

        newChannel<T>( name:string ):Subject<T> {
            assert.ok( !this._channels.has( name ), `Channel ${name} already exists!` )
            let result = new Subject<T>()
            this._channels.set( name, result )
            return result
        }

        channel<T>( name:string ):Observable<T> {
            assert.ok( this._channels.has( name ), `Channel ${name} doesn't exists!` )
            
            return this._channels.get( name )!.asObservable()
        }
    }
}
