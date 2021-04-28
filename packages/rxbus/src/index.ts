import assert from 'assert'
import {MessageBus}  from '@soulsoftware/bus-core'

import { Observable, Subject } from 'rxjs'

class BusChannels {

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

    get channelNames():IterableIterator<string> {
        return this._channels.keys()
    }
}

type ModuleInfo = { module:MessageBus.Module, status:MessageBus.ModuleStatus }

class BusModules {

    private _modules = new Map<string,ModuleInfo>()

    registerModule( module:MessageBus.Module ) {
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

class BusEngine {
    readonly channels   = new BusChannels()
    readonly modules    = new BusModules()
}

export const Bus = new BusEngine()

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
