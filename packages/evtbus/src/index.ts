import { Worker } from 'worker_threads'
import * as bus  from '@bsorrentino/bus-core'
import assert = require('assert')
import {
    Broker, 
    Observable, 
    Publisher,
    TopicEvent
} from './broker'


/**
 * create new message bus
 */
const broker = new Broker()


/**
 * Module information
 */
 export type ModuleInfo = { module:bus.Module, status:bus.ModuleStatus }

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
export const topicNames = () => broker.topicNames

/**
 * 
 * @returns 
 */
export const topics = () => broker.topics

/**
 * get or create a standard Channel 
 * 
 * @param - Channel Id 
 * @returns 
 */
export const lookupPubSubTopic = <T>( name:string, topic:string )  => 
                    broker.lookupPubSubTopic<T>( `${name.toLowerCase()}_${topic}` )

/**
 * get or create a Request/Response Channel 
 * 
 * @param name - Channel Id
 * @returns 
 */
export const lookupRequestReplyTopic = <T, R>( name:string, topic:string ) =>
        broker.lookupRequestReplyTopic<T, R>(`${name.toLocaleLowerCase()}_${topic}`)



/**
 * Worker topic
 */
 export type WorkerTopics<IN,OUT> = { 
    publisher:Publisher<IN>, 
    observable:Observable<TopicEvent<OUT>> 
}

/**
 * get or create a Channel conneted to a Worker Thread
 * 
 * @param worker - Worker Thread
 * @returns 
 */
export const workerTopics = <IN,OUT>( worker:Worker ):WorkerTopics<IN,OUT> => {
    const uniqueId = `worker_${worker.threadId}`
    const worker_observer    = lookupPubSubTopic<OUT>( uniqueId, `out`)

    worker.on('message', value =>  
        worker_observer.post( value ) 
    )
    worker.on('error', err =>  
        worker_observer.abort( err ) )
    worker.on('exit', () =>  
        worker_observer.done() )

    const worker_publisher     = lookupPubSubTopic<IN>( uniqueId, `in` )

    worker_publisher.asNonPostable().attach( value =>{
        // console.log( `worker.postMessage(${value.data})` )
        worker.postMessage(value.data)
    }) 
    
    return {
        publisher: worker_publisher,
        observable: worker_observer
    }

}


export * from 'evt'
export * from './broker' 