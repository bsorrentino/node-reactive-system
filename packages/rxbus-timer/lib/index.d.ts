import * as bus from "@soulsoftware/bus-core";
declare class TimerModule implements bus.Module {
    readonly name = "timer";
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}
export const Module: TimerModule;
