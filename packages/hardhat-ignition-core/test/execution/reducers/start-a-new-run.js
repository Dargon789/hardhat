"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const deployment_state_reducer_1 = require("../../../src/internal/execution/reducers/deployment-state-reducer");
const messages_1 = require("../../../src/internal/execution/types/messages");
describe("DeploymentStateReducer", () => {
    let initialState;
    let updatedState;
    describe("starting a new run", () => {
        beforeEach(() => {
            initialState = (0, deployment_state_reducer_1.deploymentStateReducer)(undefined);
            updatedState = (0, deployment_state_reducer_1.deploymentStateReducer)(initialState, {
                type: messages_1.JournalMessageType.DEPLOYMENT_INITIALIZE,
                chainId: 31337,
            });
        });
        it("should set the chainId", () => {
            chai_1.assert.equal(updatedState.chainId, 31337);
        });
        it("should leave the previous execution states", () => {
            chai_1.assert.deepEqual(initialState.executionStates, updatedState.executionStates);
        });
    });
});
