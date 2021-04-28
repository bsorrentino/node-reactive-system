import { MessageBus } from "@soulsoftware/bus-core";
declare class TraceModule implements MessageBus.Module {
    readonly name = "TraceModule";
    onStart(): void;
    onStop(): void;
}
export const Module: TraceModule;
