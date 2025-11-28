"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const messages_1 = require("../../../src/internal/execution/types/messages");
const find_execution_state_by_id_1 = require("../../../src/internal/views/find-execution-state-by-id");
const module_1 = require("../../../src/types/module");
const utils_1 = require("./utils");
describe("DeploymentStateReducer", () => {
    describe("running a contract at", () => {
        const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
        // const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
        let updatedDeploymentState;
        let updatedContractAtExState;
        const initializeContractAtExecutionStateMessage = {
            type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
            futureId: "ContractAt1",
            futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
            strategy: "basic",
            strategyConfig: {},
            dependencies: [],
            artifactId: "ContractAt1",
            contractName: "ContractAt1",
            contractAddress: exampleAddress,
        };
        describe("initialization", () => {
            beforeEach(() => {
                updatedDeploymentState = (0, utils_1.applyMessages)([
                    initializeContractAtExecutionStateMessage,
                ]);
                updatedContractAtExState = (0, find_execution_state_by_id_1.findExecutionStateById)(execution_state_1.ExecutionStateType.CONTRACT_AT_EXECUTION_STATE, updatedDeploymentState, "ContractAt1");
            });
            it("should populate a contract at execution state for the future", () => {
                chai_1.assert.equal(updatedContractAtExState.type, execution_state_1.ExecutionStateType.CONTRACT_AT_EXECUTION_STATE);
            });
            it("should set the contract at as already succeeded", () => {
                chai_1.assert.equal(updatedContractAtExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            });
            it("should populate the relevant contract fields", () => {
                chai_1.assert.equal(updatedContractAtExState.artifactId, "ContractAt1");
                chai_1.assert.equal(updatedContractAtExState.contractName, "ContractAt1");
                chai_1.assert.equal(updatedContractAtExState.contractAddress, exampleAddress);
            });
        });
    });
});
