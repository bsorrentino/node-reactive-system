import { Subject } from 'rxjs';
import { Channel, ChannelEvent, RequestResponseChannel } from '../src/channel';
import { Rxmq} from '../src/rxmq';

jest.setTimeout(5000*2)

const rxmq = new Rxmq()


describe('> channel()', () => {

    it('# should create new channel', () => {
      const channel = rxmq.channel('test');
      expect(channel).not.toBeNull()
    });

    it('# should create new subject with custom Subject', done => {
      const channel = rxmq.channel<Channel<boolean>,boolean>('customSubject');
      const topic = 'test'
      
      const subj = channel.subject(topic, { Subject: Subject });

      let calls = 0

      channel.observe(topic).subscribe({
        next: (ok) => {
          expect(ok.data).toBe(true)
          calls++
        },
        error: (e) => { throw e },
        complete: () => {
          expect(calls).toBe(2)        
          done()
        }
      });

      subj.next(true);
      subj.next(true);
      subj.complete();
    });

    it('# should create and subscribe to one-to-many subscription', done => {
      const channel = rxmq.channel<Channel<string>,string>('test');
      const topic = 'oneToMany'

      // test data
      const testMessage = 'test message';
      // subscribe
      const sub = channel.observe(topic).subscribe(item => {
        sub.unsubscribe();
        expect(item.data).toBe(testMessage);
        done()
      });

      channel.subject(topic).next(testMessage);
    });

    it('# should publish to multiple channels', done => {
      const multiChannel = rxmq.channel<Channel<string>,string>('multitest');
      const testData = 'testGlobalPush';
      
      let calls = 0
      const onData = (event:ChannelEvent<string>) => { 
        expect(event.data).toBe(testData)
        
        if( ++calls == 3 ) done()
      }

      multiChannel.observe('test.#').subscribe( onData )
      multiChannel.observe('test.*').subscribe( onData);
      multiChannel.observe('test.one').subscribe( onData );
      // send
      multiChannel.subject('test.one').next(testData);
    });

    it('# should publish to multiple channels', done => {
      const resubChan = rxmq.channel<Channel<string>,string>('resubtest');
      const testData = ['test', 'test2'];
      
      // generate first sub
      const sub = resubChan.observe('test.#').subscribe(event => {
        
        expect(event.data).toBe(testData[0]);
        sub.unsubscribe();

        // listen for second output
        resubChan.observe('test.#').subscribe (event2 => {
          expect(event2.data).toBe(testData[1]);
          done()
        });

        // trigger second output
        resubChan.subject('test.one').next(testData[1]);
      });
      // send
      resubChan.subject('test.one').next(testData[0]);
    });
   

    it( 'should not republish the same message multiple times on unsubscribing to a topic and resubscribing',
      done => {
        const chan = rxmq.channel<Channel<string>,string>('unsub-then-new-sub');

        const testData1 = 'test-data-1';

        const observedEventsFirstSub = Array<string>();

        // generate first sub
        const sub = chan.observe('test.#').subscribe(({data}) => observedEventsFirstSub.push(data));

        // publish, which should be consumed by sub
        chan.subject('test.one').next(testData1);

        expect(observedEventsFirstSub).toContain(testData1);

        sub.unsubscribe();

        const observedEventsSecondSub = Array<string>();

        chan.observe('test.#').subscribe(({data}) => {
          observedEventsSecondSub.push(data)
          done()
        });

        const testData2 = 'test-data-2';
        chan.subject('test.one').next(testData2);

        expect(observedEventsSecondSub).toContain(testData2);
        
      }
    );
 
    // Test for #25
    it('wildcard and non wildcard consumers should get events', done => {

      type Value = {value:number}
      const channel = rxmq.channel<Channel<Value>,Value>('wildcard-and-non-wildcard');

      const e1 = { value: 1 };
      const e2 = { value: 2 };

      const observedEventsObs1 = Array<Value>()
      const observedEventsObs2 = Array<Value>()
      const observedEventsObs3 = Array<Value>()
      const observedEventsPatternObs1 = Array<Value>()
      const observedEventsPatternObs2 = Array<Value>()
      const observedEventsPatternObs3 = Array<Value>()

      channel.observe('topic.publish').subscribe(e => observedEventsObs1.push(e.data));
      channel.observe('topic.publish').subscribe(e => observedEventsObs2.push(e.data));
      channel.observe('topic.publish').subscribe(e => observedEventsObs3.push(e.data));
      channel.observe('topic.*').subscribe(e => observedEventsPatternObs1.push(e.data));
      channel.observe('topic.*').subscribe(e => observedEventsPatternObs2.push(e.data));
      channel.observe('topic.*').subscribe(e => {
        observedEventsPatternObs3.push(e.data)
        if( observedEventsPatternObs3.length === 2 ) {
          done()
        }
      });

      channel.subject('topic.publish').next(e1);
      channel.subject('topic.publish').next(e2);

      const inputEvents = [e1, e2];
      expect(observedEventsObs1).toEqual( expect.arrayContaining(inputEvents) );
      expect(observedEventsObs2).toEqual(inputEvents);
      expect(observedEventsObs3).toEqual(inputEvents);
      expect(observedEventsPatternObs1).toEqual(inputEvents);
      expect(observedEventsPatternObs2).toEqual(inputEvents);
      expect(observedEventsPatternObs3).toEqual(inputEvents);
  
    });

    it('# should allow dispatching several errors', done => {

      const channel = rxmq.channel<Channel<boolean>,boolean>('mutlierror')
      const topic = 'test'

      let err = 0
      
      channel.observe(topic).subscribe({
        next: (event) => {
          // console.log('next', event)
          expect(event.data).toBe(true) 
          expect(err).toBe(3)
          done()
        },
        error: (e) => {
          // console.log( 'error', err)
          expect(e).not.toBeNull()
          err++
        }

      });

      const subject = channel.subject(topic);
      subject.error(new Error('test'));
      subject.error(new Error('test 2'));
      subject.error(new Error('test 3'));
      subject.next(true);
    
    });

    // Request-response tests
    it('# should create one-to-one subscription', done => {

      const channel     = rxmq.channel<RequestResponseChannel<string, string>, string,string>('request');
      const topic       = 'request-reply';
      const testRequest = 'test request';
      const testReply   = 'test reply';

      channel.observe(topic).subscribe( ( { data, replySubject }) => {
        expect(data).toBe(testRequest);
        replySubject.next(testReply);
        replySubject.complete();
      });
      
      channel.request({ topic, data: testRequest }).subscribe(replyData => {
        expect(replyData).toBe(testReply)
        done()
      });
    });
 
    it('# should create one-to-one subscription with custom reply subject', done => {
      const channel = rxmq.channel<RequestResponseChannel<string, string>, string,string>('request');

      const topic = 'custom-request-reply';
      const testRequest = 'test request';
      const testReply = ['test reply', 'test reply 2', 'test reply 3'];

      channel.observe(topic).subscribe(({ replySubject }) => {
        testReply.map(item => replySubject.next(item));
        replySubject.complete();
      });

      // test reply
      const fullReply = Array<string>();

      channel.request({ topic:topic, data: testRequest, subject: new Subject<string>() }).subscribe({
        next: (replyData) => {
          fullReply.push(replyData);
        },
        error: (e) => {
          throw e;
        },
        complete: () => {
          fullReply.map((item, i) => expect(testReply[i]).toBe(item));
          done()
        }
      });
    });

});
