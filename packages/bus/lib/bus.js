"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
exports.Bus = exports.Message = void 0;
var assert = require("assert");
var events_1 = require("events");
var Message;
(function (Message) {
    var ObservableChannel = /** @class */ (function () {
        function ObservableChannel() {
            this._emitter = new events_1.EventEmitter();
        }
        ObservableChannel.prototype.on = function (event, listener) {
            this._emitter.on(event, listener);
            return { event: event, listener: listener };
        };
        ObservableChannel.prototype.onAsync = function (event, listener) {
            var asyncListener = function (args) { return setImmediate(function () { return listener(args); }); };
            this._emitter.on(event, asyncListener);
            return { event: event, listener: asyncListener };
        };
        ObservableChannel.prototype.off = function (subscription) {
            this._emitter.off(subscription.event, subscription.listener);
        };
        return ObservableChannel;
    }());
    var SubjectChannel = /** @class */ (function (_super) {
        __extends(SubjectChannel, _super);
        function SubjectChannel() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        SubjectChannel.prototype.emit = function (event) {
            var args = [];
            for (var _i = 1; _i < arguments.length; _i++) {
                args[_i - 1] = arguments[_i];
            }
            return this._emitter.emit(event, args);
        };
        return SubjectChannel;
    }(ObservableChannel));
    var Bus = /** @class */ (function () {
        function Bus() {
            this._channels = new Map();
        }
        Bus.prototype.newChannel = function (name) {
            assert.ok(!this._channels.has(name), "Channel ".concat(name, " already exists!"));
            var result = new SubjectChannel();
            this._channels.set(name, result);
            return result;
        };
        Bus.prototype.channel = function (name) {
            assert.ok(this._channels.has(name), "Channel ".concat(name, " doesn't exists!"));
            return this._channels.get(name);
        };
        return Bus;
    }());
    Message.Bus = Bus;
})(Message = exports.Message || (exports.Message = {}));
exports.Bus = new Message.Bus();
