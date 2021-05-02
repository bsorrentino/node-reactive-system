import * as bus from "@soulsoftware/bus-core";
declare class FastifyModule implements bus.Module {
    readonly name = "fastify";
    /**
     *
     */
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}
export const Module: FastifyModule;
