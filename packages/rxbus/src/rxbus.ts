import assert from 'assert'
import * as bus from 'bus-module'

import { Observable, Subject } from 'rxjs'

namespace MessageBus {

    class Channels {
    
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
    type ModuleInfo = { module:bus.Module, status:bus.ModuleStatus }

    class Modules {
    
        private _modules = new Map<string,ModuleInfo>()

        registerModule<T>( module:bus.Module ) {
            assert.ok( !this._modules.has( module.name ), `Module ${module.name} already exists!` )

            let result:ModuleInfo = {
                module:module,
                status:{ started:false, paused:false} 
            }
            this._modules.set( module.name, result )
            if( module.onRegister ) {
                module.onRegister()
            }
       }

        start() {
            this._modules.forEach( m => {

                if( !m.status.started ) {
                    if( m.module.onStart ) {
                        m.module.onStart()
                    }
                    m.status.started = true
                }
            })
        }
    }

    export class Engine {
        channels = new Channels()
        modules = new Modules()
    }
}

export const Bus = new MessageBus.Engine()

/*
export function NewChannel(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const name = `_${propertyKey}`

    Object.defineProperty( target, `_${propertyKey}`, {
        writable: false,
        value: new Subject<unknown>()
    })

    descriptor.get = () => target[name]
    
}

export function OnChannel(name: string) {

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        Bus.channel( name ).subscribe( { next: descriptor.value } )
        console.log( target, propertyKey, descriptor )
    };
  }
*/