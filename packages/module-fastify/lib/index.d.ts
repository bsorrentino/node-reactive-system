import { MessageBus } from "@soulsoftware/bus-module";
declare class FastifyModule implements MessageBus.Module {
    readonly name = "fastify";
    onRegister(): void;
    onStart(): void;
    onStop(): void;
}
export const Module: FastifyModule;

//# sourceMappingURL=index.d.ts.map
