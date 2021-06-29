import { Bus } from './bus'
import {  RequestOptions } from '@soulsoftware/rxmq'
import { firstValueFrom } from 'rxjs'

export namespace rxbus {

    export const observe = <T>( name:string, topic:string) => 
                                        Bus.channel<T>( name ).observe( topic )

    export const observeAndReply = <T,R>( name:string, topic:string) => 
                                            Bus.replyChannel<T,R>( name ).observe( topic )
                                            
    export const subject = <T>( name:string, topic:string) => 
                                        Bus.channel<T>( name  ).subject( topic )
    
    export const request = <T, R> ( name:string, options:Omit<RequestOptions<T,any,R>, "Subject">) => 
                                            firstValueFrom(Bus.replyChannel<T,R>( name ).request( options ))
        
}

export * from './bus'

