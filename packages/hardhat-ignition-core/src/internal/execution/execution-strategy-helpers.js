"use strict";
/**
 * This is a file containing the different helpers that an execution strategy
 * implementation can use.
 * @file
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getStaticCallExecutionStateResultValue = exports.executeStaticCallRequest = exports.executeOnchainInteractionRequest = exports.isOnchainInteractionResponse = void 0;
const assertions_1 = require("../utils/assertions");
const abi_1 = require("./abi");
const evm_execution_1 = require("./types/evm-execution");
const execution_result_1 = require("./types/execution-result");
const execution_strategy_1 = require("./types/execution-strategy");
/**
 * Returns true if the given response is an onchain interaction response.
 */
function isOnchainInteractionResponse(response) {
    return ("type" in response &&
        (response.type === execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION ||
            response.type === execution_strategy_1.OnchainInteractionResponseType.SIMULATION_RESULT));
}
exports.isOnchainInteractionResponse = isOnchainInteractionResponse;
/**
 * Executes an onchain interaction request.
 *
 * @param executionStateId The id of the execution state that lead to the request.
 * @param onchainInteractionRequest  The request to execute.
 * @param decodeSuccessfulSimulationResult A function to decode the results of a
 *  simulation. Can be `undefined` if the request is not related to a contract or
 *  if we want to accept any result (e.g. in a deployment).
 * @param decodeCustomError A function to decode custom errors. Can be `undefined`
 *  if the request is not related to a contract whose custom errors we know how to
 *  decode.
 * @returns The successful transaction response or a simulation error.
 */
function executeOnchainInteractionRequest(executionStateId, onchainInteractionRequest, decodeSuccessfulSimulationResult, decodeCustomError) {
    return __asyncGenerator(this, arguments, function* executeOnchainInteractionRequest_1() {
        const firstResponse = yield yield __await(onchainInteractionRequest);
        const assertionPrefix = `[ExecutionState ${executionStateId} - Network Interaction ${onchainInteractionRequest.id}] `;
        (0, assertions_1.assertIgnitionInvariant)(isOnchainInteractionResponse(firstResponse), `${assertionPrefix}Expected onchain interaction response and got raw static call result`);
        let onchainInteractionResponse;
        if (firstResponse.type === execution_strategy_1.OnchainInteractionResponseType.SIMULATION_RESULT) {
            if (!firstResponse.result.success) {
                const error = (0, abi_1.decodeError)(firstResponse.result.returnData, firstResponse.result.customErrorReported, decodeCustomError);
                return yield __await({
                    type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                    error,
                });
            }
            if (decodeSuccessfulSimulationResult !== undefined) {
                const result = decodeSuccessfulSimulationResult(firstResponse.result.returnData);
                if (result.type === evm_execution_1.EvmExecutionResultTypes.INVALID_RESULT_ERROR) {
                    return yield __await({
                        type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                        error: result,
                    });
                }
            }
            onchainInteractionResponse = yield yield __await({
                type: execution_strategy_1.SIMULATION_SUCCESS_SIGNAL_TYPE,
            });
        }
        else {
            onchainInteractionResponse = firstResponse;
        }
        (0, assertions_1.assertIgnitionInvariant)(isOnchainInteractionResponse(onchainInteractionResponse), `${assertionPrefix}Expected onchain interaction response and got raw static call result`);
        (0, assertions_1.assertIgnitionInvariant)(onchainInteractionResponse.type ===
            execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION, `${assertionPrefix}Expected confirmed transaction and got simulation result`);
        return yield __await(onchainInteractionResponse);
    });
}
exports.executeOnchainInteractionRequest = executeOnchainInteractionRequest;
/**
 * Executes an static call request.
 *
 * @param staticCallRequest  The static call request to execute.
 * @param decodeSuccessfulResult A function to decode the results of a simulation.
 * @param decodeCustomError A function to decode custom errors.
 * @returns The successful evm execution result, or a failed static call result.
 */
function executeStaticCallRequest(staticCallRequest, decodeSuccessfulResult, decodeCustomError) {
    return __asyncGenerator(this, arguments, function* executeStaticCallRequest_1() {
        const result = yield yield __await(staticCallRequest);
        if (!result.success) {
            const error = (0, abi_1.decodeError)(result.returnData, result.customErrorReported, decodeCustomError);
            return yield __await({
                type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                error,
            });
        }
        const decodedResult = decodeSuccessfulResult(result.returnData);
        if (decodedResult.type === evm_execution_1.EvmExecutionResultTypes.INVALID_RESULT_ERROR) {
            return yield __await({
                type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                error: decodedResult,
            });
        }
        return yield __await(decodedResult);
    });
}
exports.executeStaticCallRequest = executeStaticCallRequest;
/**
 * Returns the right value from the last static call result that should be used
 * as the whole result of the static call execution state.
 *
 * @param _exState The execution state
 * @param lastStaticCallResult The result of the last network interaction.
 * @returns The value that should be used as the result of the static call execution state.
 */
function getStaticCallExecutionStateResultValue(exState, lastStaticCallResult) {
    return typeof exState.nameOrIndex === "string"
        ? lastStaticCallResult.values.named[exState.nameOrIndex]
        : lastStaticCallResult.values.positional[exState.nameOrIndex];
}
exports.getStaticCallExecutionStateResultValue = getStaticCallExecutionStateResultValue;
__exportStar(require("./abi"), exports);
