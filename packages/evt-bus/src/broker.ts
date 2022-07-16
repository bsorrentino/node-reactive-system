import { Ctx, Evt } from "evt"

export type RequestOptions<Data, Result> = {
    data: Data
    ctx?: Ctx<Result>
  };
  

export interface TopicEvent<Data> { 
    topic$: string, 
    data?: Data
}

export interface ReplyTopicEvent<Data, Result>extends TopicEvent<Data> { 
    reply: Ctx<Result> 
}
  

interface EventIterator<Data> extends AsyncIterable<Data>  {
    // abort(): void

    readonly isTerminated: boolean
}

type Event<Data,Result> = TopicEvent<Data> | ReplyTopicEvent<Data,Result>

export abstract class BaseTopic<Data, Event extends TopicEvent<Data>> {

    #name: string

    #emitter = Evt.create<Event>()

    #ctx = Evt.newCtx()
    
    #waitForCall = 0

    #endEvent:Event 
    
    /**
     * 
     * @param topic_name 
     */
    constructor( topic_name: string ) {
        this.#name = topic_name

        this.#endEvent = <Event>{ topic$: topic_name }
    }

    /**
     * 
     */
    get emitter() { return this.#emitter }

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
        this.#emitter.postAndWait( this.#endEvent )
            .then( () => this.#ctx.done() )
        
    }

    /**
     * 
     * @param message 
     */
    abort( message?: string  ) { 
        this.#emitter.postAndWait( this.#endEvent )
            .then( () => this.#ctx.abort( new Error( message )) )
        
    } 

    /**
     * 
     * @param timeout 
     * @returns 
     */
     observe( timeout?: number ): EventIterator<Event> {
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
                    const event =  await self.#emitter.waitFor( self.#ctx, timeout )
                    // console.debug( `end waitFor: ${self.#name}` ) 
                    yield event ;
    
                } catch(error:any) {
                    console.warn( `timeout occurred observing topic "${self.#name}"`);
                    stop()
                    yield self.#endEvent
                }
            }
        }
    
        return {
            [Symbol.asyncIterator]: () => events(),
    
            // abort: () => {
            //     console.warn( `observing topic ${this.#name} aborted by user'"`)
            //     stop()
            // }, 

            get isTerminated() {
                return isTerminated
            }
        }
    }
    
}

/**
 * 
 */
export class PubSubTopic<Data> extends BaseTopic<Data, TopicEvent<Data>> {

    /**
     * 
     * @param data 
     */
    post( data:Data  ) {
        this.emitter.post( { topic$: this.name, data: data })
    }

    // async postAndWait( data:Data ) {
    //     this.emitter.postAndWait( { topic$: this.name, data: data })
    // }


}

export class RequestReplyTopic<Data, Result> extends BaseTopic<Data, ReplyTopicEvent<Data,Result>> {

    #ctx = Evt.newCtx()

    /**
     * 
     * @param data 
     */
    async request( data:Data  ): Promise<Result> {

        const ctx = Evt.newCtx<Result>() 

        this.emitter.post({ 
            topic$: this.name, 
            data: data,
            reply: ctx
         })

        return new Promise<Result>( (resolve, reject ) => {
            
            ctx.evtDoneOrAborted.attachOnce( doneOrAborted => {

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