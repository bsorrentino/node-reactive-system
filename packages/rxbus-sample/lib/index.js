"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
exports.__esModule = true;
var operators_1 = require("rxjs/operators");
var rxbus = require("@soulsoftware/rxbus");
var rxbus_fastify_1 = require("@soulsoftware/rxbus-fastify");
var rxbus_timer_1 = require("@soulsoftware/rxbus-timer");
var rxbus_trace_1 = require("@soulsoftware/rxbus-trace");
var rxbus_worker_1 = require("@soulsoftware/rxbus-worker");
/**
 * Route message from Timer to WebSocket
 *
 * MUST: Call it before bus start
 */
function routeTimerToWS() {
    var ws_route_name = 'WS_MAIN';
    var tick_observer$ = rxbus.observe(rxbus_timer_1.Module.name, rxbus_timer_1.Subjects.Tick);
    var ws_event_subject$ = rxbus.subject(ws_route_name, rxbus_fastify_1.Subjects.WSMessage);
    // Request register a new WS route  
    rxbus.request(rxbus_fastify_1.Module.name, { topic: rxbus_fastify_1.Subjects.WSAdd, data: ws_route_name })
        .then(function () { return tick_observer$.subscribe(function (tick) { return ws_event_subject$.next(tick.data); }); })["catch"](function (e) { return console.error(e); });
}
function runWorkerModule() {
    var worker_subject$ = rxbus.subject(rxbus_worker_1.Module.name, rxbus_worker_1.Subjects.Run);
    rxbus.observe(rxbus_timer_1.Module.name, rxbus_timer_1.Subjects.Tick)
        .pipe(operators_1.filter(function (_a) {
        var data = _a.data;
        return data % 10 == 0;
    }))
        .subscribe({
        next: function (_a) {
            var data = _a.data;
            console.log('send tick to worker', data);
            worker_subject$.next(data);
        },
        error: function (err) { return console.error('worker error', err); }
    });
}
function main() {
    var e_1, _a;
    console.log('start');
    rxbus.modules.register(rxbus_trace_1.Module);
    rxbus.modules.register(rxbus_timer_1.Module);
    rxbus.modules.register(rxbus_worker_1.Module);
    rxbus.modules.register(rxbus_fastify_1.Module, {
        port: 8888,
        requestTimeout: 5000
    });
    try {
        for (var _b = __values(rxbus.modules.names), _c = _b.next(); !_c.done; _c = _b.next()) {
            var module_1 = _c.value;
            console.log("\"" + module_1 + "\"", 'registerd');
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (_c && !_c.done && (_a = _b["return"])) _a.call(_b);
        }
        finally { if (e_1) throw e_1.error; }
    }
    routeTimerToWS();
    runWorkerModule();
    rxbus.modules.start();
}
main();
