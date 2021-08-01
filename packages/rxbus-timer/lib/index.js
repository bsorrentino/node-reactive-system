"use strict";
exports.__esModule = true;
exports.Module = exports.Subjects = void 0;
var rxbus = require("@soulsoftware/rxbus");
var rxjs_1 = require("rxjs");
/**
 *  Tick    = 'TICK'
 */
exports.Subjects = {
    Tick: 'TICK'
};
var TimerModule = /** @class */ (function () {
    function TimerModule() {
        this.name = 'TIMER';
        this.config = {
            period: 1000
        };
    }
    TimerModule.prototype.onRegister = function (config) {
        if (config)
            this.config = config;
    };
    TimerModule.prototype.onStart = function () {
        var emitter$ = rxbus.subject(this.name, exports.Subjects.Tick);
        this._subscription = rxjs_1.interval(this.config.period)
            // .pipe( tap( tick => console.log( `${this.name} emit `, tick )) )
            .subscribe(emitter$);
    };
    TimerModule.prototype.onStop = function () {
        if (this._subscription) {
            this._subscription.unsubscribe();
            this._subscription = undefined;
        }
    };
    return TimerModule;
}());
exports.Module = new TimerModule();
