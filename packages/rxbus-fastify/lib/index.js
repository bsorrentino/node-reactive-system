"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.Module = exports.Subjects = void 0;
var rxbus = require("@bsorrentino/rxbus");
require("fastify-websocket");
require("@bsorrentino/rxmq");
var fastify_1 = require("fastify");
var operators_1 = require("rxjs/operators");
/**
 *  WSSend      = 'ws_send'
 *  WSMessage   = 'ws_message_out'
 *  WSMessageIn = 'ws_message_in',
 *  WSAdd       = 'ws_add'
 *  ServerStart = 'server_start'
 *  ServerClose = 'server_close'
 */
exports.Subjects = {
    WSSend: 'WS_SEND',
    WSMessage: 'WS_MESSAGE_OUT',
    WSMessageIn: 'WS_MESSAGE_IN',
    WSAdd: 'WS_ADD',
    ServerStart: 'SERVER_START',
    ServerClose: 'SERVER_CLOSE'
};
/**
 * Module to manage HTTP and WebSocket channels
 */
var FastifyModule = /** @class */ (function () {
    function FastifyModule() {
        this.server = (0, fastify_1["default"])({});
        this.name = "FASTIFY";
        this.config = {
            port: 3000,
            requestTimeout: 5000
        };
    }
    FastifyModule.prototype.setupWebSocketChannel = function (module) {
        var channelName = module;
        var messageSubject$ = rxbus.subject(channelName, exports.Subjects.WSMessageIn);
        var messageObserver$ = rxbus.observe(channelName, exports.Subjects.WSMessage);
        this.server.get("/".concat(this.name, "/channel/").concat(channelName, "/*"), { websocket: true }, function (connection /* SocketStream */, req /* FastifyRequest */) {
            connection.socket.on('message', function (message) { return messageSubject$.next(message); });
            messageObserver$.subscribe(function (message) {
                console.log('ws send', message);
                connection.socket.send(message);
            });
        });
    };
    /**
     *
     */
    FastifyModule.prototype.onRegister = function (config) {
        var _this = this;
        if (config)
            this.config = config;
        var httpRequest = rxbus.replyChannel(this.name).request;
        var rxp = new RegExp("/".concat(this.name, "/channel/([\\w]+)([?].+)?"));
        this.server.get("/".concat(this.name, "/channel/*"), function (request, reply) { return __awaiter(_this, void 0, void 0, function () {
            var cmd;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        cmd = rxp.exec(request.url);
                        if (cmd) {
                            httpRequest({ topic: cmd[1], data: request })
                                .pipe((0, operators_1.timeout)(this.config.requestTimeout || 5000))
                                .subscribe({
                                next: function (data) { return reply.send(data); },
                                error: function (err) { return reply.code(500).send(err); },
                                complete: function () { }
                            });
                        }
                        else {
                            reply.status(404).send('command not found!');
                        }
                        return [4 /*yield*/, reply];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        //
        // add Web Socket middleware
        //
        this.server.register(require('fastify-websocket'), {});
        //
        // Listen for adding Web Socket channel
        //
        rxbus.reply(this.name, exports.Subjects.WSAdd)
            .subscribe(function (_a) {
            var data = _a.data, replySubject = _a.replySubject;
            console.log('request add channel ', data);
            _this.setupWebSocketChannel(data);
            replySubject.next(true);
            replySubject.complete();
        });
    };
    FastifyModule.prototype.onStart = function () {
        var _this = this;
        this.server.listen(this.config.port || 3000, function (err, address) {
            if (err) {
                console.error(err);
                rxbus.subject(_this.name, exports.Subjects.ServerStart)
                    .error(err);
            }
            else {
                console.log("Server listening at ".concat(address));
                rxbus.subject(_this.name, exports.Subjects.ServerStart)
                    .next({ address: address });
            }
        });
    };
    FastifyModule.prototype.onStop = function () {
        var _this = this;
        this.server.close().then(function (v) {
            console.log('server closed!');
            rxbus.subject(_this.name, exports.Subjects.ServerClose)
                .complete();
        });
    };
    return FastifyModule;
}());
exports.Module = new FastifyModule();
