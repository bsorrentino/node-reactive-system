import { Ctx, Evt } from "evt"

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
  

export type  EventIterator<Data> = AsyncIterable<Data> 



export interface Publisher<Data> {
    post( data:Data ):void
}

export interface Observable<Data> {
    observe( timeout?: number ): EventIterator<TopicEvent<Data>>
}

export class BaseTopic<Data, Event extends TopicEvent<Data>>  {

    #name: string

    #evt = Evt.create<Event>()

    #ctx:Ctx<void>|null
    
    #waitForCall = 0

    #endEvent:Event 
    
    /**
     * 
     * @param topic_name 
     */
    constructor( topic_name: string ) {
        this.#name = topic_name

        this.#ctx = Evt.newCtx()
        this.#endEvent = <Event>{ topic$: topic_name }
    }

    /**
     * 
     */
    get evt() { return this.#evt }

    /**
     * 
     */
    get name() { return this.#name }

    /**
     * waitFor in progess calls
     */
    get waitForCall() { return this.#waitForCall }

    /**
     * 
     */
    done() { 
        if( this.#ctx !== null ) {
            this.#evt.postAndWait( this.#endEvent )
            .then( () => this.#ctx?.done() )
            .then( () => this.#ctx = null )

        }
        
    }

    /**
     * 
     * @param message 
     */
    abort( error: Error  ) { 
        if( this.#ctx !== null ) {
            this.#evt.postAndWait( this.#endEvent )
                .then( () => this.#ctx?.abort( error ) )
                .then( () => this.#ctx = null )
        }
        
    } 

    /**
     * 
     * @param timeout 
     * @returns 
     */
     observe( timeout?: number ): EventIterator<Event> {
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
                    // console.debug( `start waitFor: ${self.#name}` ) 
                    const event =  await self.#evt.waitFor( self.#ctx!, timeout )
                    // console.debug( `end waitFor: ${self.#name}`, event.data ) 
                    
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
    
            // abort: () => {
            //     console.warn( `observing topic ${this.#name} aborted by user'"`)
            //     stop()
            // }, 

            // get isTerminated() {
            //     return isTerminated
            // }
        }
    }
    
}

/**
 * 
 */
export  class PubSubTopic<Data> 
        extends BaseTopic<Data, TopicEvent<Data>> 
        implements Publisher<Data>, Observable<Data> {

    /**
     * 
     * @param data 
     */
    post( data:Data  ) {
        this.evt.post( { topic$: this.name, data: data })
    }

    // async postAndWait( data:Data ) {
    //     this.emitter.postAndWait( { topic$: this.name, data: data })
    // }


}

export  class RequestReplyTopic<Data, Result> 
        extends BaseTopic<Data, ReplyTopicEvent<Data,Result>> {

    /**
     * 
     * @param data 
     */
    async request( data:Data  ): Promise<Result> {

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
        // console.log( `RequestReplyTopic.Observe( ${this.name} )  = ${this.waitForCall}`)
        if( this.waitForCall > 0 ) {
            throw 'it is forbidden invoke waitFor more than one time on a RequestReplyTopic'
        }
    
        return super.observe( timeout )
    }

}

type GenericTopic<Data,Result> = PubSubTopic<Data> | RequestReplyTopic<Data,Result>

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
     * return (and eventually create) a topic
     * 
     * @param name topic name
     * @returns topic
     */
    lookupPubSubTopic<Data>( name: string ): PubSubTopic<Data> {

        let topic = this.#topics[ name ] as PubSubTopic<Data>
        if( !topic ) {

            topic = new PubSubTopic<Data>( name )
            this.#topics[name] = topic as GenericTopic<unknown,unknown>
        }
        if( typeof (<any>topic).post !== 'function' ) throw `topic '${name}' is not a PubSubTopic` 
        return topic 
    }

    /**
     * 
     * @param name 
     * @returns 
     */
    lookupRequestReplyTopic<Data, Result>( name: string ):RequestReplyTopic<Data,Result> {

        let topic = this.#topics[ name ] as RequestReplyTopic<Data,Result>
        if( !topic ) {

            topic = new RequestReplyTopic<Data,Result>( name )
            this.#topics[name] = topic as GenericTopic<unknown,unknown>
        }
        if( typeof (<any>topic).request !== 'function' ) throw  `topic '${name}' is not a RequestReplyTopic`
        return topic 
    }

}