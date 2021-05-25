import {Channel, RequestResponseChannel} from './channel';
import EndlessSubject from './endlessSubject';
import EndlessReplaySubject from './endlessReplaySubject';

type ChannelType<T, R> = Channel<T> | RequestResponseChannel<T, R>;

type RxmqPlugin = Record<string,any>

declare namespace Rxmq {
  function channel<T extends ChannelType<U, V>, U, V>(name: String): T;

  function channelNames(): string[];

  function registerPlugin(plugin: RxmqPlugin): void;

  function registerChannelPlugin(plugin: RxmqPlugin): void;
}

export {Channel, RequestResponseChannel, EndlessSubject, EndlessReplaySubject};
export default Rxmq;
