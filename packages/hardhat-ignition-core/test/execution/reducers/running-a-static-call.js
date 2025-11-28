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
const messages_1 = require("../../../src/internal/execution/types/messages");
const network_interaction_1 = require("../../../src/internal/execution/types/network-interaction");
const find_execution_state_by_id_1 = require("../../../src/internal/views/find-execution-state-by-id");
const utils_1 = require("./utils");
describe("DeploymentStateReducer", () => {
    describe("running a static call", () => {
        const senderAddress = "0x0011223344556677889900112233445566778899";
        const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
        let updatedDeploymentState;
        let updatedStaticCallExState;
        const initializeCallExecutionStateMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_EXECUTION_STATE_INITIALIZE,
            futureId: "StaticCall1",
            strategy: "basic",
            strategyConfig: {},
            dependencies: [],
            artifactId: "Contract1",
            contractAddress: exampleAddress,
            functionName: "configure",
            args: ["a", BigInt(2)],
            nameOrIndex: 0,
            from: senderAddress,
        };
        const requestStaticCallInteractionMessage = {
            type: messages_1.JournalMessageType.NETWORK_INTERACTION_REQUEST,
            futureId: "StaticCall1",
            networkInteraction: {
                id: 1,
                type: network_interaction_1.NetworkInteractionType.STATIC_CALL,
                to: exampleAddress,
                data: "fake-data",
                value: BigInt(0),
                from: differentAddress,
            },
        };
        const completeStaticCallInteractionMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_COMPLETE,
            futureId: "StaticCall1",
            networkInteractionId: 1,
            result: {
                returnData: "example-return-data",
                success: true,
                customErrorReported: false,
            },
        };
        const failStaticCallInteractionMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_COMPLETE,
            futureId: "StaticCall1",
            networkInteractionId: 1,
            result: {
                returnData: "failure-data",
                success: false,
                customErrorReported: true,
            },
        };
        const staticCallExStateSuccessMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_EXECUTION_STATE_COMPLETE,
            futureId: "StaticCall1",
            result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                value: 1n,
            },
        };
        const staticCallStrategyErrorMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_EXECUTION_STATE_COMPLETE,
            futureId: "StaticCall1",
            result: {
                type: execution_result_1.ExecutionResultType.STRATEGY_ERROR,
                error: "Static call failed",
            },
        };
        const staticCallFailedMessage = {
            type: messages_1.JournalMessageType.STATIC_CALL_EXECUTION_STATE_COMPLETE,
            futureId: "StaticCall1",
            result: {
                type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                error: {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_PANIC_CODE,
                    panicCode: 404,
                    panicName: "Not found",
                },
            },
        };
        describe("initialization", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should populate a static call execution state for the future", () => {
                chai_1.assert.equal(updatedStaticCallExState.type, execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE);
            });
        });
        describe("strategy requesting a static call interaction", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestStaticCallInteractionMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should populate a new static call interaction", () => {
                chai_1.assert.equal(updatedStaticCallExState.networkInteractions.length, 1);
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.networkInteractions[0], requestStaticCallInteractionMessage.networkInteraction);
            });
        });
        describe("execution engine successfully performs static call", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestStaticCallInteractionMessage,
                    completeStaticCallInteractionMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should set the result against the static call interaction", () => {
                chai_1.assert.equal(updatedStaticCallExState.networkInteractions.length, 1);
                const _a = updatedStaticCallExState.networkInteractions[0], { result: actualResult } = _a, actualRest = __rest(_a, ["result"]);
                chai_1.assert.deepStrictEqual(actualRest, requestStaticCallInteractionMessage.networkInteraction);
                chai_1.assert.deepStrictEqual(actualResult, completeStaticCallInteractionMessage.result);
            });
        });
        describe("strategy indicates static call completes successfully", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestStaticCallInteractionMessage,
                    completeStaticCallInteractionMessage,
                    staticCallExStateSuccessMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should set the result against the execution state", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.SUCCESS,
                    value: 1n,
                });
            });
            it("should update the status to success", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            });
        });
        describe("strategy indicates static call errored with failed call", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    requestStaticCallInteractionMessage,
                    failStaticCallInteractionMessage,
                    staticCallFailedMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should set the result against the execution state", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.STATIC_CALL_ERROR,
                    error: {
                        type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_PANIC_CODE,
                        panicCode: 404,
                        panicName: "Not found",
                    },
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
        describe("strategy indicates static call errored with custom strategy error", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeCallExecutionStateMessage,
                    staticCallStrategyErrorMessage,
                ]);
                updatedStaticCallExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE, updatedDeploymentState, "StaticCall1");
            });
            it("should set the result against the execution state", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.result, {
                    type: execution_result_1.ExecutionResultType.STRATEGY_ERROR,
                    error: "Static call failed",
                });
            });
            it("should update the status to failed", () => {
                chai_1.assert.deepStrictEqual(updatedStaticCallExState.status, execution_state_1.ExecutionStatus.FAILED);
            });
        });
    });
});
