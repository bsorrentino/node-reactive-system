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
  

interface EventIterator<Data> extends AsyncIterable<Data>  {
    abort(): void
}

type Event<Data,Result> = TopicEvent<Data> | ReplyTopicEvent<Data,Result>

export abstract class BaseTopic<Data, Event extends TopicEvent<Data>> {

    #name: string

    #emitter = Evt.create<Event>()

    #ctx = Evt.newCtx()
    
    /**
     * 
     * @param name 
     */
    constructor( name: string ) {
        this.#name = name
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
     * 
     */
    done() { this.#ctx.done() }

    /**
     * 
     * @param message 
     */
    abort( message?: string  ) { this.#ctx.abort( new Error( message )) } 

    /**
     * 
     * @param timeout 
     * @returns 
     */
     observe( timeout?: number ): EventIterator<Event> {
        let isStopped = false
    
        this.#ctx.evtDoneOrAborted.attachOnce( doneOrAborted => isStopped = true )
    
        const self = this
        const events = async function* () {
            
            while(!isStopped) {
    
                try {
                    const event =  await self.emitter.waitFor( self.#ctx, timeout )
                    if( isStopped ) break;
                    yield event
    
                } catch(error:any) {
                    console.warn( `timeout occurred observing topic "${self.name}"`);
                    // self.#ctx.abort( error )
                    isStopped = true
                }
            }
        }
    
        return {
            [Symbol.asyncIterator]: () => events(),
    
            abort: () => {
                console.warn( `observing topic ${this.#name} aborted by user'"`)
                // this.#ctx.abort( new Error('operation aborted by user'))
                isStopped = true
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