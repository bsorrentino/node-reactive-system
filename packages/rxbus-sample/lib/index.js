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
var rxbus_1 = require("@soulsoftware/rxbus");
var rxbus_fastify_1 = require("@soulsoftware/rxbus-fastify");
var rxbus_timer_1 = require("@soulsoftware/rxbus-timer");
var rxbus_trace_1 = require("@soulsoftware/rxbus-trace");
var rxbus_worker_1 = require("@soulsoftware/rxbus-worker");
var rxjs_1 = require("rxjs");
/**
 * Route message from Timer to WebSocket
 *
 * MUST: Call it before bus start
 */
function routeTimerToWS() {
    var ws_route_name = 'WS_MAIN';
    var tick_observer$ = rxbus_1.Bus.channel(rxbus_timer_1.Module.name).observe(rxbus_timer_1.Subjects.Tick);
    var ws_event_subject$ = rxbus_1.Bus.channel(ws_route_name).subject(rxbus_fastify_1.Subjects.WSMessage);
    var ws_add_route_req$ = rxbus_1.Bus.replyChannel(rxbus_fastify_1.Module.name).request({ topic: rxbus_fastify_1.Subjects.WSAdd, data: ws_route_name });
    // function to listen on a WS channel  
    var ws_start_observe = function () {
        return tick_observer$.subscribe(function (tick) { return ws_event_subject$.next(tick.data); });
    };
    // Request register a new WS route  
    rxjs_1.firstValueFrom(ws_add_route_req$)
        .then(ws_start_observe)["catch"](function (e) { return console.error(e); });
    // ws_add_route_req$.subscribe( { 
    //         next: v => console.log( `next: ${FastifySubjects.WSAdd}`),
    //         error: e => console.error( `error: ${FastifySubjects.WSAdd}`, e),
    //         complete: ws_observe 
    //     })
}
function runWorkerModule() {
    var tick_observer$ = rxbus_1.Bus.channel(rxbus_timer_1.Module.name).observe(rxbus_timer_1.Subjects.Tick);
    var worker_subject$ = rxbus_1.Bus.channel(rxbus_worker_1.Module.name).subject(rxbus_worker_1.Subjects.Run);
    tick_observer$.pipe(operators_1.filter(function (_a) {
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
    rxbus_1.Bus.modules.register(rxbus_trace_1.Module);
    rxbus_1.Bus.modules.register(rxbus_timer_1.Module);
    rxbus_1.Bus.modules.register(rxbus_worker_1.Module);
    rxbus_1.Bus.modules.register(rxbus_fastify_1.Module, {
        port: 8888,
        requestTimeout: 5000
    });
    try {
        for (var _b = __values(rxbus_1.Bus.modules.names), _c = _b.next(); !_c.done; _c = _b.next()) {
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
    rxbus_1.Bus.modules.start();
}
main();
