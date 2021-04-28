import * as bus from '@soulsoftware/bus-core';
import { Observable, Subject } from 'rxjs';

declare namespace MessageBus {
    class Channels {
        newChannel<T>(name: string): Subject<T>
        channel<T>(name: string): Observable<T>
        get channelNames():IterableIterator<string> 
    }
    class Modules {
        registerModule(module: bus.Module): void
        start(): void
    }
    class Engine {
        readonly channels: Channels;
        readonly modules: Modules;
    }
}

export declare const Bus: MessageBus.Engine;
