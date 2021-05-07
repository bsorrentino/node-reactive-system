import * as bus from "@soulsoftware/bus-core";
/**
 * Configuration parameters
 */
export interface Config extends bus.ModuleConfiguration {
    /**
     * server port
     *
     * default 3000
     */
    port: number;
    /**
     * request timeout in ms
     *
     * default 5000
     */
    requestTimeout: number;
}
/**
 *  WSSend      = 'ws.send'
 *  WSMessage   = 'ws.message.out'
 *  WSMessageIn = 'ws.message.in',
 *  WSAdd       = 'ws.add'
 *  ServerStart = 'server.start'
 *  ServerClose = 'server.close'
 */
export const Subjects: {
    WSSend: string;
    WSMessage: string;
    WSMessageIn: string;
    WSAdd: string;
    ServerStart: string;
    ServerClose: string;
};
/**
 * Module to manage HTTP and WebSocket channels
 */
declare class FastifyModule implements bus.Module<Config> {
    readonly name = "fastify";
    /**
     *
     */
    onRegister(config?: Config): void;
    onStart(): void;
    onStop(): void;
}
export const Module: FastifyModule;
