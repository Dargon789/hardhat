"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const evm_execution_1 = require("../../../src/internal/execution/types/evm-execution");
const execution_result_1 = require("../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const jsonrpc_1 = require("../../../src/internal/execution/types/jsonrpc");
const messages_1 = require("../../../src/internal/execution/types/messages");
const network_interaction_1 = require("../../../src/internal/execution/types/network-interaction");
const assertions_1 = require("../../../src/internal/utils/assertions");
const find_onchain_interaction_by_1 = require("../../../src/internal/views/execution-state/find-onchain-interaction-by");
const find_transaction_by_1 = require("../../../src/internal/views/execution-state/find-transaction-by");
const find_execution_state_by_id_1 = require("../../../src/internal/views/find-execution-state-by-id");
const utils_1 = require("./utils");
describe("DeploymentStateReducer", () => {
    describe("running a named library deploy", () => {
        const senderAddress = "0x0011223344556677889900112233445566778899";
        const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
        const revertedTxHash = "0x0011223344556677889900112233445566778899001122334455667788990011";
        let updatedDeploymentState;
        let updatedStaticCallExState;
        const initializeCallExecutionStateMessage = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_INITIALIZE,
            futureId: "Call1",
            strategy: "basic",
            strategyConfig: {},
            dependencies: [],
            artifactId: "Contract1",
            contractAddress: exampleAddress,
            functionName: "configure",
            args: ["a", BigInt(2)],
            value: BigInt(0),
            from: senderAddress,
        };
        const requestNetworkInteractionMessage = {
            type: messages_1.JournalMessageType.NETWORK_INTERACTION_REQUEST,
            futureId: "Call1",
            networkInteraction: {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: undefined,
                data: "fake-data",
                value: BigInt(0),
            },
        };
        const requestStaticCallInteractionMessage = {
            type: messages_1.JournalMessageType.NETWORK_INTERACTION_REQUEST,
            futureId: "Call1",
            networkInteraction: {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.STATIC_CALL,
                to: undefined,
                data: "fake-data",
                value: BigInt(0),
                from: differentAddress,
            },
        };
        const sendTransactionMessage = {
            type: messages_1.JournalMessageType.TRANSACTION_SEND,
            futureId: "Call1",
            networkInteractionId: 1,
            transaction: {
                hash: "0xdeadbeef",
                fees: {
                    maxFeePerGas: BigInt(10),
                    maxPriorityFeePerGas: BigInt(5),
                },
            },
            nonce: 0,
        };
        const sendAnotherTransactionMessage = {
            type: messages_1.JournalMessageType.TRANSACTION_SEND,
            futureId: "Call1",
            networkInteractionId: 1,
            transaction: {
                hash: "0xanother",
                fees: {
                    maxFeePerGas: BigInt(25),
                    maxPriorityFeePerGas: BigInt(15),
                },
            },
            nonce: 0,
        };
        const confirmTransactionMessage = {
            type: messages_1.JournalMessageType.TRANSACTION_CONFIRM,
            futureId: "Call1",
            networkInteractionId: 1,
            hash: "0xdeadbeef",
            receipt: {
                blockHash: "0xblockhash",
                blockNumber: 0,
                contractAddress: exampleAddress,
                status: jsonrpc_1.TransactionReceiptStatus.SUCCESS,
                logs: [],
            },
        };
        const callSuccessMessage = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE,
            futureId: "Call1",
            result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
            },
        };
        const callFailsWithRevertMessage = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE,
            futureId: "Call1",
            result: {
                type: execution_result_1.ExecutionResultType.REVERTED_TRANSACTION,
                txHash: revertedTxHash,
            },
        };
        const callFailsOnStaticCall = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE,
            futureId: "Call1",
            result: {
                type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                error: {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                    message: "Not a valid parameter value",
                },
            },
        };
        const callFailsOnStrategyError = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE,
            futureId: "Call1",
            result: {
                type: execution_result_1.ExecutionResultType.STRATEGY_ERROR,
                error: `Transaction 0xdeadbeaf confirmed but it didn't create a contract`,
            },
        };
        const callFailOnSimulationError = {
            type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE,
            futureId: "Call1",
            result: {
                type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                error: {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                    message: "Not a valid parameter value",
                },
            },
        };
        describe("initialization", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should populate a call execution state for the future", () => {
                chai_1.assert.equal(updatedStaticCallExState.type, execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE);
            });
        });
        describe("strategy requesting an onchain interaction", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should populate a new onchain interaction", () => {
                chai_1.assert.equal(updatedStaticCallExState.networkInteractions.length, 1);
                const networkInteraction = updatedStaticCallExState.networkInteractions[0];
                (0, assertions_1.assertIgnitionInvariant)(networkInteraction.type ===
                    network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION, "Added Network interaction is of the wrong type ");
                const { transactions, shouldBeResent, nonce } = networkInteraction, rest = __rest(networkInteraction, ["transactions", "shouldBeResent", "nonce"]);
                chai_1.assert.deepStrictEqual(rest, requestNetworkInteractionMessage.networkInteraction);
                chai_1.assert.isArray(transactions);
                chai_1.assert.lengthOf(transactions, 0);
                chai_1.assert.isFalse(shouldBeResent);
                chai_1.assert.isUndefined(nonce);
            });
        });
        describe("execution engine sends transaction", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                    sendTransactionMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should populate the transaction against the network interaction", () => {
                const networkInteraction = (0, find_onchain_interaction_by_1.findOnchainInteractionBy)(updatedStaticCallExState, 1);
                chai_1.assert.equal(networkInteraction.transactions.length, 1);
                const transaction = (0, find_transaction_by_1.findTransactionBy)(updatedStaticCallExState, 1, "0xdeadbeef");
                chai_1.assert.deepStrictEqual(sendTransactionMessage.transaction, transaction);
            });
        });
        describe("transaction confirms successfully", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                    sendTransactionMessage,
                    sendAnotherTransactionMessage,
                    confirmTransactionMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the receipt against the successful transaction", () => {
                const transaction = (0, find_transaction_by_1.findTransactionBy)(updatedStaticCallExState, 1, "0xdeadbeef");
                chai_1.assert.deepStrictEqual(transaction.receipt, confirmTransactionMessage.receipt);
            });
            it("should clear all other transactions for the network interaction", () => {
                const networkInteraction = (0, find_onchain_interaction_by_1.findOnchainInteractionBy)(updatedStaticCallExState, 1);
                chai_1.assert.equal(networkInteraction.transactions.length, 1);
            });
        });
        describe("strategy indicates call completes successfully", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                    sendTransactionMessage,
                    sendAnotherTransactionMessage,
                    confirmTransactionMessage,
                    callSuccessMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the result against the execution state", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.SUCCESS,
                });
            });
            it("should update the status to success", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            });
        });
        describe("call errors on a revert", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                    sendTransactionMessage,
                    callFailsWithRevertMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the result as a revert", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.REVERTED_TRANSACTION,
                    txHash: revertedTxHash,
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.equal(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
        describe("call errors after a failed static call", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestStaticCallInteractionMessage,
                    callFailsOnStaticCall,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the result as a static call error", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                    error: {
                        type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                        message: "Not a valid parameter value",
                    },
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.equal(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
        describe("call errors after a strategy error", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    callFailsOnStrategyError,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the result as a strategy error", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.STRATEGY_ERROR,
                    error: "Transaction 0xdeadbeaf confirmed but it didn't create a contract",
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.equal(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
        describe("call errors after a simulation error", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestNetworkInteractionMessage,
                    callFailOnSimulationError,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE, updatedDeploymentState, "Call1");
            });
            it("should set the result as a simulation error", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.SIMULATION_ERROR,
                    error: {
                        type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                        message: "Not a valid parameter value",
                    },
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.equal(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
    });
});
