"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findSubjectByName = void 0;
/**
 * Find a specific subject by given name
 * @param  {Array}                  subjects    Array of subjects to search in
 * @param  {String}                 name        Name to search for
 * @return {(EndlessSubject|void)}              Found subject or void
 */
var findSubjectByName = function (subjects, name) {
    return subjects.find(function (s) { var _a; return name === ((_a = Object.getOwnPropertyDescriptor(s, 'name')) === null || _a === void 0 ? void 0 : _a.value); });
};
exports.findSubjectByName = findSubjectByName;
