"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compareTopics = exports.BaseChannel = void 0;
var rxjs_1 = require("rxjs");
var operators_1 = require("rxjs/operators");
var subjects_1 = require("./rx/subjects");
// const channelName = Symbol('channel.name');
// const channelData = Symbol('channel.data');
/**
 * Rxmq channel class
 *
 */
var BaseChannel = /** @class */ (function () {
    /**
     *
     * @param name channel name
     */
    function BaseChannel(name) {
        var _this = this;
        /**
         * Instances of subjects
         * @type {Array}
         * @private
         */
        this.subjects = [];
        /**
        * Channel bus
        * @type {EndlessReplaySubject}
        * @private
        */
        this.channelBus = new subjects_1.EndlessReplaySubject();
        /**
         * Find a specific subject by given name
         * @param  {Array}                  subjects    Array of subjects to search in
         * @param  {String}                 name        Name to search for
         * @return {(EndlessSubject|void)}              Found subject or void
         */
        this.findSubjectByName = function (name) {
            return _this.subjects.find(function (s) { var _a; return name === ((_a = Object.getOwnPropertyDescriptor(s, 'name')) === null || _a === void 0 ? void 0 : _a.value); });
        };
        this._name = name;
    }
    Object.defineProperty(BaseChannel.prototype, "channelStream", {
        /**
         * Permanent channel bus stream as Observable
         * @type {Observable}
         * @private
         */
        get: function () {
            return this.channelBus;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(BaseChannel.prototype, "name", {
        /**
         * channel name
         */
        get: function () {
            return this._name;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Returns EndlessSubject representing given topic
     * @param  {String}         name           Topic name
     * @return {EndlessSubject}             EndlessSubject representing given topic
     * @example
     * const channel = rxmq.channel('test');
     * const subject = channel.subject('test.topic');
     */
    BaseChannel.prototype.subject = function (name, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.Subject, Subject = _c === void 0 ? subjects_1.EndlessSubject : _c;
        var s = this.findSubjectByName(name);
        if (!s) {
            // console.trace('add proxy for ', name);
            s = new Proxy(new Subject(), {
                get: function (target, propKey, receiver) {
                    if (propKey === 'next') {
                        var origMethod_1 = target[propKey];
                        return function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            var params = [];
                            if (typeof args[0] === 'string' ||
                                typeof args[0] === 'number' ||
                                typeof args[0] === 'boolean' ||
                                args[0] instanceof Date) { // if is primitive type
                                params.push({ channel: name, data: args[0] });
                            }
                            else if (args[0].topic$) { // if already contains topic attribute
                                params.push(args[0]);
                            }
                            else {
                                params.push({ channel: name, data: args[0] });
                            }
                            var result = origMethod_1.apply(target, params);
                            // console.log(name, propKey, JSON.stringify(params), JSON.stringify(result));
                            return result;
                        };
                    }
                    else
                        return Reflect.get(target, propKey, receiver);
                },
            });
            // s = new Subject();
            Object.defineProperty(s, 'name', { value: name, writable: false });
            this.subjects.push(s);
            this.channelBus.next(s);
        }
        return s;
    };
    /**
     * Get an Observable for specific set of topics
     * @param  {String}         name        Topic name / pattern
     * @return {Observable}                 Observable for given set of topics
     * @example
     * const channel = rxmq.channel('test');
     * channel.observe('test.topic')
     *        .subscribe((res) => { // default Observable subscription
     *            // handle results
     *        });
     */
    BaseChannel.prototype.observe = function (name) {
        // create new topic if it's plain text
        if (name.indexOf('#') === -1 && name.indexOf('*') === -1) {
            return this.subject(name);
        }
        // return stream
        return this.channelStream.pipe(operators_1.filter(function (obs) { return exports.compareTopics(obs.name, name); }), operators_1.mergeAll());
    };
    /**
     * Do a request that will be replied into returned AsyncSubject
     * Alias for '.request()' that uses single object as params
     * @param  {Object}  options                   Request options
     * @param  {String}  options.topic             Topic name
     * @param  {Any}     options.data              Request data
     * @param  {Object}  options.DefaultSubject    Response subject, defaults to AsyncSubject
     * @return {AsyncSubject}                      AsyncSubject that will dispatch the response
     * @example
     * const channel = rxmq.channel('test');
     * channel.requestTo({
     *     topic: 'test.topic',
     *     data: 'test data',
     * }).subscribe((response) => { // default Observable subscription
     *     // handle response
     * });
     */
    BaseChannel.prototype.request = function (options) {
        var topic = options.topic, data = options.data, subject = options.subject;
        var subj = this.findSubjectByName(topic);
        if (!subj) {
            console.warn("subject for " + topic + " not found!");
            return rxjs_1.NEVER;
        }
        // create reply subject
        var replySubject = subject !== null && subject !== void 0 ? subject : new rxjs_1.AsyncSubject();
        subj.next({
            topic$: topic,
            replySubject: replySubject,
            data: data
        });
        return replySubject.asObservable();
    };
    return BaseChannel;
}());
exports.BaseChannel = BaseChannel;
/**
 * Converts topic to search regex
 * @param  {String} topic   Topic name
 * @return {String}          Search regex
 * @private
 */
var topicToRegex = function (topic) {
    return "^" + topic.split('.').reduce(function (result, segment, index, arr) {
        var res = '';
        if (arr[index - 1]) {
            res = arr[index - 1] !== '#' ? '\\.\\b' : '\\b';
        }
        if (segment === '#') {
            res += '[\\s\\S]*';
        }
        else if (segment === '*') {
            res += '[^.]+';
        }
        else {
            res += segment;
        }
        return result + res;
    }, '') + "$";
};
/**
* Compares given topic with existing topic
* @param  {String}  topic         Topic name
* @param  {String}  existingTopic Topic name to compare to
* @return {Boolean}               Whether topic is included in existingTopic
* @example
* should(compareTopics('test.one.two', 'test.#')).equal(true);
* @private
*/
var compareTopics = function (topic, existingTopic) {
    // if no # or * found, do plain string matching
    if (existingTopic.indexOf('#') === -1 && existingTopic.indexOf('*') === -1) {
        return topic === existingTopic;
    }
    // otherwise do regex matching
    var pattern = topicToRegex(existingTopic);
    var rgx = new RegExp(pattern);
    return rgx.test(topic);
};
exports.compareTopics = compareTopics;
