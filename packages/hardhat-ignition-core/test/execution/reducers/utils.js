"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyMessages = void 0;
const deployment_state_reducer_1 = require("../../../src/internal/execution/reducers/deployment-state-reducer");
function applyMessages(messages) {
    const initialState = (0, deployment_state_reducer_1.deploymentStateReducer)(undefined);
    const updatedState = messages.reduce(deployment_state_reducer_1.deploymentStateReducer, initialState);
    return updatedState;
}
exports.applyMessages = applyMessages;
