import * as bus from "@soulsoftware/bus-core";
declare class TraceModule implements bus.Module {
    readonly name = "TRACE";
    onStart(): void;
    onStop(): void;
}
export const Module: TraceModule;
