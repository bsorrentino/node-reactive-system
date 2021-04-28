import { MessageBus } from "@soulsoftware/bus-core";
import { Observable, Subject } from "rxjs";
declare class BusChannels {
    newChannel<T>(name: string): Subject<T>;
    channel<T>(name: string): Observable<T>;
    get channelNames(): IterableIterator<string>;
}
declare class BusModules {
    registerModule(module: MessageBus.Module): void;
    start(): void;
}
declare class BusEngine {
    readonly channels: BusChannels;
    readonly modules: BusModules;
}
export const Bus: BusEngine;
