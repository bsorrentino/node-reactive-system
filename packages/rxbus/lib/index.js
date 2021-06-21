"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Bus = void 0;
var assert = require("assert");
var rxmq_1 = require("@soulsoftware/rxmq");
var BusModules = /** @class */ (function () {
    function BusModules() {
        this._modules = new Map();
    }
    BusModules.prototype.register = function (module, config) {
        assert.ok(!this._modules.has(module.name), "Module " + module.name + " already exists!");
        var result = {
            module: module,
            status: { started: false, paused: false }
        };
        this._modules.set(module.name, result);
        if (module.onRegister) {
            module.onRegister(config);
        }
    };
    Object.defineProperty(BusModules.prototype, "names", {
        get: function () {
            return this._modules.keys();
        },
        enumerable: false,
        configurable: true
    });
    BusModules.prototype.start = function () {
        this._modules.forEach(function (m) {
            if (!m.status.started) {
                if (m.module.onStart) {
                    m.module.onStart();
                }
                m.status.started = true;
            }
        });
    };
    return BusModules;
}());
var BusEngine = /** @class */ (function () {
    function BusEngine() {
        this.modules = new BusModules();
    }
    // private uniqueId( prefix = '' ) {
    //     const dateString = Date.now().toString(36);
    //     const randomness = Math.random().toString(36).substr(2);
    //     return `${prefix}${dateString}${randomness}`
    // }
    BusEngine.prototype.channel = function (name) {
        return rxmq_1.default.channel(name);
    };
    BusEngine.prototype.replyChannel = function (name) {
        return rxmq_1.default.channel(name);
    };
    BusEngine.prototype.workerChannel = function (worker) {
        var uniqueId = "WORKER" + worker.threadId;
        var ch = this.channel(uniqueId);
        var worker_message_out = ch.subject('WORKER_OUT');
        worker.on('message', function (value) { return worker_message_out.next(value); });
        worker.on('error', function (err) { return worker_message_out.error(err); });
        worker.on('exit', function () { return worker_message_out.complete(); });
        var worker_message_in = ch.subject('WORKER_IN');
        worker_message_in.subscribe(function (value) { return worker.postMessage(value); });
        return {
            subject: worker_message_in,
            observable: worker_message_out.asObservable()
        };
    };
    Object.defineProperty(BusEngine.prototype, "channelNames", {
        get: function () {
            return rxmq_1.default.channelNames();
        },
        enumerable: false,
        configurable: true
    });
    return BusEngine;
}());
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
