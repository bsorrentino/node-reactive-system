"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.request = exports.subject = exports.reply = exports.observe = exports.workerChannel = exports.replyChannel = exports.channel = exports.channelNames = exports.modules = exports.Modules = void 0;
const rxmq_1 = require("@soulsoftware/rxmq");
const rxjs_1 = require("rxjs");
const assert = require("assert");
/**
 * create new message bus
 */
const rxmq = new rxmq_1.Rxmq();
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
exports.Modules = Modules;
/**
 * global modules instance
 */
exports.modules = new Modules();
/**
 * get all names of the instantiated channels
 *
 * @returns
 */
const channelNames = () => rxmq.channelNames;
exports.channelNames = channelNames;
/**
 * get or create a standard Channel
 *
 * @param - Channel Id
 * @returns
 */
const channel = (name) => rxmq.channel(name);
exports.channel = channel;
/**
 * get or create a Request/Response Channel
 *
 * @param name - Channel Id
 * @returns
 */
const replyChannel = (name) => rxmq.channel(name);
exports.replyChannel = replyChannel;
/**
 * get or create a Channel conneted to a Worker Thread
 *
 * @param worker - Worker Thread
 * @returns
 */
const workerChannel = (worker) => {
    const uniqueId = `WORKER${worker.threadId}`;
    const channel$ = exports.channel(uniqueId);
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
exports.workerChannel = workerChannel;
/**
 * Observe for a data coming from **Topic** belong to a **Channel**
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
 */
const observe = (name, topic) => exports.channel(name).observe(topic);
exports.observe = observe;
/**
 * _Observe_ for a data coming from **Topic** belong to a **Channel** and
 * _Reply_ to the provided Subject
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns - [Rxjs Observable<T>](https://rxjs.dev/api/index/class/Observable)
 */
const reply = (name, topic) => exports.replyChannel(name).observe(topic);
exports.reply = reply;
/**
 * Set up an _Subject_(like an EventEmitter) to emit/observe data
 * data from **Topic** belong to a **Channel**
 *
 * @param name - Channel Id
 * @param topic - Topic Id
 * @returns  - [Subject](https://rxjs.dev/api/index/class/Subject)
 *
 */
const subject = (name, topic) => exports.channel(name).subject(topic);
exports.subject = subject;
/**
 * Send a request to a **Topic** belong a **Channel** and wait for Reply
 *
 * @param name - Channel Id
 * @param options
 * @returns
 */
const request = (name, options) => rxjs_1.firstValueFrom(exports.replyChannel(name).request(options));
exports.request = request;
