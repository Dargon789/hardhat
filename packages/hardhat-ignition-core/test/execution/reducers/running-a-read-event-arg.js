"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const messages_1 = require("../../../src/internal/execution/types/messages");
const find_execution_state_by_id_1 = require("../../../src/internal/views/find-execution-state-by-id");
const utils_1 = require("./utils");
describe("DeploymentStateReducer", () => {
    describe("running a read event arg", () => {
        const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        let updatedDeploymentState;
        let updatedReadEventExState;
        const initializeReadEventArgExecutionStateMessage = {
            type: messages_1.JournalMessageType.READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE,
            futureId: "ReadEventArg1",
            strategy: "basic",
            strategyConfig: {},
            dependencies: [],
            artifactId: "ReadEventArg1",
            eventName: "event1",
            nameOrIndex: "arg1",
            txToReadFrom: "0x1234",
            emitterAddress: exampleAddress,
            eventIndex: 1,
            result: [BigInt(1), "0x1234"],
        };
        describe("initialization", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeReadEventArgExecutionStateMessage,
                ]);
                updatedReadEventExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.READ_EVENT_ARGUMENT_EXECUTION_STATE, updatedDeploymentState, "ReadEventArg1");
            });
            it("should populate a read event argument execution state for the future", () => {
                chai_1.assert.equal(updatedReadEventExState.type, execution_state_1.ExecutionStateType.READ_EVENT_ARGUMENT_EXECUTION_STATE);
            });
            it("should set the contract at as already succeeded", () => {
                chai_1.assert.equal(updatedReadEventExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            });
            it("should record the event arg value as the result", () => {
                chai_1.assert.deepStrictEqual(updatedReadEventExState.result, [
                    BigInt(1),
                    "0x1234",
                ]);
            });
            it("should record the details of the event being looked up", () => {
                chai_1.assert.equal(updatedReadEventExState.artifactId, "ReadEventArg1");
                chai_1.assert.equal(updatedReadEventExState.eventName, "event1");
                chai_1.assert.equal(updatedReadEventExState.nameOrIndex, "arg1");
                chai_1.assert.equal(updatedReadEventExState.txToReadFrom, "0x1234");
                chai_1.assert.equal(updatedReadEventExState.emitterAddress, exampleAddress);
                chai_1.assert.equal(updatedReadEventExState.eventIndex, 1);
            });
        });
    });
});
