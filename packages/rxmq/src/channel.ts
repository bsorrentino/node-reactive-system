import { AsyncSubject, NEVER, Observable, Subject } from 'rxjs';
import { filter, mergeAll } from 'rxjs/operators';

import { EndlessReplaySubject, EndlessSubject } from './rx/subjects';

export type RequestOptions<T, Res> = {
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
export class BaseChannel<Req, Res, Event> {

  /**
   * Instances of subjects
   * @type {Array}
   * @private
   */
  private subjects: Array<Subject<any>> = []

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
   * Find a specific subject by given name
   * @param  {Array}                  subjects    Array of subjects to search in
   * @param  {String}                 name        Name to search for
   * @return {(EndlessSubject|void)}              Found subject or void
   */
  private findSubjectByName = (name: string) =>
    this.subjects.find(s => name === Object.getOwnPropertyDescriptor(s, 'name')?.value)

  /**
   * channel name
   */
  private _name:string

  /**
   * channel name
   */
  get name() {
    return this._name
  }  

  /**
   * 
   * @param name channel name
   */
  constructor(name: string) {
    this._name = name
  }

  /**
   * Returns EndlessSubject representing given topic
   * @param  {String}         name           Topic name
   * @return {EndlessSubject}             EndlessSubject representing given topic
   * @example
   * const channel = rxmq.channel('test');
   * const subject = channel.subject('test.topic');
   */
  subject(name: string, { Subject = EndlessSubject } = {}): Subject<Res> {
    let s = this.findSubjectByName(name);
    if (!s) {
      // console.trace('add proxy for ', name);
      s = new Proxy(new Subject<Res>(), {

        get(target, propKey, receiver) {

          if (propKey === 'next') {
            const origMethod = target[propKey];
            return (...args: any[]) => {
              const params = [];

              if (
                typeof args[0] === 'string' ||
                typeof args[0] === 'number' ||
                typeof args[0] === 'boolean' ||
                args[0] instanceof Date
              ) { // if is primitive type
                params.push({ topic$: name, data: args[0] });
              } else if( args[0].topic$ ) { // if already contains topic attribute
                params.push(args[0])
              }
              else {
                params.push({ topic$: name, data: args[0] });
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
      Object.defineProperty(s, 'name', { value: name, writable: false })

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
  observe(name: string): Observable<Event> {
    // create new topic if it's plain text
    if (name.indexOf('#') === -1 && name.indexOf('*') === -1) {
      return <any>this.subject(name);
    }
    // return stream
    return <any>this.channelStream.pipe(
      filter(obs => compareTopics(obs.name, name)),
      mergeAll())
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
   * channel.request({
   *     topic: 'test.topic',
   *     data: 'test data',
   * }).subscribe((response) => { // default Observable subscription
   *     // handle response
   * });
   */
  request(options: RequestOptions<Req, Res>): Observable<Res> {
    const { topic, data, subject } = options
    const subj: Subject<ReqResChannelEvent<Req, Res>> | undefined = this.findSubjectByName(topic);
    if (!subj) {
      console.warn(`subject for ${topic} not found!`)
      return NEVER;
    }

    // create reply subject
    const replySubject = subject ?? new AsyncSubject<Res>()
    subj.next({
      topic$:       topic,
      replySubject: replySubject,
      data:         data
    });
    return replySubject.asObservable();
  }

}

export type ChannelEvent<T> = { topic$: string, data: T }

export type Channel<T> = BaseChannel<T, T, ChannelEvent<T>>;


export type ReqResChannelEvent<Req, Res> = ChannelEvent<Req> & { replySubject: Subject<Res> }

export type RequestResponseChannel<Req, Res> = BaseChannel<Req, Res, ReqResChannelEvent<Req, Res>>


/**
 * Converts topic to search regex
 * @param  {String} topic   Topic name
 * @return {String}          Search regex
 * @private
 */
const topicToRegex = (topic: string): string =>
  `^${topic.split('.').reduce((result, segment, index, arr) => {
    let res = '';
    if (arr[index - 1]) {
      res = arr[index - 1] !== '#' ? '\\.\\b' : '\\b';
    }
    if (segment === '#') {
      res += '[\\s\\S]*';
    } else if (segment === '*') {
      res += '[^.]+';
    } else {
      res += segment;
    }
    return result + res;
  }, '')}$`;

/**
* Compares given topic with existing topic
* @param  {String}  topic         Topic name
* @param  {String}  existingTopic Topic name to compare to
* @return {Boolean}               Whether topic is included in existingTopic
* @example
* should(compareTopics('test.one.two', 'test.#')).equal(true);
* @private
*/
export const compareTopics = (topic: string, existingTopic: string) => {
  // if no # or * found, do plain string matching
  if (existingTopic.indexOf('#') === -1 && existingTopic.indexOf('*') === -1) {
    return topic === existingTopic;
  }
  // otherwise do regex matching
  const pattern = topicToRegex(existingTopic);
  const rgx = new RegExp(pattern);
  return rgx.test(topic);

};
