import { Rxmq, RequestOptions, RequestResponseChannel, Channel } from '@bsorrentino/rxmq'
import { firstValueFrom, Observable, Subject } from 'rxjs'
import { Worker } from 'worker_threads'
import * as bus  from '@bsorrentino/bus-core'
import assert = require('assert')

/**
 * create new message bus
 */
const rxmq = new Rxmq()

/**
 * Worker Channel
 */
 export type WorkerChannel<IN,OUT> = { subject:Subject<IN>, observable:Observable<OUT> }

/**
 * get all names of the instantiated channels
 * 
 * @returns 
 */    
export const channelNames = () => rxmq.channelNames

/**
 * get or create a standard Channel 
 * 
 * @param - Channel Id 
 * @returns 
 */
export const channel = <T>( name:string ) => 
                    rxmq.channel<Channel<T>,T,unknown>(name)

/**
 * get or create a Request/Response Channel 
 * 
 * @param name - Channel Id
 * @returns 
 */
export const replyChannel = <T, R>( name:string ) =>
        rxmq.channel<RequestResponseChannel<T, R>,T,R>(name)


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
export const request = <T, R> ( name:string, options:Omit<RequestOptions<T,R>, "Subject">) => 
                                        firstValueFrom(replyChannel<T,R>( name ).request( options ))
        

