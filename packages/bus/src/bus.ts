import assert from "assert"
import { EventEmitter } from "events"

export namespace Message {

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

    export class Bus {
    
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

export const Bus = new Message.Bus()