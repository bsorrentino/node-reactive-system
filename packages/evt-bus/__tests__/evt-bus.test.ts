'use strict';

import { Broker } from "../src/broker";

const sleep = (m:number) => new Promise(r => setTimeout(r, m))


const broker = new Broker()


describe('evt-bus test pub sub', () => {
    jest.setTimeout(10000)

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


    
    test( 'post message in Pub Sub Topic', async () => {
        // expect.assertions(1)

        const topic1 = broker.lookupPubSubTopic<String>( 'topic1' );

        setTimeout( () => {
            topic1.post( 'event1' )
            topic1.post( 'event2' )
            topic1.post( 'event3' )
        }, 3000 )

        const result = Array<String>()

        const waitFor = async () => {
            let step = 0
            for await ( const  e of topic1.observe() ) {

                expect( e.topic$ ).toEqual( 'topic1' )
                console.log( e )
                result.push( e.data )
    
                if( ++step == 2 ) {
                    break
                }
    
            }    
        }

        await Promise.all( [waitFor(), waitFor(), waitFor()] )

        expect( result.length ).toEqual( 6 ) 

        

    })


});
