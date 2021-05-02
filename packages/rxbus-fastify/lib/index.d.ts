import * as bus from "@soulsoftware/bus-core";
export const Subjects: {
    WSSend: string;
    WSMessage: string;
    WSAdd: string;
    ServerStart: string;
    ServerClose: string;
};
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
