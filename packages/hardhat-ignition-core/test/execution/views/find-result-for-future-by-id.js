"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const execution_result_1 = require("../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const find_result_for_future_by_id_1 = require("../../../src/internal/views/find-result-for-future-by-id");
describe("find result by future by", () => {
    const futureId = "MyFuture";
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    it("should resolve to the address of a deployment execution state", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE,
                    result: {
                        type: execution_result_1.ExecutionResultType.SUCCESS,
                        address: exampleAddress,
                    },
                },
            },
        };
        const result = (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId);
        chai_1.assert.equal(result, exampleAddress);
    });
    it("should fail a call execution state as there is no result to read", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.CALL_EXECUTION_STATE,
                    result: {
                        type: execution_result_1.ExecutionResultType.SUCCESS,
                    },
                },
            },
        };
        chai_1.assert.throws(() => (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId));
    });
    it("should resolve to the result of a static call", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE,
                    result: {
                        type: execution_result_1.ExecutionResultType.SUCCESS,
                        value: 99n,
                    },
                },
            },
        };
        const result = (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId);
        chai_1.assert.deepStrictEqual(result, 99n);
    });
    it("should error on a send data", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.SEND_DATA_EXECUTION_STATE,
                    result: {
                        type: execution_result_1.ExecutionResultType.SUCCESS,
                    },
                },
            },
        };
        chai_1.assert.throws(() => (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId));
    });
    it("should resolve to the address of a contract at", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.CONTRACT_AT_EXECUTION_STATE,
                    contractAddress: exampleAddress,
                },
            },
        };
        const result = (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId);
        chai_1.assert.deepStrictEqual(result, exampleAddress);
    });
    it("should resolve to the result of a read event argument", () => {
        const deploymentState = {
            executionStates: {
                [futureId]: {
                    type: execution_state_1.ExecutionStateType.READ_EVENT_ARGUMENT_EXECUTION_STATE,
                    result: "abc",
                },
            },
        };
        const result = (0, find_result_for_future_by_id_1.findResultForFutureById)(deploymentState, futureId);
        chai_1.assert.deepStrictEqual(result, "abc");
    });
});
