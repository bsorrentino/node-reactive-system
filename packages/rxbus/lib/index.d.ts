import { RequestOptions } from '@soulsoftware/rxmq';
export declare namespace rxbus {
    const observe: <T>(name: string, topic: string) => import("rxjs").Observable<import("@soulsoftware/rxmq").ChannelEvent<T>>;
    const observeAndReply: <T, R>(name: string, topic: string) => import("rxjs").Observable<import("@soulsoftware/rxmq").ReqResChannelEvent<T, R>>;
    const subject: <T>(name: string, topic: string) => import("rxjs").Subject<T>;
    const request: <T, R>(name: string, options: Omit<RequestOptions<T, any, R>, "Subject">) => Promise<R>;
}
export * from './bus';
