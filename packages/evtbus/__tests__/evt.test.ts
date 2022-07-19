'use strict';

import { Evt, TimeoutEvtError } from "evt";

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))

const interval = (ms:number, cb:()=>boolean ) => { 
    let handle:any
    return new Promise(resolve => {
        handle = setInterval( () => {
            if( cb() ) {
                resolve(null)
                clearInterval( handle )
            }  
        }, ms)
    })
}

const JEST_TIMEOUT = 10000
jest.setTimeout(JEST_TIMEOUT)

type Data = string

describe( 'evt: test new asyncIterator feature', () => {

    test( "with timeout",  async () => {
    
        const evt = Evt.create<Data>()
        
        const recvEvents = Array<string>()

        const waitForEvent =  async () => {

            const ctx = Evt.newCtx();
          
            for await(const data of evt.iter(ctx, 1500 )) {   
              recvEvents.push(data);
            }
          
            expect( ctx.completionStatus?.error ).toBeInstanceOf( TimeoutEvtError )
          
            expect( evt.getHandlers().length ).toEqual(0)
          
        }
        let postedEvents = 0;
          
        const postData = async () => {
            await interval( 1000, () => {
                evt.post( 'HI THERE!' )
                return ( ++postedEvents==5 ) 
            })   
        }
    
        await Promise.all( [waitForEvent(), postData()] )

        expect( postedEvents ).toEqual( 5 )
        expect( recvEvents.length ).toEqual( 5 )
    })

    test( "test new asyncIterator feature from evt with done", async () => {

        const evt = Evt.create<Data>()

        const ctx = Evt.newCtx();
        
        const recvEvents = Array<string>()

        const waitForEvent =  async () => {
  
            for await(const data of evt.iter(ctx)) {   
              recvEvents.push(data);
            }
                    
            expect( evt.getHandlers().length ).toEqual(0)
          
        }
          
        let postedEvents = 0

        const postData = async () => {
            await interval( 1000, () => {
                evt.post( 'HI THERE!' )
                if( ++postedEvents==5 ) {
                    ctx.done()
                    return true
                }
                return false
            })   
        }
    
        await Promise.all( [waitForEvent(), postData()] )

        expect( postedEvents ).toEqual( 5 )
        expect( recvEvents.length ).toEqual( 5 )

    })

})