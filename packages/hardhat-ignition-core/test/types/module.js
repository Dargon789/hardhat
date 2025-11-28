"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const module_1 = require("../../src/types/module");
function _testThatTheValuesOfFutureTypeMatchTheKeys(type) {
    return module_1.FutureType[type];
}
function _testThatEveryFutureIsBaseFuture(f) {
    return f;
}
function _testThatBaseFutureIncludesAllSharedFieldsExceptType(f) {
    return f;
}
function _testThatEveryFutureTypeIsUsed(type) {
    return type;
}
function _testThatEveryRuntimeValueIsBaseRuntimeValue(r) {
    return r;
}
function _testThatBaseRuntimeValueIncludesAllSharedFieldsExceptType(r) {
    return r;
}
function _testThatEveryRuntimeValueTypeIsUsed(type) {
    return type;
}
function _testThatTheValuesOfRuntimeValueTypeMatchTheKeys(type) {
    return module_1.RuntimeValueType[type];
}
