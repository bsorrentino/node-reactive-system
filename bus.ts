import assert from "assert"
import EventEmitter from "node:events"

namespace event {

    interface Subscription {
        event:string | symbol
        listener: (...args: any[]) => void
    }

    class ObservableChannel<T> {

        _emitter = new EventEmitter()
    
        on( event: string | symbol, listener: (args:T) => void ):Subscription {
            this._emitter.on( event, listener)
            return { event:event, listener:listener }
        }

        onAsync( event: string | symbol, listener: (args:T) => void ):Subscription {
            const asyncListener = (args:T) => setImmediate( () => listener(args) )
            this._emitter.on( event, asyncListener)
            return { event:event, listener:asyncListener }
        }

        off( subscription:Subscription ) {
            this._emitter.off( subscription.event, subscription.listener)
        }

    }

    class SubjectChannel<T> extends ObservableChannel<T> {
        
        emit( event: string | symbol, ...args: any[] ):boolean {
            return this._emitter.emit( event, args )
        }
    }

    class Bus {
    
        private _channels = new Map<string,SubjectChannel<any>>()
        
        newChannel<T>( name:string ):SubjectChannel<T> {
            assert.ok( !this._channels.has( name ), `Channel ${name} already exists!` )

            let result = new SubjectChannel<T>()
            this._channels.set( name, result )
            return result


        }

        channel<T>( name:string ):ObservableChannel<T> {
            assert.ok( this._channels.has( name ), `Channel ${name} doesn't exists!` )
            
            return this._channels.get( name )!
        }
    }
}
