"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rxbus = void 0;
const rxmq_1 = require("@soulsoftware/rxmq");
const rxjs_1 = require("rxjs");
const assert = require("assert");
/**
 * Namespace that contains **utilities functions**
 */
var rxbus;
(function (rxbus) {
    /**
     * Module Management
     */
    class Modules {
        constructor() {
            this._modules = new Map();
        }
        register(module, config) {
            assert.ok(!this._modules.has(module.name), `Module ${module.name} already exists!`);
            let result = {
                module: module,
                status: { started: false, paused: false }
            };
            this._modules.set(module.name, result);
            if (module.onRegister) {
                module.onRegister(config);
            }
        }
        get names() {
            return this._modules.keys();
        }
        start() {
            this._modules.forEach(m => {
                if (!m.status.started) {
                    if (m.module.onStart) {
                        m.module.onStart();
                    }
                    m.status.started = true;
                }
            });
        }
    }
    rxbus.Modules = Modules;
    /**
     * global modules instance
     */
    rxbus.modules = new Modules();
    /**
     * get all names of the instantiated channels
     *
     * @returns
     */
    rxbus.channelNames = () => rxmq_1.default.channelNames();
    /**
     * get or create a standard Channel
     *
     * @param - Channel Id
     * @returns
     */
    rxbus.channel = (name) => rxmq_1.default.channel(name);
    /**
     * get or create a Request/Response Channel
     *
     * @param name - Channel Id
     * @returns
     */
    rxbus.replyChannel = (name) => rxmq_1.default.channel(name);
    /**
     * get or create a Channel conneted to a Worker Thread
     *
     * @param worker - Worker Thread
     * @returns
     */
    rxbus.workerChannel = (worker) => {
        const uniqueId = `WORKER${worker.threadId}`;
        const channel$ = rxbus.channel(uniqueId);
        const worker_message_out = channel$.subject('WORKER_OUT');
        worker.on('message', value => worker_message_out.next(value));
        worker.on('error', err => worker_message_out.error(err));
        worker.on('exit', () => worker_message_out.complete());
        const worker_message_in = channel$.subject('WORKER_IN');
        worker_message_in.subscribe(value => worker.postMessage(value));
        return {
            subject: worker_message_in,
            observable: worker_message_out.asObservable()
        };
    };
    /**
     * Observe for a data coming from **Topic** belong to a **Channel**
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    rxbus.observe = (name, topic) => rxbus.channel(name).observe(topic);
    /**
     * _Observe_ for a data coming from **Topic** belong to a **Channel** and
     * _Reply_ to the provided Subject
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
     */
    rxbus.reply = (name, topic) => rxbus.replyChannel(name).observe(topic);
    /**
     * Set up an _Subject_(like an EventEmitter) to emit/observe data
     * data from **Topic** belong to a **Channel**
     *
     * @param name - Channel Id
     * @param topic - Topic Id
     * @returns  - [Subject](https://rxjs.dev/api/index/class/Subject)
     *
     */
    rxbus.subject = (name, topic) => rxbus.channel(name).subject(topic);
    /**
     * Send a request to a **Topic** belong a **Channel** and wait for Reply
     *
     * @param name - Channel Id
     * @param options
     * @returns
     */
    rxbus.request = (name, options) => rxjs_1.firstValueFrom(rxbus.replyChannel(name).request(options));
})(rxbus = exports.rxbus || (exports.rxbus = {}));
// export * from './bus'
