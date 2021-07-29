import { Channel, RequestResponseChannel } from './channel';
export declare type ChannelType<T, R> = Channel<T> | RequestResponseChannel<T, R>;
/**
 * Rxmq message bus class
 * Represents a new Rxmq message bus.
 * Normally you'd just use a signleton returned by default, but it's also
 * possible to create a new instance of Rxmq should you need it.
 * @constructor
 * @example
 * import {Rxmq} from 'rxmq';
 * const myRxmq = new Rxmq();
*/
export declare class Rxmq {
    private channels;
    /**
     * Returns a channel names
     */
    channelNames(): string[];
    /**
     * Returns a channel for given name
     * @param  {String} name  Channel name
     * @return {Channel}      Channel object
     * @example
     * const testChannel = rxmq.channel('test');
     */
    channel<T extends ChannelType<U, V>, U, V>(name: string): T;
}
