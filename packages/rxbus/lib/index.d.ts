import * as bus from "@soulsoftware/bus-core";
import { Observable, Subject } from "rxjs";
declare class BusChannels {
    newChannel<T>(name: string): Subject<T>;
    channel<T>(name: string): Observable<T>;
    get names(): IterableIterator<string>;
}
declare class BusModules {
    registerModule(module: bus.Module): void;
    get names(): IterableIterator<string>;
    start(): void;
}
declare class BusEngine {
    readonly channels: BusChannels;
    readonly modules: BusModules;
}
export const Bus: BusEngine;
