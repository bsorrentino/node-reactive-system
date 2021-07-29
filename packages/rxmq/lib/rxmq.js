"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rxmq = void 0;
var channel_1 = require("./channel");
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
var Rxmq = /** @class */ (function () {
    function Rxmq() {
        this.channels = {};
    }
    Object.defineProperty(Rxmq.prototype, "channelNames", {
        /**
         * Returns a channel names
         */
        get: function () {
            return Object.keys(this.channels);
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns a channel for given name
     * @param  {String} name  Channel name
     * @return {Channel}      Channel object
     * @example
     * const testChannel = rxmq.channel('test');
     */
    Rxmq.prototype.channel = function (name) {
        if (!this.channels[name]) {
            this.channels[name] = new channel_1.BaseChannel();
        }
        return this.channels[name];
    };
    return Rxmq;
}());
exports.Rxmq = Rxmq;
