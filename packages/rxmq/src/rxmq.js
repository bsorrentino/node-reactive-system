import Channel from './channel';

/**
 * Rxmq message bus class
 */
class Rxmq {
  /**
   * Represents a new Rxmq message bus.
   * Normally you'd just use a signleton returned by default, but it's also
   * possible to create a new instance of Rxmq should you need it.
   * @constructor
   * @example
   * import {Rxmq} from 'rxmq';
   * const myRxmq = new Rxmq();
   */
  constructor() {
    /**
     * Holds channels definitions
     * @type {Object}
     * @private
     */
    this.channels = {};
  }

  /**
   * Returns a channel names
   */
  channelNames() {
    return Object.keys(this.channels);
  }

  /**
   * Returns a channel for given name
   * @param  {String} name  Channel name
   * @return {Channel}      Channel object
   * @example
   * const testChannel = rxmq.channel('test');
   */
  channel(name = 'defaultRxmqChannel') {
    if (!this.channels[name]) {
      this.channels[name] = new Channel();
    }

    return this.channels[name];
  }
}

/**
 * Rxmq bus definition
 */
export default Rxmq;
