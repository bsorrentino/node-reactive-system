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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndlessSubject = void 0;
/* eslint no-param-reassign: [2, {"props": false}] */
var rxjs_1 = require("rxjs");
/**
 * EndlessSubject extension of Rx.Subject.
 * This is pretty hacky, but so far I'd found no better way of having
 * Subjects that do no close on multicasted stream completion and on multiple errors.
 * For documentation refer to
 * [Rx.Subject docs](@link https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/subject.md).
 * The only difference is that EndlessSubject never triggers '.complete()' and
 * does not closes observers on errors (thus allowing to continuously dispatch them).
 */
var EndlessSubject = /** @class */ (function (_super) {
    __extends(EndlessSubject, _super);
    function EndlessSubject() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * Dummy method override to prevent execution and Rx.Observable completion
     * @return {void}
     */
    EndlessSubject.prototype.complete = function () { };
    /**
     * Override of error method that prevents stopping that Rx.Observer
     * @param  {Error} error  - Error to be dispatched
     * @return {void}
     */
    EndlessSubject.prototype.error = function (error) {
        this.thrownError = error;
        // dispatch to all observers
        // eslint-disable-next-line prettier/prettier
        this.observers.forEach(function (os) { return os.error(error); });
        // THERE IS AN ERROR ON ORIGINAL CODE BELOW
        // this.observers.forEach(os => {
        //   // dispatch directly to destination
        //   os.destination._error.call(os.destination._context, error);
        // });
    };
    return EndlessSubject;
}(rxjs_1.Subject));
exports.EndlessSubject = EndlessSubject;
