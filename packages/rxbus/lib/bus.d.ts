/// <reference types="node" />
import { Worker } from 'worker_threads';
import * as bus from '@soulsoftware/bus-core';
import { Channel, RequestResponseChannel } from '@soulsoftware/rxmq';
import { Observable, Subject } from 'rxjs';
/**
 * Worker Channel
 *
 */
export declare type WorkerChannel<IN, OUT> = {
    subject: Subject<IN>;
    observable: Observable<OUT>;
};
export declare type ModuleInfo = {
    module: bus.Module;
    status: bus.ModuleStatus;
};
export declare class BusModules {
    private _modules;
    register<C extends bus.ModuleConfiguration>(module: bus.Module<C>, config?: C): void;
    get names(): IterableIterator<string>;
    start(): void;
}
export declare class BusEngine {
    readonly modules: BusModules;
    channel<T>(name: string): Channel<T>;
    replyChannel<T, R>(name: string): RequestResponseChannel<T, R>;
    workerChannel<IN, OUT>(worker: Worker): WorkerChannel<IN, OUT>;
    get channelNames(): string[];
}
export declare const Bus: BusEngine;
