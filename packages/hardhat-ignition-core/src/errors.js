"use strict";
var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _IgnitionError_errorDescriptor;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NomicIgnitionPluginError = exports.IgnitionPluginError = exports.IgnitionError = exports.CustomError = void 0;
const errors_list_1 = require("./internal/errors-list");
/**
 * Base error class extended by all custom errors.
 * Placeholder to allow us to customize error output formatting in the future.
 *
 * @beta
 */
class CustomError extends Error {
    constructor(message, cause) {
        super(message, cause !== undefined ? { cause } : undefined);
        this.name = this.constructor.name;
    }
}
exports.CustomError = CustomError;
/**
 * All exceptions intentionally thrown with Ignition-core
 * extend this class.
 *
 * @beta
 */
class IgnitionError extends CustomError {
    constructor(errorDescriptor, messageArguments = {}, cause) {
        const prefix = `${(0, errors_list_1.getErrorCode)(errorDescriptor)}: `;
        const formattedMessage = _applyErrorMessageTemplate(errorDescriptor.message, messageArguments, false);
        super(prefix + formattedMessage, cause);
        // We store the error descriptor as private field to avoid
        // interferring with Node's default error formatting.
        // We can use getters to access any private field without
        // interferring with it.
        //
        // Disabling this rule as private fields don't use `private`
        // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
        _IgnitionError_errorDescriptor.set(this, void 0);
        __classPrivateFieldSet(this, _IgnitionError_errorDescriptor, errorDescriptor, "f");
    }
    get errorNumber() {
        return __classPrivateFieldGet(this, _IgnitionError_errorDescriptor, "f").number;
    }
}
exports.IgnitionError = IgnitionError;
_IgnitionError_errorDescriptor = new WeakMap();
/**
 * This class is used to throw errors from Ignition plugins made by third parties.
 *
 * @beta
 */
class IgnitionPluginError extends CustomError {
    static isIgnitionPluginError(error) {
        return (typeof error === "object" &&
            error !== null &&
            error._isIgnitionPluginError === true);
    }
    constructor(pluginName, message, cause) {
        super(message, cause);
        this._isIgnitionPluginError = true;
        this.pluginName = pluginName;
    }
}
exports.IgnitionPluginError = IgnitionPluginError;
/**
 * This class is used to throw errors from *core* Ignition plugins.
 * If you are developing a third-party plugin, use IgnitionPluginError instead.
 *
 * @beta
 */
class NomicIgnitionPluginError extends IgnitionPluginError {
    constructor() {
        super(...arguments);
        this._isNomicIgnitionPluginError = true;
    }
    static isNomicIgnitionPluginError(error) {
        return (typeof error === "object" &&
            error !== null &&
            error._isNomicIgnitionPluginError === true);
    }
}
exports.NomicIgnitionPluginError = NomicIgnitionPluginError;
function _applyErrorMessageTemplate(template, values, isRecursiveCall) {
    if (!isRecursiveCall) {
        for (const variableName of Object.keys(values)) {
            if (variableName.match(/^[a-zA-Z][a-zA-Z0-9]*$/) === null) {
                throw new IgnitionError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_INVALID_VARIABLE_NAME, {
                    variable: variableName,
                });
            }
            const variableTag = `%${variableName}%`;
            if (!template.includes(variableTag)) {
                throw new IgnitionError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_VARIABLE_NOT_FOUND, {
                    variable: variableName,
                });
            }
        }
    }
    if (template.includes("%%")) {
        return template
            .split("%%")
            .map((part) => _applyErrorMessageTemplate(part, values, true))
            .join("%");
    }
    for (const variableName of Object.keys(values)) {
        let value;
        if (values[variableName] === undefined) {
            value = "undefined";
        }
        else if (values[variableName] === null) {
            value = "null";
        }
        else {
            value = values[variableName].toString();
        }
        if (value === undefined) {
            value = "undefined";
        }
        const variableTag = `%${variableName}%`;
        if (value.match(/%([a-zA-Z][a-zA-Z0-9]*)?%/) !== null) {
            throw new IgnitionError(errors_list_1.ERRORS.INTERNAL.TEMPLATE_VALUE_CONTAINS_VARIABLE_TAG, { variable: variableName });
        }
        template = template.split(variableTag).join(value);
    }
    return template;
}
