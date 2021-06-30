import Rxmq, {  RequestOptions,RequestResponseChannel, Channel } from '@soulsoftware/rxmq'
import { firstValueFrom, Observable, Subject } from 'rxjs'
import { Worker } from 'worker_threads'
import * as bus  from '@soulsoftware/bus-core'
import assert = require('assert')

/**
 * Worker Channel
 */
 export type WorkerChannel<IN,OUT> = { subject:Subject<IN>, observable:Observable<OUT> }

/**
 * Module information
 */
 export type ModuleInfo = { module:bus.Module, status:bus.ModuleStatus }

/**
 * Namespace that contains **utilities functions**
 */
export namespace rxbus {

    /**
     * Module Management
     */
    export class Modules {

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

    /**
     * global modules instance
     */
    export const modules = new Modules()

    /**
     * get all names of the instantiated channels
     * 
     * @returns 
     */    
    export const channelNames = () => Rxmq.channelNames()

    /**
     * get or create a standard Channel 
     * 
     * @param - Channel Id 
     * @returns 
     */
    export const channel = <T>( name:string ) => 
                        Rxmq.channel<Channel<T>,T,unknown>(name)
    
    /**
     * get or create a Request/Response Channel 
     * 
     * @param name - Channel Id
     * @returns 
     */
    export const replyChannel = <T, R>( name:string ) =>
                            Rxmq.channel<RequestResponseChannel<T, R>,T,R>(name)


    /**
     * get or create a Channel conneted to a Worker Thread
     * 
     * @param worker - Worker Thread
     * @returns 
     */
    export const workerChannel = <IN,OUT>( worker:Worker ):WorkerChannel<IN,OUT> => {
        const uniqueId = `WORKER${worker.threadId}` 

        const channel$ = channel<IN|OUT>(uniqueId)

        const worker_message_out    = channel$.subject('WORKER_OUT') as Subject<OUT>
        worker.on('message', value =>  worker_message_out.next( value ) )
        worker.on('error', err =>  worker_message_out.error( err ) )
        worker.on('exit', () =>  worker_message_out.complete() )

        const worker_message_in     = channel$.subject('WORKER_IN') as Subject<IN>      
        worker_message_in.subscribe( value => worker.postMessage(value) )
        
        return {
            subject: worker_message_in,
            observable: worker_message_out.asObservable()
        }

    }
                        
    /**
     * Observe for a data coming from **Topic** belong to a **Channel**
     * 
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    export const observe = <T>( name:string, topic:string) => 
                                        channel<T>( name ).observe( topic )

    /**
     * _Observe_ for a data coming from **Topic** belong to a **Channel** and 
     * _Reply_ to the provided Subject
     * 
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
     export const reply = <T,R>( name:string, topic:string) => 
                                            replyChannel<T,R>( name ).observe( topic )
    
    /**
     * Set up an _Subject_(like an EventEmitter) to emit/observe data 
     * data from **Topic** belong to a **Channel** 
     * 
     * @param name - Channel Id
     * @param topic - Topic Id 
     * @returns  - [Subject](https://rxjs.dev/api/index/class/Subject)
     * 
     */
    export const subject = <T>( name:string, topic:string) => 
                                        channel<T>( name  ).subject( topic )
    
    /**
     * Send a request to a **Topic** belong a **Channel** and wait for Reply 
     * 
     * @param name - Channel Id 
     * @param options 
     * @returns 
     */
    export const request = <T, R> ( name:string, options:Omit<RequestOptions<T,any,R>, "Subject">) => 
                                            firstValueFrom(replyChannel<T,R>( name ).request( options ))
        
}

// export * from './bus'

