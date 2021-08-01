import { RequestOptions, RequestResponseChannel, Channel } from '@soulsoftware/rxmq';
import { Observable, Subject } from 'rxjs';
import { Worker } from 'worker_threads';
import * as bus from '@soulsoftware/bus-core';
/**
 * Worker Channel
 */
export declare type WorkerChannel<IN, OUT> = {
    subject: Subject<IN>;
    observable: Observable<OUT>;
};
/**
 * Module information
 */
export declare type ModuleInfo = {
    module: bus.Module;
    status: bus.ModuleStatus;
};
/**
 * Module Management
 */
export declare class Modules {
    private _modules;
    register<C extends bus.ModuleConfiguration>(module: bus.Module<C>, config?: C): void;
    get names(): IterableIterator<string>;
    start(): void;
}
/**
 * global modules instance
 */
export declare const modules: Modules;
/**
 * get all names of the instantiated channels
 *
 * @returns
 */
export declare const channelNames: () => string[];
/**
 * get or create a standard Channel
 *
 * @param - Channel Id
 * @returns
 */
export declare const channel: <T>(name: string) => Channel<T>;
/**
 * get or create a Request/Response Channel
 *
 * @param name - Channel Id
 * @returns
 */
export declare const replyChannel: <T, R>(name: string) => RequestResponseChannel<T, R>;
/**
 * get or create a Channel conneted to a Worker Thread
 *
 * @param worker - Worker Thread
 * @returns
 */
export declare const workerChannel: <IN, OUT>(worker: Worker) => WorkerChannel<IN, OUT>;
/**
 * Observe for a data coming from **Topic** belong to a **Channel**
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
 */
export declare const observe: <T>(name: string, topic: string) => Observable<import("@soulsoftware/rxmq").ChannelEvent<T>>;
/**
 * _Observe_ for a data coming from **Topic** belong to a **Channel** and
 * _Reply_ to the provided Subject
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
 */
export declare const reply: <T, R>(name: string, topic: string) => Observable<import("@soulsoftware/rxmq/lib/channel").ReqResChannelEvent<T, R>>;
/**
 * Set up an _Subject_(like an EventEmitter) to emit/observe data
 * data from **Topic** belong to a **Channel**
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns  - [Subject](https://rxjs.dev/api/index/class/Subject)
 *
 */
export declare const subject: <T>(name: string, topic: string) => Subject<T>;
/**
 * Send a request to a **Topic** belong a **Channel** and wait for Reply
 *
 * @param name - Channel Id
 * @param options
 * @returns
 */
export declare const request: <T, R>(name: string, options: Omit<RequestOptions<T, R>, "Subject">) => Promise<R>;
