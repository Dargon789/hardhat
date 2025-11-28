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
exports.Create2Strategy = void 0;
const ethers_1 = require("ethers");
const errors_1 = require("../errors");
const execution_strategy_helpers_1 = require("../internal/execution/execution-strategy-helpers");
const createx_artifact_1 = require("../internal/execution/strategy/createx-artifact");
const execution_result_1 = require("../internal/execution/types/execution-result");
const execution_strategy_1 = require("../internal/execution/types/execution-strategy");
const network_interaction_1 = require("../internal/execution/types/network-interaction");
const assertions_1 = require("../internal/utils/assertions");
// v0.1.0
const CREATE_X_ADDRESS = "0xba5Ed099633D3B313e4D5F7bdc1305d3c28ba5Ed";
const CREATE_X_DEPLOYED_BYTECODE_HASH = "0xbd8a7ea8cfca7b4e5f5041d7d4b17bc317c5ce42cfbc42066a00cf26b43eb53f";
const CREATE_X_PRESIGNED_DEPLOYER_ADDRESS = "0xeD456e05CaAb11d66C4c797dD6c1D6f9A7F352b5";
/**
 * The create2 strategy extends the basic strategy, for deployment it replaces
 * a deployment transaction with a call to the CreateX factory contract
 * with a user provided salt.
 *
 * If deploying to the local Hardhat node, the CreateX factory will be
 * deployed if it does not exist. If the CreateX factory is not currently
 * available on the remote network, an error will be thrown halting the
 * deployment.
 *
 * Futures that perform calls or send data remain single transactions, and
 * static calls remain a single static call.
 *
 * The strategy requires a salt is provided in the Hardhat config. The same
 * salt will be used for all calls to CreateX.
 *
 * @example
 * {
 *   ...,
 *   ignition: {
 *     strategyConfig: {
 *       create2: {
 *         salt: "my-salt"
 *       }
 *     }
 *   },
 *   ...
 * }
 *
 * @beta
 */
class Create2Strategy {
    constructor(config) {
        this.name = "create2";
        this.config = config;
    }
    init(deploymentLoader, jsonRpcClient) {
        return __awaiter(this, void 0, void 0, function* () {
            this._deploymentLoader = deploymentLoader;
            this._jsonRpcClient = jsonRpcClient;
            // Check if CreateX is deployed on the current network
            const result = yield this._jsonRpcClient.getCode(CREATE_X_ADDRESS);
            // If CreateX factory is deployed (and bytecode matches) then nothing to do
            if (result !== "0x") {
                (0, assertions_1.assertIgnitionInvariant)(ethers_1.ethers.keccak256(result) === CREATE_X_DEPLOYED_BYTECODE_HASH, "Deployed CreateX bytecode does not match expected bytecode");
                return;
            }
            const chainId = yield this._jsonRpcClient.getChainId();
            // Otherwise if we're not on a local hardhat node, throw an error
            if (chainId !== 31337) {
                throw new errors_1.NomicIgnitionPluginError("create2", `CreateX not deployed on current network ${chainId}`);
            }
            // On a local hardhat node, deploy the CreateX factory
            yield this._deployCreateXFactory(this._jsonRpcClient);
        });
    }
    executeDeployment(executionState) {
        return __asyncGenerator(this, arguments, function* executeDeployment_1() {
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined && this._jsonRpcClient !== undefined, `Strategy ${this.name} not initialized`);
            const artifact = yield __await(this._deploymentLoader.loadArtifact(executionState.artifactId));
            const bytecodeToDeploy = (0, execution_strategy_helpers_1.encodeArtifactDeploymentData)(artifact, executionState.constructorArgs, executionState.libraries);
            const transactionOrResult = yield __await(yield* __asyncDelegator(__asyncValues((0, execution_strategy_helpers_1.executeOnchainInteractionRequest)(executionState.id, {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: CREATE_X_ADDRESS,
                data: (0, execution_strategy_helpers_1.encodeArtifactFunctionCall)(createx_artifact_1.createxArtifact, "deployCreate2(bytes32,bytes)", [this.config.salt, bytecodeToDeploy]),
                value: executionState.value,
            }, (returnData) => (0, execution_strategy_helpers_1.decodeArtifactFunctionCallResult)(createx_artifact_1.createxArtifact, "deployCreate2(bytes32,bytes)", returnData), (returnData) => (0, execution_strategy_helpers_1.decodeArtifactCustomError)(createx_artifact_1.createxArtifact, returnData)))));
            if (transactionOrResult.type !==
                execution_strategy_1.OnchainInteractionResponseType.SUCCESSFUL_TRANSACTION) {
                return yield __await(transactionOrResult);
            }
            const deployedAddress = (0, execution_strategy_helpers_1.getEventArgumentFromReceipt)(transactionOrResult.transaction.receipt, createx_artifact_1.createxArtifact, CREATE_X_ADDRESS, "ContractCreation", 0, "newContract");
            (0, assertions_1.assertIgnitionInvariant)(typeof deployedAddress === "string", "Deployed event should return a string addr property");
            return yield __await({
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: deployedAddress,
            });
        });
    }
    executeCall(executionState) {
        return __asyncGenerator(this, arguments, function* executeCall_1() {
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined && this._jsonRpcClient !== undefined, `Strategy ${this.name} not initialized`);
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
            (0, assertions_1.assertIgnitionInvariant)(this._deploymentLoader !== undefined && this._jsonRpcClient !== undefined, `Strategy ${this.name} not initialized`);
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
    /**
     * Within the context of a local development Hardhat chain, deploy
     * the CreateX factory contract using a presigned transaction.
     */
    _deployCreateXFactory(client) {
        return __awaiter(this, void 0, void 0, function* () {
            // The account that will deploy the CreateX factory needs to be funded
            // first
            yield client.setBalance(CREATE_X_PRESIGNED_DEPLOYER_ADDRESS, 400000000000000000n);
            const txHash = yield client.sendRawTransaction(createx_artifact_1.presignedTx);
            (0, assertions_1.assertIgnitionInvariant)(txHash !== "0x", "CreateX deployment failed");
            while (true) {
                const receipt = yield client.getTransactionReceipt(txHash);
                if (receipt !== undefined) {
                    (0, assertions_1.assertIgnitionInvariant)((receipt === null || receipt === void 0 ? void 0 : receipt.contractAddress) !== undefined, "CreateX deployment should have an address");
                    (0, assertions_1.assertIgnitionInvariant)(receipt.contractAddress === CREATE_X_ADDRESS, `CreateX deployment should have the expected address ${CREATE_X_ADDRESS}, instead it is ${receipt.contractAddress}`);
                    return;
                }
                yield new Promise((res) => setTimeout(res, 200));
            }
        });
    }
}
exports.Create2Strategy = Create2Strategy;
