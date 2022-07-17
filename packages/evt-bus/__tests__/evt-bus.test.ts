'use strict';

import { Broker } from "../src/broker";

const sleep = (ms:number) => new Promise(resolve => setTimeout(resolve, ms))

const broker = new Broker()

const JEST_TIMEOUT = 10000
jest.setTimeout(JEST_TIMEOUT)

describe( 'evt-bus lookup for topics', () => {
    test( 'get a Pub Sub Topic', () => {

        expect(broker).not.toBeNull()

        const topic1 = broker.lookupPubSubTopic( 'topic1' )

        expect(topic1).not.toBeNull()

        let topic2 = broker.lookupPubSubTopic( 'topic1' )

        expect(topic1).toBe( topic2 )

        let topic3 = broker.lookupPubSubTopic( 'topic2' )

        expect(topic1).not.toBe( topic3 )
    })

    test( 'get a Request Reply topic', () => {

        // expect(broker).not.toBeNull()
        expect( () => broker.lookupRequestReplyTopic( 'topic1' ) )
            .toThrow( "topic 'topic1' is not a RequestReplyTopic" )

        const topic1 = broker.lookupRequestReplyTopic( 'topic_reply_1' )

        expect(topic1).not.toBeNull()

        let topic2 = broker.lookupRequestReplyTopic( 'topic_reply_1' )

        expect(topic1).toBe( topic2 )

        let topic3 = broker.lookupRequestReplyTopic( 'topic_reply_2' )

        expect(topic1).not.toBe( topic3 )
    })


})

describe('evt-bus test pub sub', () => {

    test( 'post message in Pub Sub Topic', async () => {
        // expect.assertions(1)

        const topic1 = broker.lookupPubSubTopic<String>( 'topic1' );

        const postEvents = async ( ms:number ) => {
            await sleep( ms )
            topic1.post( 'event1' )
            await sleep( ms )
            topic1.post( 'event2' )
            await sleep( ms )
            topic1.post( 'event3' )
            await sleep( ms )
            topic1.done() 
        }

        const result = Array<String>()

        const waitFor = async ( numElements:number ) => {
            let step = 0
            for await ( const  e of topic1.observe() ) {
                // console.log( e )

                expect( e.topic$ ).toEqual( 'topic1' )
                
                result.push( e.data )
    
                if( numElements == ++step ) break
    
            }    
        }

        await Promise.all( [waitFor(2), waitFor(4), waitFor(1), postEvents(1000) ] )

        expect( result.length ).toEqual( 6 ) 

    })

});

describe('evt-bus test request reply topic', () => {

    test( 'post message in request reply topic', async () => {
        // expect.assertions(1)

        const topic_name = 'topic_reply_1'
        const topic1 = broker.lookupRequestReplyTopic<string, number>( topic_name );
        
        const postEvents = async ( ms:number ) => {
            await sleep( ms )
            let reply = await topic1.request( 'event1' )
            expect( reply ).toEqual( 0 )
            await sleep( ms )
            reply = await topic1.request( 'event2' )
            expect( reply ).toEqual( 1 )
            await sleep( ms )
            topic1.abort( new Error('abort by user') )
            // console.log( 'topic1.abort()' )
        }

        const result = Array<string>()

        const waitFor = async ( numElements:number ) => {
            let step = 0
            for await ( const  e of topic1.observe() ) {

                expect( e.topic$ ).toEqual( topic_name )
                
                if( !e.data ) break // no more events
                
                result.push( e.data )
                e.reply.done( step )
    
                if( numElements == ++step ) break
    
            }    
        }

        await Promise.all( [waitFor(2), postEvents(1000) ] )

        expect( result.length ).toEqual( 2 ) 

    })

    test( 'post message in request reply topic with timeout', async () => {
        // expect.assertions(1)

        const topic_name = 'topic_reply_2'
        const topic1 = broker.lookupRequestReplyTopic<string, number>( topic_name );

        const postEvents = async ( ms:number ) => {
            await sleep( ms )
            let reply = await topic1.request( 'event1' )
            expect( reply ).toEqual( 0 )
            await sleep( ms )
            topic1.abort( new Error('abort by user' ))
            // console.log( 'topic1.abort()' )
        }

        const result = Array<string>()

        const waitFor = async ( numElements:number ) => {
            let step = 0
            for await ( const  e of topic1.observe(JEST_TIMEOUT - 1000) ) {

                expect( e.topic$ ).toEqual( topic_name )
                // console.log( e )

                result.push( e.data )
                e.reply.done( step )
    
                if( numElements == ++step ) break
    
            }    
        }

        await Promise.all( [waitFor(2), postEvents(1000) ] )

        expect( result.length ).toEqual( 1 ) 

    })

    test( 'post message in request reply topic with multiple waitFor', async () => {
        // expect.assertions(1)
        const POST_TIMEOUT = 1000

        const topic_name = 'topic_reply_3'
        const topic = broker.lookupRequestReplyTopic<string, number>( topic_name );

        const result = Array<string>()

        const waitFor = async ( numElements:number ) => {
            let step = 0

            for await ( const  e of topic.observe(POST_TIMEOUT + 1) ) {
                // console.log( e )

                expect( e.topic$ ).toEqual( topic_name )

                result.push( e.data )
                
                e.reply.done( step )
    
                if( numElements == ++step ) break
    
            }    
        }

        try {
            await Promise.all( [waitFor(2), waitFor(1) ] )
        }
        catch( e ) {
            expect(e).toEqual('it is forbidden invoke waitFor more than one time on a RequestReplyTopic')

            await topic.abort( new Error('abort by user' ) )
        }

    })

})