import assert from 'assert'
import { Worker } from 'worker_threads'
import * as bus  from '@soulsoftware/bus-core'
import Rxmq, { Channel, RequestResponseChannel } from '@soulsoftware/rxmq'
import { Observable, Subject } from 'rxjs'


type WorkerChannel<IN,OUT> = { in:Subject<IN>, out:Observable<OUT> }

class BusChannels {

    channel<T>( name:string ):Channel<T> {
        return Rxmq.channel(name) as Channel<T>
    }

    replyChannel<T, R>( name:string ):RequestResponseChannel<T, R> {
        return Rxmq.channel(name) as RequestResponseChannel<T, R>
    }

    workerChannel<OUT>( name:string, worker:Worker ):Observable<OUT> {
        const chOut = this.channel<OUT>(name)

        const worker_message_out = chOut.subject('worker.message.out')

        worker.on('message', e =>  worker_message_out.next( e.data) )
        worker.on('error', e =>  worker_message_out.error( e ) )
        worker.on('exit', () =>  worker_message_out.complete() )
      
        return worker_message_out.asObservable()
    }

    workerIOChannel<IN,OUT>( name:string, worker:Worker ):WorkerChannel<IN,OUT> {
        const chIn = this.channel<IN>(name)
        const chOut = this.channel<OUT>(name)

        const worker_message_out = chOut.subject('worker.message.out')
        const worker_message_in = chIn.subject('worker.message.in')

        worker.on('message', e =>  worker_message_out.next( e.data) )
        worker.on('error', e =>  worker_message_out.error( e ) )
        worker.on('exit', () =>  worker_message_out.complete() )
      
        worker_message_in.subscribe( value => worker.postMessage(value) )
      
        return {
            in: worker_message_in,
            out: worker_message_out.asObservable()
        }
    }
    
    get names():string[] {
        return Rxmq.channelNames()
    }
}

type ModuleInfo = { module:bus.Module, status:bus.ModuleStatus }

class BusModules {

    private _modules = new Map<string,ModuleInfo>()

    register<C extends bus.ModuleConfiguration>( module:bus.Module<C>, config?:C  ) {
        assert.ok( !this._modules.has( module.name ), `Module ${module.name} already exists!` )

        let result:ModuleInfo = {
            module:module,
            status:{ started:false, paused:false} 
        }
        this._modules.set( module.name, result )
        if( module.onRegister ) {
            module.onRegister( config )
        }
    }
    get names():IterableIterator<string> {
        return this._modules.keys()
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
