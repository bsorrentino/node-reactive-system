import * as bus from "@soulsoftware/bus-core";
import { Channel, RequestResponseChannel } from "@soulsoftware/rxmq";
declare class BusChannels {
    channel<T>(name: string): Channel<T>;
    requestChannel<T, R>(name: string): RequestResponseChannel<T, R>;
    get names(): string[];
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
