"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const execution_result_1 = require("../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const jsonrpc_1 = require("../../../src/internal/execution/types/jsonrpc");
const messages_1 = require("../../../src/internal/execution/types/messages");
const network_interaction_1 = require("../../../src/internal/execution/types/network-interaction");
const find_execution_state_by_id_1 = require("../../../src/internal/views/find-execution-state-by-id");
const module_1 = require("../../../src/types/module");
const utils_1 = require("./utils");
describe("DeploymentStateReducer", () => {
    describe("running a named library deploy", () => {
        const senderAddress = "0x0011223344556677889900112233445566778899";
        const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        let updatedDeploymentState;
        let updatedDepExState;
        const initializeNamedLibraryDeployMessage = {
            type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
            futureId: "future1",
            futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
            strategy: "basic",
            strategyConfig: {},
            dependencies: [],
            artifactId: "future1",
            contractName: "MyLibrary",
            constructorArgs: [],
            libraries: {},
            value: BigInt(0),
            from: senderAddress,
        };
        const requestNetworkInteractionMessage = {
            type: messages_1.JournalMessageType.NETWORK_INTERACTION_REQUEST,
            futureId: "future1",
            networkInteraction: {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
                to: undefined,
                data: "fake-data",
                value: BigInt(0),
            },
        };
        const sendTransactionMessage = {
            type: messages_1.JournalMessageType.TRANSACTION_SEND,
            futureId: "future1",
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
        const confirmTransactionMessage = {
            type: messages_1.JournalMessageType.TRANSACTION_CONFIRM,
            futureId: "future1",
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
        const deploymentSuccessMessage = {
            type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_COMPLETE,
            futureId: "future1",
            result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            },
        };
        describe("initialization", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeNamedLibraryDeployMessage,
                ]);
                updatedDepExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE, updatedDeploymentState, "future1");
            });
            it("should populate a deployment execution state for the future", () => {
                chai_1.assert.equal(updatedDepExState.type, execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE);
            });
        });
        describe("deployment completes successfully", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeNamedLibraryDeployMessage,
                    requestNetworkInteractionMessage,
                    sendTransactionMessage,
                    confirmTransactionMessage,
                    deploymentSuccessMessage,
                ]);
                updatedDepExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE, updatedDeploymentState, "future1");
            });
            it("should set the result against the execution state", () => {
                chai_1.assert.deepStrictEqual(updatedDepExState.result, {
                    type: execution_result_1.ExecutionResultType.SUCCESS,
                    address: exampleAddress,
                });
            });
            it("should update the status to success", () => {
                chai_1.assert.deepStrictEqual(updatedDepExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            });
        });
    });
});
