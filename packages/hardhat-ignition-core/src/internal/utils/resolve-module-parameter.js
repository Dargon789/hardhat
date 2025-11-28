"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveModuleParameter = void 0;
const type_guards_1 = require("../../type-guards");
const future_resolvers_1 = require("../execution/future-processor/helpers/future-resolvers");
const assertions_1 = require("./assertions");
function resolveModuleParameter(moduleParamRuntimeValue, context) {
    var _a, _b, _c, _d;
    const potentialParamAtModuleLevel = (_b = (_a = context.deploymentParameters) === null || _a === void 0 ? void 0 : _a[moduleParamRuntimeValue.moduleId]) === null || _b === void 0 ? void 0 : _b[moduleParamRuntimeValue.name];
    if (potentialParamAtModuleLevel !== undefined) {
        return potentialParamAtModuleLevel;
    }
    const potentialParamAtGlobalLevel = (_d = (_c = context.deploymentParameters) === null || _c === void 0 ? void 0 : _c.$global) === null || _d === void 0 ? void 0 : _d[moduleParamRuntimeValue.name];
    if (potentialParamAtGlobalLevel !== undefined) {
        return potentialParamAtGlobalLevel;
    }
    (0, assertions_1.assertIgnitionInvariant)(moduleParamRuntimeValue.defaultValue !== undefined, `No default value provided for module parameter ${moduleParamRuntimeValue.moduleId}/${moduleParamRuntimeValue.name}`);
    return _resolveDefaultValue(moduleParamRuntimeValue, context.accounts);
}
exports.resolveModuleParameter = resolveModuleParameter;
function _resolveDefaultValue(moduleParamRuntimeValue, accounts) {
    (0, assertions_1.assertIgnitionInvariant)(moduleParamRuntimeValue.defaultValue !== undefined, `No default value provided for module parameter ${moduleParamRuntimeValue.moduleId}/${moduleParamRuntimeValue.name}`);
    if ((0, type_guards_1.isAccountRuntimeValue)(moduleParamRuntimeValue.defaultValue)) {
        return (0, future_resolvers_1.resolveAccountRuntimeValue)(moduleParamRuntimeValue.defaultValue, accounts);
    }
    return moduleParamRuntimeValue.defaultValue;
}
