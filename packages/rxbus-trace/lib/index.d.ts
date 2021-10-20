import * as bus from '@bsorrentino/bus-core';
declare class TraceModule implements bus.Module {
    readonly name = "TRACE";
    private _subscriptions;
    onStart(): void;
    onStop(): void;
}
export declare const Module: TraceModule;
export {};
