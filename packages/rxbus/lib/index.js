"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bus = void 0;
const rxmq_1 = require("@soulsoftware/rxmq");
const assert = require("assert");
class BusModules {
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
class BusEngine {
    constructor() {
        this.modules = new BusModules();
    }
    // private uniqueId( prefix = '' ) {
    //     const dateString = Date.now().toString(36);
    //     const randomness = Math.random().toString(36).substr(2);
    //     return `${prefix}${dateString}${randomness}`
    // }
    channel(name) {
        return rxmq_1.default.channel(name);
    }
    replyChannel(name) {
        return rxmq_1.default.channel(name);
    }
    workerChannel(worker) {
        const uniqueId = `WORKER${worker.threadId}`;
        const ch = this.channel(uniqueId);
        const worker_message_out = ch.subject('WORKER_OUT');
        worker.on('message', value => worker_message_out.next(value));
        worker.on('error', err => worker_message_out.error(err));
        worker.on('exit', () => worker_message_out.complete());
        const worker_message_in = ch.subject('WORKER_IN');
        worker_message_in.subscribe(value => worker.postMessage(value));
        return {
            subject: worker_message_in,
            observable: worker_message_out.asObservable()
        };
    }
    get channelNames() {
        return rxmq_1.default.channelNames();
    }
}
exports.Bus = new BusEngine();
/*
export function NewChannel(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const name = `_${propertyKey}`

    Object.defineProperty( target, `_${propertyKey}`, {
        writable: false,
        value: new Subject<unknown>()
    })

    descriptor.get = () => target[name]
    
}

export function OnChannel(name: string) {

    return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {

        Bus.channel( name ).subscribe( { next: descriptor.value } )
        console.log( target, propertyKey, descriptor )
    };
  }
*/
