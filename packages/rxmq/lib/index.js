"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EndlessReplaySubject = exports.EndlessSubject = void 0;
var rxmq_1 = require("./rxmq");
var subjects_1 = require("./rx/subjects");
Object.defineProperty(exports, "EndlessSubject", { enumerable: true, get: function () { return subjects_1.EndlessSubject; } });
Object.defineProperty(exports, "EndlessReplaySubject", { enumerable: true, get: function () { return subjects_1.EndlessReplaySubject; } });
var rxmq = new rxmq_1.Rxmq();
exports.default = rxmq;
