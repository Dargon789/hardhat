"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __asyncDelegator = (this && this.__asyncDelegator) || function (o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function (e) { throw e; }), verb("return"), i[Symbol.iterator] = function () { return this; }, i;
    function verb(n, f) { i[n] = o[n] ? function (v) { return (p = !p) ? { value: __await(o[n](v)), done: n === "return" } : f ? f(v) : v; } : f; }
};
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
exports.BasicStrategy = void 0;
const execution_strategy_helpers_1 = require("../internal/execution/execution-strategy-helpers");
const execution_result_1 = require("../internal/execution/types/execution-result");
const execution_strategy_1 = require("../internal/execution/types/execution-strategy");
const network_interaction_1 = require("../internal/execution/types/network-interaction");
const assertions_1 = require("../internal/utils/assertions");
/**
 * The basic execution strategy, which sends a single transaction
 * for each contract deployment, call, and send data, and a single static call
 * for each static call execution.
 *
 * @private
 */
class BasicStrategy {
    constructor() {
        this.name = "basic";
        this.config = {};
    }
    init(deploymentLoader, _jsonRpcClient) {
        return __awaiter(this, void 0, void 0, function* () {
            this._deploymentLoader = deploymentLoader;
        });
    }
    executeDeployment(executionState) {
        return __asyncGenerator(this, arguments, function* executeDeployment_1() {
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined, `Strategy ${this.name} not initialized`);
            const artifact = yield __await(this._deploymentLoader.loadArtifact(executionState.artifactId));
            const transactionOrResult = yield __await(yield* __asyncDelegator(__asyncValues((0, execution_strategy_helpers_1.executeOnchainInteractionRequest)(executionState.id, {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: undefined,
                data: (0, execution_strategy_helpers_1.encodeArtifactDeploymentData)(artifact, executionState.constructorArgs, executionState.libraries),
                value: executionState.value,
            }, undefined, (returnData) => (0, execution_strategy_helpers_1.decodeArtifactCustomError)(artifact, returnData)))));
            if (transactionOrResult.type !==
                execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION) {
                return yield __await(transactionOrResult);
            }
            const tx = transactionOrResult.transaction;
            const contractAddress = tx.receipt.contractAddress;
            if (contractAddress === undefined) {
                return yield __await({
                    type: execution_result_1.ExecutionResultType.STRATEGY_ERROR,
                    error: `Transaction ${tx.hash} confirmed but it didn't create a contract`,
                });
            }
            return yield __await({
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: contractAddress,
            });
        });
    }
    executeCall(executionState) {
        return __asyncGenerator(this, arguments, function* executeCall_1() {
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined, `Strategy ${this.name} not initialized`);
            const artifact = yield __await(this._deploymentLoader.loadArtifact(executionState.artifactId));
            const transactionOrResult = yield __await(yield* __asyncDelegator(__asyncValues((0, execution_strategy_helpers_1.executeOnchainInteractionRequest)(executionState.id, {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: executionState.contractAddress,
                data: (0, execution_strategy_helpers_1.encodeArtifactFunctionCall)(artifact, executionState.functionName, executionState.args),
                value: executionState.value,
            }, (returnData) => (0, execution_strategy_helpers_1.decodeArtifactFunctionCallResult)(artifact, executionState.functionName, returnData), (returnData) => (0, execution_strategy_helpers_1.decodeArtifactCustomError)(artifact, returnData)))));
            if (transactionOrResult.type !==
                execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION) {
                return yield __await(transactionOrResult);
            }
            return yield __await({
                type: execution_result_1.ExecutionResultType.SUCCESS,
            });
        });
    }
    executeSendData(executionState) {
        return __asyncGenerator(this, arguments, function* executeSendData_1() {
            const transactionOrResult = yield __await(yield* __asyncDelegator(__asyncValues((0, execution_strategy_helpers_1.executeOnchainInteractionRequest)(executionState.id, {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: executionState.to,
                data: executionState.data,
                value: executionState.value,
            }))));
            if (transactionOrResult.type !==
                execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION) {
                return yield __await(transactionOrResult);
            }
            return yield __await({
                type: execution_result_1.ExecutionResultType.SUCCESS,
            });
        });
    }
    executeStaticCall(executionState) {
        return __asyncGenerator(this, arguments, function* executeStaticCall_1() {
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined, `Strategy ${this.name} not initialized`);
            const artifact = yield __await(this._deploymentLoader.loadArtifact(executionState.artifactId));
            const decodedResultOrError = yield __await(yield* __asyncDelegator(__asyncValues((0, execution_strategy_helpers_1.executeStaticCallRequest)({
                id: 1,
                type: network_interaction_1.NetworkInteractionType.STATIC_CALL,
                to: executionState.contractAddress,
                from: executionState.from,
                data: (0, execution_strategy_helpers_1.encodeArtifactFunctionCall)(artifact, executionState.functionName, executionState.args),
                value: 0n,
            }, (returnData) => (0, execution_strategy_helpers_1.decodeArtifactFunctionCallResult)(artifact, executionState.functionName, returnData), (returnData) => (0, execution_strategy_helpers_1.decodeArtifactCustomError)(artifact, returnData)))));
            if (decodedResultOrError.type === execution_result_1.ExecutionResultType.STATIC_CALL_ERROR) {
                return yield __await(decodedResultOrError);
            }
            return yield __await({
                type: execution_result_1.ExecutionResultType.SUCCESS,
                value: (0, execution_strategy_helpers_1.getStaticCallExecutionStateResultValue)(executionState, decodedResultOrError),
            });
        });
    }
}
exports.BasicStrategy = BasicStrategy;
