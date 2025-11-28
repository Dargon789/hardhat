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
const chai_1 = require("chai");
const monitor_onchain_interaction_1 = require("../../../../src/internal/execution/future-processor/handlers/monitor-onchain-interaction");
const decode_simulation_result_1 = require("../../../../src/internal/execution/future-processor/helpers/decode-simulation-result");
const network_interaction_execution_1 = require("../../../../src/internal/execution/future-processor/helpers/network-interaction-execution");
const transaction_tracking_timer_1 = require("../../../../src/internal/execution/transaction-tracking-timer");
const evm_execution_1 = require("../../../../src/internal/execution/types/evm-execution");
const execution_result_1 = require("../../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../../src/internal/execution/types/execution-state");
const jsonrpc_1 = require("../../../../src/internal/execution/types/jsonrpc");
const messages_1 = require("../../../../src/internal/execution/types/messages");
const network_interaction_1 = require("../../../../src/internal/execution/types/network-interaction");
const module_1 = require("../../../../src/types/module");
const helpers_1 = require("../../../helpers");
class StubJsonRpcClient {
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getNetworkFees() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getLatestBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getBalance(_address, _blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    setBalance(_address, _balance) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    call(_callParams, _blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    estimateGas(_transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    sendTransaction(_transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    sendRawTransaction(_presignedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    getTransactionCount(_address, _blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getTransaction(_txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getTransactionReceipt(_txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Mock not implemented.");
        });
    }
    getCode(_address) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
class StubDeploymentLoader {
    recordToJournal(_message) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    readFromJournal() {
        return __asyncGenerator(this, arguments, function* readFromJournal_1() {
            throw new Error("Method not implemented.");
        });
    }
    loadArtifact(_artifactId) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    storeUserProvidedArtifact(_futureId, _artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    storeNamedArtifact(_futureId, _contractName, _artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    storeBuildInfo(_futureId, _buildInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    recordDeployedAddress(_futureId, _contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
describe("Network interactions", () => {
    describe("runStaticCall", () => {
        it("Should run the static call as latest and return the result", () => __awaiter(void 0, void 0, void 0, function* () {
            const staticCall = {
                from: "0x123",
                to: "0x456",
                data: "0x789",
                value: 8n,
                id: 1,
                type: network_interaction_1.NetworkInteractionType.STATIC_CALL,
            };
            const expectedResult = {
                customErrorReported: true,
                returnData: "0x1234",
                success: false,
            };
            class MockJsonRpcClient extends StubJsonRpcClient {
                constructor() {
                    super(...arguments);
                    this.calls = 0;
                }
                call(callParams, blockTag) {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.calls += 1;
                        chai_1.assert.equal(callParams.from, staticCall.from);
                        chai_1.assert.equal(callParams.to, staticCall.to);
                        chai_1.assert.equal(callParams.data, staticCall.data);
                        chai_1.assert.equal(callParams.value, staticCall.value);
                        chai_1.assert.isUndefined(callParams.fees);
                        chai_1.assert.isUndefined(callParams.nonce);
                        chai_1.assert.equal(blockTag, "latest");
                        return expectedResult;
                    });
                }
            }
            const mockClient = new MockJsonRpcClient();
            const result = yield (0, network_interaction_execution_1.runStaticCall)(mockClient, staticCall);
            chai_1.assert.equal(result, expectedResult);
            chai_1.assert.equal(mockClient.calls, 1);
        }));
    });
    describe("monitorOnchainInteraction", () => {
        const requiredConfirmations = 1;
        const millisecondBeforeBumpingFees = 1;
        const maxFeeBumps = 1;
        const testGetTransactionRetryConfig = {
            maxRetries: 10,
            retryInterval: 1,
        };
        let mockClient;
        let fakeTransactionTrackingTimer;
        const exampleDeploymentExecutionState = {
            id: "test",
            type: execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE,
            futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT,
            strategy: "basic",
            strategyConfig: {},
            status: execution_state_1.ExecutionStatus.STARTED,
            dependencies: new Set(),
            artifactId: "./artifact.json",
            contractName: "Contract1",
            value: 0n,
            constructorArgs: [],
            libraries: {},
            from: helpers_1.exampleAccounts[0],
            networkInteractions: [],
        };
        beforeEach(() => {
            mockClient = new MockGetTransactionJsonRpcClient();
            fakeTransactionTrackingTimer = new FakeTransactionTrackingTimer();
        });
        it("Should succeed even if transaction takes time to propagate to the mempool", () => __awaiter(void 0, void 0, void 0, function* () {
            const deploymentExecutionState = Object.assign(Object.assign({}, exampleDeploymentExecutionState), { networkInteractions: [
                    {
                        id: 1,
                        type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                        to: helpers_1.exampleAccounts[1],
                        value: 0n,
                        data: "0x",
                        shouldBeResent: true,
                        transactions: [
                            {
                                hash: "0x1234",
                                fees: {
                                    maxFeePerGas: 0n,
                                    maxPriorityFeePerGas: 0n,
                                },
                            },
                        ],
                    },
                ] });
            mockClient.callToFindResult = 4;
            mockClient.result = {
                hash: "0x1234",
                fees: {
                    maxFeePerGas: 0n,
                    maxPriorityFeePerGas: 0n,
                },
            };
            const message = yield (0, monitor_onchain_interaction_1.monitorOnchainInteraction)(deploymentExecutionState, mockClient, fakeTransactionTrackingTimer, requiredConfirmations, millisecondBeforeBumpingFees, maxFeeBumps, testGetTransactionRetryConfig, false);
            if (message === undefined) {
                return chai_1.assert.fail("No message returned from monitoring");
            }
            chai_1.assert.isDefined(message);
            chai_1.assert.equal(message.type, messages_1.JournalMessageType.TRANSACTION_CONFIRM);
            chai_1.assert.equal(message.futureId, deploymentExecutionState.id);
        }));
        it("Should error when no transaction in the mempool even after awaiting propagation", () => __awaiter(void 0, void 0, void 0, function* () {
            const deploymentExecutionState = Object.assign(Object.assign({}, exampleDeploymentExecutionState), { networkInteractions: [
                    {
                        id: 1,
                        type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                        to: helpers_1.exampleAccounts[1],
                        value: 0n,
                        data: "0x",
                        shouldBeResent: true,
                        transactions: [
                            {
                                hash: "0x1234",
                                fees: {
                                    maxFeePerGas: 0n,
                                    maxPriorityFeePerGas: 0n,
                                },
                            },
                        ],
                    },
                ] });
            yield chai_1.assert.isRejected((0, monitor_onchain_interaction_1.monitorOnchainInteraction)(deploymentExecutionState, mockClient, fakeTransactionTrackingTimer, requiredConfirmations, millisecondBeforeBumpingFees, maxFeeBumps, testGetTransactionRetryConfig, false), /IGN401: Error while executing test: all the transactions of its network interaction 1 were dropped\. Please try rerunning Hardhat Ignition\./);
            chai_1.assert.equal(mockClient.calls, 10);
        }));
    });
    describe("sendTransactionForOnchainInteraction", () => {
        describe("First transaction", () => {
            class MockJsonRpcClient extends StubJsonRpcClient {
                getNetworkFees() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return {
                            maxFeePerGas: 0n,
                            maxPriorityFeePerGas: 0n,
                        };
                    });
                }
                estimateGas(_transactionParams) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return 0n;
                    });
                }
                call(_callParams, _blockTag) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return {
                            customErrorReported: false,
                            returnData: "0x",
                            success: true,
                        };
                    });
                }
                sendTransaction(_transactionParams) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return "0x1234";
                    });
                }
            }
            class MockNonceManager {
                constructor() {
                    this.calls = {};
                }
                getNextNonce(_address) {
                    var _a;
                    return __awaiter(this, void 0, void 0, function* () {
                        this.calls[_address] = (_a = this.calls[_address]) !== null && _a !== void 0 ? _a : 0;
                        this.calls[_address] += 1;
                        return this.calls[_address] - 1;
                    });
                }
                revertNonce(_sender) {
                    throw new Error("Method not implemented.");
                }
            }
            class MockDeploymentLoader extends StubDeploymentLoader {
                recordToJournal(_message) {
                    return __awaiter(this, void 0, void 0, function* () {
                        this.message = _message;
                    });
                }
            }
            it("Should use the recommended network fees", () => __awaiter(void 0, void 0, void 0, function* () {
                class LocalMockJsonRpcClient extends MockJsonRpcClient {
                    constructor() {
                        super(...arguments);
                        this.storedFees = {};
                    }
                    getNetworkFees() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return {
                                maxFeePerGas: 100n,
                                maxPriorityFeePerGas: 50n,
                            };
                        });
                    }
                    sendTransaction(_transactionParams) {
                        return __awaiter(this, void 0, void 0, function* () {
                            this.storedFees = _transactionParams.fees;
                            return "0x1234";
                        });
                    }
                }
                const client = new LocalMockJsonRpcClient();
                const nonceManager = new MockNonceManager();
                const deploymentLoader = new MockDeploymentLoader();
                const onchainInteraction = {
                    to: helpers_1.exampleAccounts[1],
                    data: "0x",
                    value: 0n,
                    id: 1,
                    type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                    transactions: [],
                    shouldBeResent: false,
                };
                yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test");
                chai_1.assert.equal(client.storedFees.maxFeePerGas, 100n);
                chai_1.assert.equal(client.storedFees.maxPriorityFeePerGas, 50n);
            }));
            describe("When allocating a nonce", () => {
                it("Should allocate a nonce when the onchainInteraction doesn't have one", () => __awaiter(void 0, void 0, void 0, function* () {
                    const client = new MockJsonRpcClient();
                    const nonceManager = new MockNonceManager();
                    const deploymentLoader = new MockDeploymentLoader();
                    const onchainInteraction = {
                        to: helpers_1.exampleAccounts[1],
                        data: "0x",
                        value: 0n,
                        id: 1,
                        type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                        transactions: [],
                        shouldBeResent: false,
                    };
                    yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test");
                    chai_1.assert.equal(nonceManager.calls[helpers_1.exampleAccounts[0]], 1);
                }));
                it("Should use the onchainInteraction nonce if present", () => __awaiter(void 0, void 0, void 0, function* () {
                    class LocalMockJsonRpcClient extends MockJsonRpcClient {
                        sendTransaction(_transactionParams) {
                            return __awaiter(this, void 0, void 0, function* () {
                                this.storedNonce = _transactionParams.nonce;
                                return "0x1234";
                            });
                        }
                    }
                    const client = new LocalMockJsonRpcClient();
                    const nonceManager = new MockNonceManager();
                    const deploymentLoader = new MockDeploymentLoader();
                    const onchainInteraction = {
                        to: helpers_1.exampleAccounts[1],
                        data: "0x",
                        value: 0n,
                        nonce: 5,
                        id: 1,
                        type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                        transactions: [],
                        shouldBeResent: false,
                    };
                    yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test");
                    chai_1.assert.equal(nonceManager.calls[helpers_1.exampleAccounts[0]], undefined);
                    chai_1.assert.equal(client.storedNonce, 5);
                }));
            });
            describe("When the gas estimation succeeds", () => {
                describe("When the simulation fails", () => {
                    it("Should return the decoded simulation error", () => __awaiter(void 0, void 0, void 0, function* () {
                        class LocalMockJsonRpcClient extends MockJsonRpcClient {
                            call(_callParams, _blockTag) {
                                return __awaiter(this, void 0, void 0, function* () {
                                    return {
                                        customErrorReported: true,
                                        returnData: "0x1111",
                                        success: false,
                                    };
                                });
                            }
                        }
                        const client = new LocalMockJsonRpcClient();
                        const nonceManager = new MockNonceManager();
                        const deploymentLoader = new MockDeploymentLoader();
                        const onchainInteraction = {
                            to: helpers_1.exampleAccounts[1],
                            data: "0x",
                            value: 0n,
                            id: 1,
                            type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                            transactions: [],
                            shouldBeResent: false,
                        };
                        const mockStrategyGenerator = {
                            next() {
                                return {
                                    value: {
                                        type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                                        error: {
                                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                                            message: "mock error",
                                        },
                                    },
                                };
                            },
                        };
                        const mockExecutionState = {
                            id: "test",
                        };
                        const result = yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, (0, decode_simulation_result_1.decodeSimulationResult)(mockStrategyGenerator, mockExecutionState), deploymentLoader, "test");
                        // type casting
                        if (result.type !== execution_result_1.ExecutionResultType.SIMULATION_ERROR ||
                            result.error.type !== evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON) {
                            return chai_1.assert.fail("Unexpected result type");
                        }
                        chai_1.assert.equal(result.error.message, "mock error");
                    }));
                });
                describe("When the simulation succeeds", () => {
                    it("Should write a TRANSACTION_PREPARE_SEND message to the journal, then send the transaction and return its hash and nonce", () => __awaiter(void 0, void 0, void 0, function* () {
                        var _a;
                        const client = new MockJsonRpcClient();
                        const nonceManager = new MockNonceManager();
                        const deploymentLoader = new MockDeploymentLoader();
                        const onchainInteraction = {
                            to: helpers_1.exampleAccounts[1],
                            data: "0x",
                            value: 0n,
                            id: 1,
                            type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                            transactions: [],
                            shouldBeResent: false,
                        };
                        const result = yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test");
                        // type casting
                        if (result.type !== network_interaction_execution_1.TRANSACTION_SENT_TYPE) {
                            return chai_1.assert.fail("Unexpected result type");
                        }
                        chai_1.assert.equal((_a = deploymentLoader.message) === null || _a === void 0 ? void 0 : _a.type, messages_1.JournalMessageType.TRANSACTION_PREPARE_SEND);
                        chai_1.assert.equal(result.nonce, 0);
                        chai_1.assert.equal(result.transaction.hash, "0x1234");
                    }));
                });
            });
            describe("When the gas estimation fails", () => {
                class LocalMockJsonRpcClient extends MockJsonRpcClient {
                    constructor(_errorMessage) {
                        super();
                        this.errorMessage = "testing failure case";
                        this.errorMessage = _errorMessage !== null && _errorMessage !== void 0 ? _errorMessage : this.errorMessage;
                    }
                    estimateGas(_transactionParams) {
                        return __awaiter(this, void 0, void 0, function* () {
                            throw new Error(this.errorMessage);
                        });
                    }
                    call(_callParams, _blockTag) {
                        return __awaiter(this, void 0, void 0, function* () {
                            return {
                                customErrorReported: true,
                                returnData: "0x1111",
                                success: false,
                            };
                        });
                    }
                }
                describe("When the simulation fails", () => {
                    it("Should return the decoded simulation error", () => __awaiter(void 0, void 0, void 0, function* () {
                        const client = new LocalMockJsonRpcClient();
                        const nonceManager = new MockNonceManager();
                        const deploymentLoader = new MockDeploymentLoader();
                        const onchainInteraction = {
                            to: helpers_1.exampleAccounts[1],
                            data: "0x",
                            value: 0n,
                            id: 1,
                            type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                            transactions: [],
                            shouldBeResent: false,
                        };
                        const mockStrategyGenerator = {
                            next() {
                                return {
                                    value: {
                                        type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                                        error: {
                                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                                            message: "mock error",
                                        },
                                    },
                                };
                            },
                        };
                        const mockExecutionState = {
                            id: "test",
                        };
                        const result = yield (0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, (0, decode_simulation_result_1.decodeSimulationResult)(mockStrategyGenerator, mockExecutionState), deploymentLoader, "test");
                        // type casting
                        if (result.type !== execution_result_1.ExecutionResultType.SIMULATION_ERROR ||
                            result.error.type !== evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON) {
                            return chai_1.assert.fail("Unexpected result type");
                        }
                        chai_1.assert.equal(result.error.message, "mock error");
                    }));
                });
                describe("When the simulation succeeds", () => {
                    describe("When there are insufficient funds for a transfer", () => {
                        it("Should throw an error", () => __awaiter(void 0, void 0, void 0, function* () {
                            const client = new LocalMockJsonRpcClient("insufficient funds for transfer");
                            const nonceManager = new MockNonceManager();
                            const deploymentLoader = new MockDeploymentLoader();
                            const onchainInteraction = {
                                to: helpers_1.exampleAccounts[1],
                                data: "0x",
                                value: 0n,
                                id: 1,
                                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                                transactions: [],
                                shouldBeResent: false,
                            };
                            yield chai_1.assert.isRejected((0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test"), /^IGN408/);
                        }));
                    });
                    describe("When there are insufficient funds for a deployment", () => {
                        it("Should throw an error", () => __awaiter(void 0, void 0, void 0, function* () {
                            const client = new LocalMockJsonRpcClient("contract creation code storage out of gas");
                            const nonceManager = new MockNonceManager();
                            const deploymentLoader = new MockDeploymentLoader();
                            const onchainInteraction = {
                                to: helpers_1.exampleAccounts[1],
                                data: "0x",
                                value: 0n,
                                id: 1,
                                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                                transactions: [],
                                shouldBeResent: false,
                            };
                            yield chai_1.assert.isRejected((0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test"), /^IGN409/);
                        }));
                    });
                    describe("When the gas estimation fails for any other reason", () => {
                        it("Should throw an error", () => __awaiter(void 0, void 0, void 0, function* () {
                            const client = new LocalMockJsonRpcClient("unknown error");
                            const nonceManager = new MockNonceManager();
                            const deploymentLoader = new MockDeploymentLoader();
                            const onchainInteraction = {
                                to: helpers_1.exampleAccounts[1],
                                data: "0x",
                                value: 0n,
                                id: 1,
                                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                                transactions: [],
                                shouldBeResent: false,
                            };
                            yield chai_1.assert.isRejected((0, network_interaction_execution_1.sendTransactionForOnchainInteraction)(client, helpers_1.exampleAccounts[0], onchainInteraction, nonceManager, () => __awaiter(void 0, void 0, void 0, function* () { return undefined; }), deploymentLoader, "test"), /^IGN410/);
                        }));
                    });
                });
            });
        });
    });
    describe("getNextTransactionFees", () => {
        it("Should bump fees and also take recommended network fees into account", () => __awaiter(void 0, void 0, void 0, function* () {
            // TODO @zoeyTM
        }));
        it("Should re-estimate the gas limit", () => __awaiter(void 0, void 0, void 0, function* () {
            // TODO @zoeyTM
        }));
    });
});
class MockGetTransactionJsonRpcClient extends StubJsonRpcClient {
    constructor() {
        super(...arguments);
        this.calls = 0;
        this.callToFindResult = Number.MAX_SAFE_INTEGER;
        this.result = undefined;
    }
    getTransaction(_txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.calls === this.callToFindResult) {
                return this.result;
            }
            this.calls += 1;
            return undefined;
        });
    }
    getLatestBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                hash: "0xblockhas",
                number: 34,
            };
        });
    }
    getTransactionReceipt(_txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                blockHash: "0xblockhash",
                blockNumber: 34,
                contractAddress: "0xcontractaddress",
                logs: [],
                status: jsonrpc_1.TransactionReceiptStatus.SUCCESS,
            };
        });
    }
}
class FakeTransactionTrackingTimer extends transaction_tracking_timer_1.TransactionTrackingTimer {
    getTransactionTrackingTime(_txHash) {
        return 0;
    }
}
