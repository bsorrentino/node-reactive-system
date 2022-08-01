import { Ctx, Evt, NonPostableEvt, Postable } from "evt"
import { AsyncIterableEvt } from "evt/lib/types/AsyncIterableEvt";

export type RequestOptions<Data, Result> = {
    data: Data
    ctx?: Ctx<Result>
  };
  

export interface TopicEvent<Data> { 
    topic$: string, 
    data: Data
}

export interface ReplyTopicEvent<Data, Result>extends TopicEvent<Data> { 
    reply: Ctx<Result> 
}
  

export type  EventIterator<Event> = AsyncIterableEvt<Event> 

export type Publisher<Data> = Postable<Data> 

export interface Observable<Event> {
    observe( timeout?: number ): EventIterator<Event>

    asNonPostable(): NonPostableEvt<Event>
}

export class BaseTopic<Data, Event extends TopicEvent<Data>> implements Observable<Event> {

    #name: string

    #evt = Evt.create<Event>()

    #ctx:Ctx<void>|null

    /**
     * 
     * @param topic_name 
     */
    constructor( topic_name: string ) {
        this.#name = topic_name

        this.#ctx = Evt.newCtx()
    }

    asNonPostable(): NonPostableEvt<Event> {
       return this.#evt
    }

    /**
     * 
     */
    get name() { return this.#name }

    /**
     * 
     */
     protected get evt() { return this.#evt }


     get completionStatus() { return this.#ctx?.completionStatus }

    /**
     * 
     */
    done() { 
        if( this.#ctx !== null ) {
            this.#ctx.done()
            this.#ctx = null
        }        
    }

    /**
     * 
     * @param error 
     */
    abort( error: Error  ) { 
        if( this.#ctx !== null ) {
            this.#ctx.abort( error )
            this.#ctx = null
        }        
    } 

    /**
     * 
     * @param timeout 
     * @returns 
     */
    observe( timeout?: number ): EventIterator<Event> {
        if( this.#ctx === null ) throw new Error( 'context is no longer valid!')

        return this.#evt.iter( this.#ctx, timeout)
    }
 
}

/**
 * 
 */
export  class PubSubTopic<Data> 
        extends BaseTopic<Data, TopicEvent<Data>> 
        implements Publisher<Data> {

    postAsyncOnceHandled(data: Data): number | Promise<number> {
        return this.evt.postAsyncOnceHandled( { topic$: this.name, data } )
    }

    post(data: Data): number {
        return this.evt.post( { topic$: this.name, data } )
    }

    postAndWait(data: Data): Promise<void> {
        return this.evt.postAndWait( { topic$: this.name, data } )
    }


    asNonPostable(): NonPostableEvt<TopicEvent<Data>> {
       return this.evt
    }


}

export  class RequestReplyTopic<Data, Result> 
        extends BaseTopic<Data, ReplyTopicEvent<Data,Result>> {

    /**
     * 
     * @param data 
     */
    async request( data:Data, timeout?:number   ): Promise<Result> {

        const replyCtx = Evt.newCtx<Result>() 

        this.evt.post({ 
            topic$: this.name, 
            data: data,
            reply: replyCtx
         })

        return new Promise<Result>( (resolve, reject ) => {
            
            replyCtx.evtDoneOrAborted.attachOnce( doneOrAborted => {

                switch( doneOrAborted.type ){
                    case 'ABORTED':
                        reject( doneOrAborted.error )
                        break
                    case 'DONE':
                        resolve( doneOrAborted.result )
                        break
                }
            })
    
        })
    } 

    observe( timeout?: number ): EventIterator<ReplyTopicEvent<Data,Result>> {
        const handlers = this.evt.getHandlers()
        
        if( handlers && handlers.length > 0 ) {
            throw 'it is forbidden invoke waitFor more than one time on a RequestReplyTopic'
        }
    
        return super.observe( timeout )
    }

}

export type GenericTopic<Data,Result> = PubSubTopic<Data> | RequestReplyTopic<Data,Result>

/**
 * 
 */
export class Broker  {

    #topics: Record<string, GenericTopic<unknown, unknown>> = {}

    /**
    * Returns a topic names
    */
    get topicNames() {
        return Object.keys(this.#topics);
    }

    /**
     * 
     */
    get topics() {
        return Object.values(this.#topics);
    }
    
    /**
     * 
     * @param name 
     * @returns 
     */
    getPubSubTopic<Data>( name: string ): PubSubTopic<Data>|undefined {
        const topic =  this.#topics[ name ] as any

        if( topic && typeof topic.post !== 'function' ) 
            throw `topic '${name}' is not a PubSubTopic` 

        return topic as PubSubTopic<Data>
    }


    /**
     * create if doesn't exist
     * 
     * @param name topic name
     * @returns topic
     */
    createPubSubTopic<Data>( name: string ): PubSubTopic<Data> {

        let topic = this.getPubSubTopic<Data>( name ) 
        if( !topic ) {

            topic = new PubSubTopic<Data>( name )
            this.#topics[name] = topic as GenericTopic<unknown,unknown>
        }

        return topic 
    }

    /**
     * 
     * @param name 
     * @returns 
     */
    getRequestReplyTopic<Data,Result>( name: string ): RequestReplyTopic<Data,Result>|undefined {
        const topic =  this.#topics[ name ] as any

        if( topic && typeof topic.request !== 'function' ) 
            throw  `topic '${name}' is not a RequestReplyTopic` 

        return topic as RequestReplyTopic<Data,Result>
    }
    
    /**
     * create if doesn't exist
     * 
     * @param name 
     * @returns 
     */
    createRequestReplyTopic<Data, Result>( name: string ):RequestReplyTopic<Data,Result> {

        let topic = this.getRequestReplyTopic<Data,Result>( name )
        if( !topic ) {

            topic = new RequestReplyTopic<Data,Result>( name )
            this.#topics[name] = topic as GenericTopic<unknown,unknown>
        }

        return topic 
    }

}


/*
    
observe( timeout?: number ): AsyncIterable<Event>  {
    if( this.#ctx === null ) throw new Error( 'context is no longer valid!')

    ++this.#waitForCall

    let isTerminated = false

    const stop = () => {
        isTerminated = true 
        --this.#waitForCall
    }

    this.#ctx.evtDoneOrAborted.attachOnce( doneOrAborted => stop() )

    const self = this
    const events = async function* () {
        
        while(!isTerminated) {

            try {
                const event =  await self.evt.waitFor( self.#ctx!, timeout )
                
                if( event.data === undefined ) break

                yield event 

            } catch(error:any) {
                console.warn( `timeout occurred observing topic "${self.#name}"`);
                stop()
                break
            }
        }

        return null
    }

    return {
        [Symbol.asyncIterator]: () => events(),
    }
}

*/