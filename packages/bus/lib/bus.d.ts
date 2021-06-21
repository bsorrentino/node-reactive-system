/// <reference types="node" />
import { EventEmitter } from "events";
export declare namespace Message {
    interface Subscription {
        event: string | symbol;
        listener: (...args: any[]) => void;
    }
    class ObservableChannel<T> {
        _emitter: EventEmitter;
        on(event: string | symbol, listener: (args: T) => void): Subscription;
        onAsync(event: string | symbol, listener: (args: T) => void): Subscription;
        off(subscription: Subscription): void;
    }
    class SubjectChannel<T> extends ObservableChannel<T> {
        emit(event: string | symbol, ...args: any[]): boolean;
    }
    export class Bus {
        private _channels;
        newChannel<T>(name: string): SubjectChannel<T>;
        channel<T>(name: string): ObservableChannel<T>;
    }
    export {};
}
export declare const Bus: Message.Bus;
