import { Worker } from 'worker_threads'
import * as bus  from '@soulsoftware/bus-core'
import Rxmq, { Channel, RequestResponseChannel } from '@soulsoftware/rxmq'
import { Observable, Subject } from 'rxjs'
import assert = require('assert')

type WorkerChannel<IN,OUT> = { subject:Subject<IN>, observable:Observable<OUT> }

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
    readonly modules    = new BusModules()

    // private uniqueId( prefix = '' ) {
    //     const dateString = Date.now().toString(36);
    //     const randomness = Math.random().toString(36).substr(2);
    //     return `${prefix}${dateString}${randomness}`
    // }

    channel<T>( name:string ):Channel<T> {
        return Rxmq.channel(name) as Channel<T>
    }

    replyChannel<T, R>( name:string ):RequestResponseChannel<T, R> {
        return Rxmq.channel(name) as RequestResponseChannel<T, R>
    }

    workerChannel<IN,OUT>( worker:Worker ):WorkerChannel<IN,OUT> {

        const uniqueId = `WORKER${worker.threadId}` 

        const ch = this.channel<IN|OUT>(uniqueId)

        const worker_message_out    = ch.subject('WORKER_OUT') as Subject<OUT>
        worker.on('message', value =>  worker_message_out.next( value ) )
        worker.on('error', err =>  worker_message_out.error( err ) )
        worker.on('exit', () =>  worker_message_out.complete() )

        const worker_message_in     = ch.subject('WORKER_IN') as Subject<IN>      
        worker_message_in.subscribe( value => worker.postMessage(value) )
      
        return {
            subject: worker_message_in,
            observable: worker_message_out.asObservable()
        }
    }
    
    get channelNames():string[] {
        return Rxmq.channelNames()
    }

}

export const Bus = new BusEngine()

