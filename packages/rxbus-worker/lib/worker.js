"use strict";
exports.__esModule = true;
exports.Module = exports.Subjects = void 0;
var rxbus_1 = require("@soulsoftware/rxbus");
var worker_threads_1 = require("worker_threads");
var perf_hooks_1 = require("perf_hooks");
/**
 *  Run    = 'worker_run'
 */
exports.Subjects = {
    Run: 'worker_run'
};
var WorkerModule = /** @class */ (function () {
    function WorkerModule() {
        this.name = 'WORKER';
    }
    WorkerModule.prototype.onRegister = function (config) {
    };
    WorkerModule.prototype.onStart = function () {
        if (worker_threads_1.isMainThread) {
            console.log('Thread Worker file:', __filename);
            // this._worker = new Worker( './node_modules/@soulsoftware/rxbus-worker/lib/worker.js', {})
            this._worker = new worker_threads_1.Worker(__filename, {});
            var worker_channel$_1 = rxbus_1.Bus.workerChannel(this._worker);
            worker_channel$_1.observable.subscribe({
                next: (function (v) { return console.log(v); })
            });
            rxbus_1.Bus.channel(this.name).observe(exports.Subjects.Run).subscribe({
                next: (function (v) { return worker_channel$_1.subject.next(v.data); })
            });
        }
        else {
            var noop_1 = function () { };
            var entryName_1 = 'long for time';
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('message', function (input) {
                var obs = new perf_hooks_1.PerformanceObserver(function (list) {
                    var elapsed = list.getEntriesByName(entryName_1)[0].duration;
                    worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.postMessage({ data: { input: input.data, waitTime: elapsed } });
                    perf_hooks_1.performance.clearMarks();
                });
                obs.observe({ entryTypes: ['measure'] });
                perf_hooks_1.performance.mark('A');
                for (var i = 0; i < 1000 * 1000 * 1000; ++i)
                    noop_1();
                perf_hooks_1.performance.mark('B');
                perf_hooks_1.performance.measure(entryName_1, 'A', 'B');
                obs.disconnect();
            });
            worker_threads_1.parentPort === null || worker_threads_1.parentPort === void 0 ? void 0 : worker_threads_1.parentPort.on('close', function () {
                // send close message
            });
        }
    };
    WorkerModule.prototype.onStop = function () {
        var _a;
        (_a = this._worker) === null || _a === void 0 ? void 0 : _a.terminate();
    };
    return WorkerModule;
}());
var _module = new WorkerModule();
exports.Module = _module;
if (!worker_threads_1.isMainThread) {
    // console.trace( '====> START WORKER <===')
    try {
        _module.onStart();
    }
    catch (e) {
        console.error('error invoking worker thread', e);
    }
}
