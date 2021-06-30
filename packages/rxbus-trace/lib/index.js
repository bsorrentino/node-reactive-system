"use strict";
exports.__esModule = true;
exports.Module = void 0;
var rxbus_1 = require("@soulsoftware/rxbus");
/*

Bright = "\x1b[1m"
Dim = "\x1b[2m"
Underscore = "\x1b[4m"
Blink = "\x1b[5m"

Hidden = "\x1b[8m"

FgBlack = "\x1b[30m"
FgRed = "\x1b[31m"
FgGreen = "\x1b[32m"
FgYellow = "\x1b[33m"
FgBlue = "\x1b[34m"
FgMagenta = "\x1b[35m"
FgWhite = "\x1b[37m"

BgBlack = "\x1b[40m"
BgRed = "\x1b[41m"
BgGreen = "\x1b[42m"
BgYellow = "\x1b[43m"
BgBlue = "\x1b[44m"
BgMagenta = "\x1b[45m"
BgCyan = "\x1b[46m"
BgWhite = "\x1b[47m"
*/
var FgCyan = "\x1b[36m";
var Reverse = "\x1b[7m";
var Reset = "\x1b[0m";
var TraceModule = /** @class */ (function () {
    function TraceModule() {
        this.name = "TRACE";
        this._subscriptions = [];
    }
    TraceModule.prototype.onStart = function () {
        console.log(this.name, 'start');
        var _loop_1 = function (c) {
            console.log("trace: subscribe on " + c);
            var trace = function (_a) {
                var channel = _a.channel, data = _a.data;
                return console.log(Reverse, "trace: got message from '" + c + "' on channel '" + channel + "' ==> ", data, Reset);
            };
            this_1._subscriptions.push(rxbus_1.rxbus.observe(c, "*").subscribe({ next: trace }));
        };
        var this_1 = this;
        for (var _i = 0, _a = rxbus_1.rxbus.channelNames(); _i < _a.length; _i++) {
            var c = _a[_i];
            _loop_1(c);
        }
    };
    TraceModule.prototype.onStop = function () {
        for (var _i = 0, _a = this._subscriptions; _i < _a.length; _i++) {
            var s = _a[_i];
            s.unsubscribe();
        }
        this._subscriptions = [];
    };
    return TraceModule;
}());
exports.Module = new TraceModule();
