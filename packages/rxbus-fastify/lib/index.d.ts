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
 *  WSSend      = 'ws_send'
 *  WSMessage   = 'ws_message_out'
 *  WSMessageIn = 'ws_message_in',
 *  WSAdd       = 'ws_add'
 *  ServerStart = 'server_start'
 *  ServerClose = 'server_close'
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
    readonly name = "FASTIFY";
    /**
     *
     */
    onRegister(config?: Config): void;
    onStart(): void;
    onStop(): void;
}
export const Module: FastifyModule;
