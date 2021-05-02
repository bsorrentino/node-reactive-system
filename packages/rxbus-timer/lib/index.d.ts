import * as bus from "@soulsoftware/bus-core";
export const Subjects: {
    Tick: string;
};
declare class TimerModule implements bus.Module {
    readonly name = "timer";
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}
export const Module: TimerModule;
