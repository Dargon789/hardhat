"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.argumentTypeToString = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
function argumentTypeToString(argument) {
    if (typeof argument === "bigint") {
        return `<BigInt ${argument.toString(10)}>`;
    }
    if ((0, ui_helpers_1.isFuture)(argument)) {
        return `<Future ${argument.id}>`;
    }
    if ((0, ui_helpers_1.isRuntimeValue)(argument)) {
        if (argument.type === ui_helpers_1.RuntimeValueType.ACCOUNT) {
            return `<AccountRuntimeValue accountIndex=${argument.accountIndex}>`;
        }
        return `<ModuleParameterRuntimeValue name="${argument.name}" defaultValue=${argument.defaultValue === undefined
            ? "undefined"
            : argumentTypeToString(argument.defaultValue)}>`;
    }
    return JSON.stringify(argument, null, 2);
}
exports.argumentTypeToString = argumentTypeToString;
