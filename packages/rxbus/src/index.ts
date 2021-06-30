import { Bus } from './bus'
import {  RequestOptions } from '@soulsoftware/rxmq'
import { firstValueFrom } from 'rxjs'

/**
 * Namespace that contains **utilities functions**
 */
export namespace rxbus {

    /**
     * Observe for a data coming from **Topic** belong to a **Channel**
     * 
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    export const observe = <T>( name:string, topic:string) => 
                                        Bus.channel<T>( name ).observe( topic )

    /**
     * _Observe_ for a data coming from **Topic** belong to a **Channel** and 
     * _Reply_ to the provided Subject
     * 
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
     export const reply = <T,R>( name:string, topic:string) => 
                                            Bus.replyChannel<T,R>( name ).observe( topic )
                                            
    export const subject = <T>( name:string, topic:string) => 
                                        Bus.channel<T>( name  ).subject( topic )
    
    export const request = <T, R> ( name:string, options:Omit<RequestOptions<T,any,R>, "Subject">) => 
                                            firstValueFrom(Bus.replyChannel<T,R>( name ).request( options ))
        
}

export * from './bus'

