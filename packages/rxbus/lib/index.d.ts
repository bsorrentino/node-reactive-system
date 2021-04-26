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
        readonly channels: Channels;
        readonly modules: Modules;
    }
}
export declare const Bus: MessageBus.Engine;
