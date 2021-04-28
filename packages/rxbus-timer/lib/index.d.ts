import { MessageBus } from "@soulsoftware/bus-core";
declare class TimerModule implements MessageBus.Module {
    readonly name = "TimerModule";
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}
export const Module: TimerModule;
