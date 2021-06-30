"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rxbus = void 0;
const bus_1 = require("./bus");
const rxjs_1 = require("rxjs");
/**
 * Namespace that contains **utilities functions**
 */
var rxbus;
(function (rxbus) {
    /**
     * Observe for a data coming from **Topic** belong to a **Channel**
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    rxbus.observe = (name, topic) => bus_1.Bus.channel(name).observe(topic);
    /**
     * _Observe_ for a data coming from **Topic** belong to a **Channel** and
     * _Reply_ to the provided Subject
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    rxbus.reply = (name, topic) => bus_1.Bus.replyChannel(name).observe(topic);
    rxbus.subject = (name, topic) => bus_1.Bus.channel(name).subject(topic);
    rxbus.request = (name, options) => rxjs_1.firstValueFrom(bus_1.Bus.replyChannel(name).request(options));
})(rxbus = exports.rxbus || (exports.rxbus = {}));
__exportStar(require("./bus"), exports);
