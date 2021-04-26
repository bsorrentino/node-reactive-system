import * as bus from 'bus-module';
import { Observable, Subject } from 'rxjs';

export declare namespace MessageBus {
    
    class Channels {
        private _channels;
        newChannel<T>(name: string): Subject<T>;
        channel<T>(name: string): Observable<T>;
    }
    class Modules {
        private _modules;
        registerModule(module: bus.Module): void;
        start(): void;
    }
    class Engine {
        readonly: Channels;
        readonly: Modules;
    }
}

declare module 'rxbus' {
    
    export const Bus: MessageBus.Engine;
}
