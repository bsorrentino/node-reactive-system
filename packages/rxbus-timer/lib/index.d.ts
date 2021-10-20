import * as bus from '@bsorrentino/bus-core';
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
 *  Tick    = 'TICK'
 */
export declare const Subjects: {
    Tick: string;
};
declare class TimerModule implements bus.Module<Config> {
    readonly name = "TIMER";
    private config;
    private _subscription?;
    onRegister(config?: Config): void;
    onStart(): void;
    onStop(): void;
}
export declare const Module: TimerModule;
export {};
