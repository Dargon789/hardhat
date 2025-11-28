"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.compare = void 0;
const utils_1 = require("../utils");
function compare(future, fieldName, existingValue, newValue, messageSuffix) {
    var _a, _b;
    if (existingValue !== newValue) {
        return (0, utils_1.fail)(future, `${fieldName} has been changed from ${(_a = existingValue === null || existingValue === void 0 ? void 0 : existingValue.toString()) !== null && _a !== void 0 ? _a : '"undefined"'} to ${(_b = newValue === null || newValue === void 0 ? void 0 : newValue.toString()) !== null && _b !== void 0 ? _b : '"undefined"'}${messageSuffix !== null && messageSuffix !== void 0 ? messageSuffix : ""}`);
    }
}
exports.compare = compare;
