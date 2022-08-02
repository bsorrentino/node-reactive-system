import { Worker } from 'worker_threads'
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
 * 
 * @param channel 
 * @param topic 
 * @returns 
 */
export const getPubSubTopic = <T>( channel:string, topic:string )  => 
                    broker.getPubSubTopic<T>( `${channel.toLowerCase()}_${topic}` )

/**
 * get or create a pub sub topic Channel 
 * 
 * @param channel 
 * @param topic 
 * @returns 
 */
export const createPubSubTopic = <T>( channel:string, topic:string )  => 
                    broker.createPubSubTopic<T>( `${channel.toLowerCase()}_${topic}` )

/**
 * 
 * @param channel 
 * @param topic 
 * @returns 
 */
export const getRequestReplyTopic = <T, R>( channel:string, topic:string ) =>
                    broker.getRequestReplyTopic<T, R>(`${channel.toLowerCase()}_${topic}`)
            
/**
 *  get or create a Request/Response Channel 
 * 
 * @param channel 
 * @param topic 
 * @returns 
 */
export const createRequestReplyTopic = <T, R>( channel:string, topic:string ) =>
        broker.createRequestReplyTopic<T, R>(`${channel.toLowerCase()}_${topic}`)



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
export const createWorkerTopics = <IN,OUT>( worker:Worker ):WorkerTopics<IN,OUT> => {
    const uniqueId = `worker_${worker.threadId}`
    const worker_observer    = createPubSubTopic<OUT>( uniqueId, `out`)

    worker.on('message', value =>  
        worker_observer.post( value ) 
    )
    worker.on('error', err =>  
        worker_observer.abort( err ) )
    worker.on('exit', () =>  
        worker_observer.done() )

    const worker_publisher     = createPubSubTopic<IN>( uniqueId, `in` )

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
export { 
    TopicEvent, 
    PubSubTopic 
} from './broker' 