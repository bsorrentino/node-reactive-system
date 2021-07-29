import { NEVER, Observable, Subject } from 'rxjs';
import { filter, mergeAll } from 'rxjs/operators';

import { EndlessReplaySubject, EndlessSubject } from './rx/index';
import { compareTopics, findSubjectByName } from './utils/index';

export type RequestOptions<T,Res> = {
  topic: string
  data: T
  subject?: Subject<Res>
};

// const channelName = Symbol('channel.name');
// const channelData = Symbol('channel.data');
/**
 * Rxmq channel class
 * 
 */
export class BaseChannel<Req,Res,Event> {

  /**
   * Instances of subjects
   * @type {Array}
   * @private
   */
  private subjects:Array<Subject<any>> = []

   /**
   * Channel bus
   * @type {EndlessReplaySubject}
   * @private
   */
  private channelBus = new EndlessReplaySubject<any>();

  /**
   * Permanent channel bus stream as Observable
   * @type {Observable}
   * @private
   */
  private get channelStream() {
    return this.channelBus
  }

  /**
   * Returns EndlessSubject representing given topic
   * @param  {String}         name           Topic name
   * @return {EndlessSubject}             EndlessSubject representing given topic
   * @example
   * const channel = rxmq.channel('test');
   * const subject = channel.subject('test.topic');
   */
  subject(name: string, { Subject = EndlessSubject } = {}):Subject<Res> {
    let s = findSubjectByName(this.subjects, name);
    if (!s) {
      console.log('add proxy for ', name);
      s = new Proxy(new Subject<Res>(), {

        get(target, propKey, receiver) {

          if (propKey === 'next') {
            const origMethod = target[propKey];
            return  (...args: any[]) => {
              const params = [];
              if (
                typeof args[0] === 'string' ||
                typeof args[0] === 'number' ||
                typeof args[0] === 'boolean' ||
                args[0] instanceof Date
              ) {
                params.push({ channel: name, data: args[0] });
              } else {
                params.push({ channel: name, ...args[0] });
              }
              const result = origMethod.apply(target, <any>params);
              // console.log(name, propKey, JSON.stringify(params), JSON.stringify(result));
              return result;
            };
          } else 
          return Reflect.get(target, propKey, receiver);
        },
      });
      // s = new Subject();
      Object.defineProperty(s, 'name', { value: name, writable:false })
      
      this.subjects.push(s);
      this.channelBus.next(s);
    }
    return s
  }

  /**
   * Get an Observable for specific set of topics
   * @param  {String}         name        Topic name / pattern
   * @return {Observable}                 Observable for given set of topics
   * @example
   * const channel = rxmq.channel('test');
   * channel.observe('test.topic')
   *        .subscribe((res) => { // default Observable subscription
   *            // handle results
   *        });
   */
  observe(name: string):Observable<Event> {
    // create new topic if it's plain text
    if (name.indexOf('#') === -1 && name.indexOf('*') === -1) {
      return <any>this.subject(name);
    }
    // return stream
    return <any>this.channelStream.pipe(
                filter(obs => compareTopics(obs.name, name)),
                mergeAll() )
  }

  /**
   * Do a request that will be replied into returned AsyncSubject
   * Alias for '.request()' that uses single object as params
   * @param  {Object}  options                   Request options
   * @param  {String}  options.topic             Topic name
   * @param  {Any}     options.data              Request data
   * @param  {Object}  options.DefaultSubject    Response subject, defaults to AsyncSubject
   * @return {AsyncSubject}                      AsyncSubject that will dispatch the response
   * @example
   * const channel = rxmq.channel('test');
   * channel.requestTo({
   *     topic: 'test.topic',
   *     data: 'test data',
   * }).subscribe((response) => { // default Observable subscription
   *     // handle response
   * });
   */
   request(options: RequestOptions<Req, Res>): Observable<Res> {
    const { topic, data, subject } = options
    const subj = findSubjectByName(this.subjects, topic);
    if (!subj) {
      return NEVER;
    }

    // create reply subject
    const replySubject = subject ?? new Subject<Res>()
    subj.next({ replySubject, data });
    return replySubject;
  }

}

export type ChannelEvent<T> = { channel:string, data:T }

export type Channel<T> = BaseChannel<T,T,ChannelEvent<T>>;


export type ReqResChannelEvent<Req, Res> = ChannelEvent<Req> & { replySubject: Subject<Res> }

export type RequestResponseChannel<Req, Res> = BaseChannel<Req,Res,ReqResChannelEvent<Req,Res>>
  