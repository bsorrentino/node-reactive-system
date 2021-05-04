import { Worker } from "worker_threads";
import * as bus from "@soulsoftware/bus-core";
import { Channel, RequestResponseChannel } from "@soulsoftware/rxmq";
import { Observable, Subject } from "rxjs";
type WorkerChannel<IN, OUT> = {
    in: Observable<IN>;
    out: Subject<OUT>;
};
declare class BusChannels {
    channel<T>(name: string): Channel<T>;
    replyChannel<T, R>(name: string): RequestResponseChannel<T, R>;
    workerChannel<IN, OUT>(name: string, worker: Worker): WorkerChannel<IN, OUT>;
    get names(): string[];
}
declare class BusModules {
    register<C extends bus.ModuleConfiguration>(module: bus.Module<C>, config?: C): void;
    get names(): IterableIterator<string>;
    start(): void;
}
declare class BusEngine {
    readonly channels: BusChannels;
    readonly modules: BusModules;
}
export const Bus: BusEngine;
