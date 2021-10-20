import * as bus from '@bsorrentino/bus-core';
/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
}
/**
 *  Run    = 'worker_run'
 */
export declare const Subjects: {
    Run: string;
};
declare class WorkerModule implements bus.Module<Config> {
    readonly name = "WORKER";
    private _worker?;
    onRegister(config?: Config): void;
    onStart(): void;
    onStop(): void;
}
export declare const Module: WorkerModule;
export {};
