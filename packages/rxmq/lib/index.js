"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndlessReplaySubject = exports.EndlessSubject = void 0;
var rxmq_1 = require("./rxmq");
var index_1 = require("./rx/index");
Object.defineProperty(exports, "EndlessSubject", { enumerable: true, get: function () { return index_1.EndlessSubject; } });
Object.defineProperty(exports, "EndlessReplaySubject", { enumerable: true, get: function () { return index_1.EndlessReplaySubject; } });
var rxmq = new rxmq_1.Rxmq();
exports.default = rxmq;
