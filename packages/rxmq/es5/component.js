(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('rxjs'), require('rxjs/operators')) :
  typeof define === 'function' && define.amd ? define(['exports', 'rxjs', 'rxjs/operators'], factory) :
  (global = global || self, factory(global.rxmq = {}, global.rxjs, global.operators));
}(this, (function (exports, rxjs, operators) { 'use strict';

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);

    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      if (enumerableOnly) symbols = symbols.filter(function (sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      });
      keys.push.apply(keys, symbols);
    }

    return keys;
  }

  function _objectSpread2(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};

      if (i % 2) {
        ownKeys(Object(source), true).forEach(function (key) {
          _defineProperty(target, key, source[key]);
        });
      } else if (Object.getOwnPropertyDescriptors) {
        Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
      } else {
        ownKeys(Object(source)).forEach(function (key) {
          Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
        });
      }
    }

    return target;
  }

  function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function");
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        writable: true,
        configurable: true
      }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
  }

  function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
      return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
  }

  function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
      o.__proto__ = p;
      return o;
    };

    return _setPrototypeOf(o, p);
  }

  function _isNativeReflectConstruct() {
    if (typeof Reflect === "undefined" || !Reflect.construct) return false;
    if (Reflect.construct.sham) return false;
    if (typeof Proxy === "function") return true;

    try {
      Date.prototype.toString.call(Reflect.construct(Date, [], function () {}));
      return true;
    } catch (e) {
      return false;
    }
  }

  function _assertThisInitialized(self) {
    if (self === void 0) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return self;
  }

  function _possibleConstructorReturn(self, call) {
    if (call && (typeof call === "object" || typeof call === "function")) {
      return call;
    }

    return _assertThisInitialized(self);
  }

  function _createSuper(Derived) {
    var hasNativeReflectConstruct = _isNativeReflectConstruct();

    return function _createSuperInternal() {
      var Super = _getPrototypeOf(Derived),
          result;

      if (hasNativeReflectConstruct) {
        var NewTarget = _getPrototypeOf(this).constructor;

        result = Reflect.construct(Super, arguments, NewTarget);
      } else {
        result = Super.apply(this, arguments);
      }

      return _possibleConstructorReturn(this, result);
    };
  }

  /**
   * EndlessSubject extension of Rx.Subject.
   * This is pretty hacky, but so far I'd found no better way of having
   * Subjects that do no close on multicasted stream completion and on multiple errors.
   * For documentation refer to
   * [Rx.Subject docs](@link https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/subject.md).
   * The only difference is that EndlessSubject never triggers '.complete()' and
   * does not closes observers on errors (thus allowing to continuously dispatch them).
   */

  var EndlessSubject = /*#__PURE__*/function (_Subject) {
    _inherits(EndlessSubject, _Subject);

    var _super = _createSuper(EndlessSubject);

    function EndlessSubject() {
      _classCallCheck(this, EndlessSubject);

      return _super.apply(this, arguments);
    }

    _createClass(EndlessSubject, [{
      key: "complete",

      /**
       * Dummy method override to prevent execution and Rx.Observable completion
       * @return {void}
       */
      value: function complete() {}
      /**
       * Override of error method that prevents stopping that Rx.Observer
       * @param  {Error} error  - Error to be dispatched
       * @return {void}
       */

    }, {
      key: "error",
      value: function error(_error) {
        this.thrownError = _error; // dispatch to all observers
        // eslint-disable-next-line prettier/prettier

        this.observers.forEach(function (os) {
          return os.error(_error);
        }); // THERE IS AN ERROR ON ORIGINAL CODE BELOW
        // this.observers.forEach(os => {
        //   // dispatch directly to destination
        //   os.destination._error.call(os.destination._context, error);
        // });
      }
    }]);

    return EndlessSubject;
  }(rxjs.Subject);

  /**
   * EndlessReplaySubject extension of ReplaySubject.
   * This is pretty hacky, but so far I'd found no better way of having
   * Subjects that do no close on multicasted stream completion and on multiple errors.
   * For documentation refer to
   * [ReplaySubject doc](@link https://github.com/Reactive-Extensions/RxJS/blob/master/doc/api/subjects/replaysubject.md).
   * The only difference is that EndlessReplaySubject never triggers '.complete()' and
   * does not closes observers on errors (thus allowing to continuously dispatch them).
   */

  var EndlessReplaySubject = /*#__PURE__*/function (_ReplaySubject) {
    _inherits(EndlessReplaySubject, _ReplaySubject);

    var _super = _createSuper(EndlessReplaySubject);

    function EndlessReplaySubject() {
      _classCallCheck(this, EndlessReplaySubject);

      return _super.apply(this, arguments);
    }

    _createClass(EndlessReplaySubject, [{
      key: "complete",

      /**
       * Dummy method override to prevent execution and Observable completion
       * @return {void}
       */
      value: function complete() {}
      /**
       * Override of error method that prevents stopping that Observer
       * @param  {Error} error  - Error to be dispatched
       * @return {void}
       */

    }, {
      key: "error",
      value: function error(_error) {
        // store error
        this.error = _error; // dispatch to all observers

        this.observers.forEach(function (os) {
          // dispatch
          os.error(_error); // mark observer as not stopped

          os.isStopped = false;
        });
      }
    }]);

    return EndlessReplaySubject;
  }(rxjs.ReplaySubject);

  /**
   * Converts topic to search regex
   * @param  {String} topic   Topic name
   * @return {Regex}          Search regex
   * @private
   */
  var topicToRegex = function topicToRegex(topic) {
    return "^".concat(topic.split('.').reduce(function (result, segment, index, arr) {
      var res = '';

      if (arr[index - 1]) {
        res = arr[index - 1] !== '#' ? '\\.\\b' : '\\b';
      }

      if (segment === '#') {
        res += '[\\s\\S]*';
      } else if (segment === '*') {
        res += '[^.]+';
      } else {
        res += segment;
      }

      return result + res;
    }, ''), "$");
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


  var compareTopics = function compareTopics(topic, existingTopic) {
    // if no # or * found, do plain string matching
    if (existingTopic.indexOf('#') === -1 && existingTopic.indexOf('*') === -1) {
      return topic === existingTopic;
    } // otherwise do regex matching


    var pattern = topicToRegex(existingTopic);
    var rgx = new RegExp(pattern);
    var result = rgx.test(topic);
    return result;
  };

  /**
   * Find a specific subject by given name
   * @param  {Array}                  subjects    Array of subjects to search in
   * @param  {String}                 name        Name to search for
   * @return {(EndlessSubject|void)}              Found subject or void
   */
  var findSubjectByName = function findSubjectByName(subjects, name) {
    var res = subjects.filter(function (s) {
      return s.name === name;
    });

    if (!res || res.length < 1) {
      return undefined;
    }

    return res[0];
  };

  // const channelData = Symbol('channel.data');

  /**
   * Rxmq channel class
   */

  var Channel = /*#__PURE__*/function () {
    /**
     * Represents a new Rxmq channel.
     * Normally you wouldn't need to instantiate it directly, you'd just work with existing instance.
     * @constructor
     * @return {void}
     */
    function Channel() {
      _classCallCheck(this, Channel);

      /**
       * Internal set of utilities
       * @type {Object}
       * @private
       */
      this.utils = {
        findSubjectByName: findSubjectByName,
        compareTopics: compareTopics
      };
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

      this.channelBus = new EndlessReplaySubject();
      /**
       * Permanent channel bus stream as Observable
       * @type {Observable}
       * @private
       */

      this.channelStream = this.channelBus;
    }
    /**
     * Returns EndlessSubject representing given topic
     * @param  {String}         name           Topic name
     * @return {EndlessSubject}             EndlessSubject representing given topic
     * @example
     * const channel = rxmq.channel('test');
     * const subject = channel.subject('test.topic');
     */


    _createClass(Channel, [{
      key: "subject",
      value: function subject(name) {
        var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
            _ref$Subject = _ref.Subject,
            Subject = _ref$Subject === void 0 ? EndlessSubject : _ref$Subject;

        var s = this.utils.findSubjectByName(this.subjects, name);

        if (!s) {
          console.log('add proxy for ', name);
          s = new Proxy(new Subject(), {
            get: function get(target, propKey, receiver) {
              if (propKey === 'next') {
                var origMethod = target[propKey];
                return function () {
                  var params = [];

                  if (typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'string' || typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'number' || typeof (arguments.length <= 0 ? undefined : arguments[0]) === 'boolean' || (arguments.length <= 0 ? undefined : arguments[0]) instanceof Date) {
                    params.push({
                      channel: name,
                      data: arguments.length <= 0 ? undefined : arguments[0]
                    });
                  } else {
                    params.push(_objectSpread2({
                      channel: name
                    }, arguments.length <= 0 ? undefined : arguments[0]));
                  }

                  var result = origMethod.apply(this, params); // console.log(name, propKey, JSON.stringify(params), JSON.stringify(result));

                  return result;
                };
              } else return Reflect.get.apply(Reflect, arguments);
            }
          }); // s = new Subject();

          s.name = name;
          this.subjects.push(s);
          this.channelBus.next(s);
        }

        return s;
      }
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

    }, {
      key: "observe",
      value: function observe(name) {
        // create new topic if it's plain text
        if (name.indexOf('#') === -1 && name.indexOf('*') === -1) {
          return this.subject(name);
        } // return stream


        return this.channelStream.pipe(operators.filter(function (obs) {
          return compareTopics(obs.name, name);
        }), operators.mergeAll());
      }
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

    }, {
      key: "request",
      value: function request(_ref2) {
        var topic = _ref2.topic,
            data = _ref2.data,
            _ref2$Subject = _ref2.Subject,
            Subject = _ref2$Subject === void 0 ? rxjs.AsyncSubject : _ref2$Subject;
        var subj = this.utils.findSubjectByName(this.subjects, topic);

        if (!subj) {
          return rxjs.NEVER;
        } // create reply subject


        var replySubject = new Subject();
        subj.next({
          replySubject: replySubject,
          data: data
        });
        return replySubject;
      }
    }]);

    return Channel;
  }();

  /**
   * Rxmq message bus class
   */

  var Rxmq = /*#__PURE__*/function () {
    /**
     * Represents a new Rxmq message bus.
     * Normally you'd just use a signleton returned by default, but it's also
     * possible to create a new instance of Rxmq should you need it.
     * @constructor
     * @example
     * import {Rxmq} from 'rxmq';
     * const myRxmq = new Rxmq();
     */
    function Rxmq() {
      _classCallCheck(this, Rxmq);

      /**
       * Holds channels definitions
       * @type {Object}
       * @private
       */
      this.channels = {};
    }
    /**
     * Returns a channel names
     */


    _createClass(Rxmq, [{
      key: "channelNames",
      value: function channelNames() {
        return Object.keys(this.channels);
      }
      /**
       * Returns a channel for given name
       * @param  {String} name  Channel name
       * @return {Channel}      Channel object
       * @example
       * const testChannel = rxmq.channel('test');
       */

    }, {
      key: "channel",
      value: function channel() {
        var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'defaultRxmqChannel';

        if (!this.channels[name]) {
          this.channels[name] = new Channel();
        }

        return this.channels[name];
      }
    }]);

    return Rxmq;
  }();

  var index = new Rxmq();

  exports.Channel = Channel;
  exports.EndlessReplaySubject = EndlessReplaySubject;
  exports.EndlessSubject = EndlessSubject;
  exports.default = index;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=component.js.map
