import { Observable, Subject } from 'rxjs';
import { EndlessSubject } from './rx/subjects';
export declare type RequestOptions<T, Res> = {
    topic: string;
    data: T;
    subject?: Subject<Res>;
};
/**
 * Rxmq channel class
 *
 */
export declare class BaseChannel<Req, Res, Event> {
    /**
     * Instances of subjects
     * @type {Array}
     * @private
     */
    private subjects;
    /**
    * Channel bus
    * @type {EndlessReplaySubject}
    * @private
    */
    private channelBus;
    /**
     * Permanent channel bus stream as Observable
     * @type {Observable}
     * @private
     */
    private get channelStream();
    /**
     * Find a specific subject by given name
     * @param  {Array}                  subjects    Array of subjects to search in
     * @param  {String}                 name        Name to search for
     * @return {(EndlessSubject|void)}              Found subject or void
     */
    private findSubjectByName;
    /**
     * channel name
     */
    private _name;
    /**
     * channel name
     */
    get name(): string;
    /**
     *
     * @param name channel name
     */
    constructor(name: string);
    /**
     * Returns EndlessSubject representing given topic
     * @param  {String}         name           Topic name
     * @return {EndlessSubject}             EndlessSubject representing given topic
     * @example
     * const channel = rxmq.channel('test');
     * const subject = channel.subject('test.topic');
     */
    subject(name: string, { Subject }?: {
        Subject?: typeof EndlessSubject | undefined;
    }): Subject<Res>;
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
    observe(name: string): Observable<Event>;
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
    request(options: RequestOptions<Req, Res>): Observable<Res>;
}
export declare type ChannelEvent<T> = {
    topic$: string;
    data: T;
};
export declare type Channel<T> = BaseChannel<T, T, ChannelEvent<T>>;
export declare type ReqResChannelEvent<Req, Res> = ChannelEvent<Req> & {
    replySubject: Subject<Res>;
};
export declare type RequestResponseChannel<Req, Res> = BaseChannel<Req, Res, ReqResChannelEvent<Req, Res>>;
/**
* Compares given topic with existing topic
* @param  {String}  topic         Topic name
* @param  {String}  existingTopic Topic name to compare to
* @return {Boolean}               Whether topic is included in existingTopic
* @example
* should(compareTopics('test.one.two', 'test.#')).equal(true);
* @private
*/
export declare const compareTopics: (topic: string, existingTopic: string) => boolean;
