"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retrieveNestedRuntimeValues = exports.filterToAccountRuntimeValues = exports.validateAccountRuntimeValue = exports.resolvePotentialModuleParameterValueFrom = void 0;
const errors_1 = require("../../errors");
const type_guards_1 = require("../../type-guards");
const errors_list_1 = require("../errors-list");
/**
 * Given the deployment parameters and a ModuleParameterRuntimeValue,
 * resolve the value for the ModuleParameterRuntimeValue.
 *
 * The logic runs, use the specific module parameter if available,
 * fall back to a globally defined parameter, then finally use
 * the default value. It is possible that the ModuleParameterRuntimeValue
 * has no default value, in which case this function will return undefined.
 */
function resolvePotentialModuleParameterValueFrom(deploymentParameters, moduleRuntimeValue) {
    var _a, _b, _c, _d;
    return ((_d = (_b = (_a = deploymentParameters[moduleRuntimeValue.moduleId]) === null || _a === void 0 ? void 0 : _a[moduleRuntimeValue.name]) !== null && _b !== void 0 ? _b : (_c = deploymentParameters.$global) === null || _c === void 0 ? void 0 : _c[moduleRuntimeValue.name]) !== null && _d !== void 0 ? _d : moduleRuntimeValue.defaultValue);
}
exports.resolvePotentialModuleParameterValueFrom = resolvePotentialModuleParameterValueFrom;
function validateAccountRuntimeValue(arv, accounts) {
    const errors = [];
    if (arv.accountIndex < 0) {
        errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.NEGATIVE_ACCOUNT_INDEX));
    }
    if (arv.accountIndex >= accounts.length) {
        errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.ACCOUNT_INDEX_TOO_HIGH, {
            accountIndex: arv.accountIndex,
            accountsLength: accounts.length,
        }));
    }
    return errors;
}
exports.validateAccountRuntimeValue = validateAccountRuntimeValue;
function filterToAccountRuntimeValues(runtimeValues) {
    return runtimeValues
        .map((rv) => {
        if ((0, type_guards_1.isAccountRuntimeValue)(rv)) {
            return rv;
        }
        else if ((0, type_guards_1.isAccountRuntimeValue)(rv.defaultValue)) {
            return rv.defaultValue;
        }
        else {
            return undefined;
        }
    })
        .filter((rv) => rv !== undefined);
}
exports.filterToAccountRuntimeValues = filterToAccountRuntimeValues;
function retrieveNestedRuntimeValues(args) {
    return args.flatMap(checkForValues).filter(type_guards_1.isRuntimeValue);
}
exports.retrieveNestedRuntimeValues = retrieveNestedRuntimeValues;
function checkForValues(arg) {
    if ((0, type_guards_1.isRuntimeValue)(arg)) {
        return arg;
    }
    if (Array.isArray(arg)) {
        return arg.flatMap(checkForValues);
    }
    if (!(0, type_guards_1.isFuture)(arg) && typeof arg === "object" && arg !== null) {
        return Object.values(arg).flatMap(checkForValues);
    }
    return null;
}
