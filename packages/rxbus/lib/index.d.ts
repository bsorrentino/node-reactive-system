import { RequestOptions } from '@soulsoftware/rxmq';
/**
 * Namespace that contains **utilities functions**
 */
export declare namespace rxbus {
    /**
     * Observe for a data coming from **Topic** belong to a **Channel**
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    const observe: <T>(name: string, topic: string) => import("rxjs").Observable<import("@soulsoftware/rxmq").ChannelEvent<T>>;
    /**
     * _Observe_ for a data coming from **Topic** belong to a **Channel** and
     * _Reply_ to the provided Subject
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    const reply: <T, R>(name: string, topic: string) => import("rxjs").Observable<import("@soulsoftware/rxmq").ReqResChannelEvent<T, R>>;
    const subject: <T>(name: string, topic: string) => import("rxjs").Subject<T>;
    const request: <T, R>(name: string, options: Omit<RequestOptions<T, any, R>, "Subject">) => Promise<R>;
}
export * from './bus';
