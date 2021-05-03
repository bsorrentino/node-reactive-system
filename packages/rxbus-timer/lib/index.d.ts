import * as bus from "@soulsoftware/bus-core";
/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
    /**
     * The interval size in milliseconds.
     *
     * default 1000
     */
    period: number;
}
/**
 *  Tick    = 'tick'
 */
export const Subjects: {
    Tick: string;
};
declare class TimerModule implements bus.Module<Config> {
    readonly name = "timer";
    onRegister(config?: Config): void;
    onStart(): void;
    onStop(): void;
}
export const Module: TimerModule;
