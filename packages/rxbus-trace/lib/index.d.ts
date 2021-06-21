import * as bus from '@soulsoftware/bus-core';
declare class TraceModule implements bus.Module {
    readonly name = "TRACE";
    private _subscriptions;
    onStart(): void;
    onStop(): void;
}
export declare const Module: TraceModule;
export {};
