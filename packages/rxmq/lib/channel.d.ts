import { Observable, Subject } from 'rxjs';
import { EndlessSubject } from './rx/index';
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
     * channel.requestTo({
     *     topic: 'test.topic',
     *     data: 'test data',
     * }).subscribe((response) => { // default Observable subscription
     *     // handle response
     * });
     */
    request(options: RequestOptions<Req, Res>): Observable<Res>;
}
export declare type ChannelEvent<T> = {
    channel: string;
    data: T;
};
export declare type Channel<T> = BaseChannel<T, T, ChannelEvent<T>>;
export declare type ReqResChannelEvent<Req, Res> = ChannelEvent<Req> & {
    replySubject: Subject<Res>;
};
export declare type RequestResponseChannel<Req, Res> = BaseChannel<Req, Res, ReqResChannelEvent<Req, Res>>;
