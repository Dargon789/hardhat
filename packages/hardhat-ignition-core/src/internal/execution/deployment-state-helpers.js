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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldBeJournaled = exports.applyNewMessage = exports.initializeDeploymentState = exports.loadDeploymentState = void 0;
const deployment_state_reducer_1 = require("./reducers/deployment-state-reducer");
const execution_result_1 = require("./types/execution-result");
const messages_1 = require("./types/messages");
/**
 * Loads a previous deployment state from its existing messages.
 * @param messages An async iterator of journal messages.
 * @returns The deployment state or undefined if no messages were provided.
 */
function loadDeploymentState(deploymentLoader) {
    var _a, e_1, _b, _c;
    return __awaiter(this, void 0, void 0, function* () {
        let deploymentState;
        try {
            for (var _d = true, _e = __asyncValues(deploymentLoader.readFromJournal()), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const message = _c;
                    deploymentState = (0, deployment_state_reducer_1.deploymentStateReducer)(deploymentState, message);
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return deploymentState;
    });
}
exports.loadDeploymentState = loadDeploymentState;
/**
 * Ininitalizes the deployment state and records the run start message to the journal.
 *
 * @param chainId The chain ID.
 * @param deploymentLoader The deployment loader that will be used to record the message.
 * @returns The new DeploymentState.
 */
function initializeDeploymentState(chainId, deploymentLoader) {
    return __awaiter(this, void 0, void 0, function* () {
        const message = {
            type: messages_1.JournalMessageType.DEPLOYMENT_INITIALIZE,
            chainId,
        };
        yield deploymentLoader.recordToJournal(message);
        return (0, deployment_state_reducer_1.deploymentStateReducer)(undefined, message);
    });
}
exports.initializeDeploymentState = initializeDeploymentState;
/**
 * This function applies a new message to the deployment state, recording it to the
 * journal if needed.
 *
 * @param message - The message to apply.
 * @param deploymentState - The original deployment state.
 * @param deploymentLoader - The deployment loader that will be used to record the message.
 * @returns The new deployment state.
 */
function applyNewMessage(message, deploymentState, deploymentLoader) {
    return __awaiter(this, void 0, void 0, function* () {
        if (shouldBeJournaled(message)) {
            yield deploymentLoader.recordToJournal(message);
        }
        return (0, deployment_state_reducer_1.deploymentStateReducer)(deploymentState, message);
    });
}
exports.applyNewMessage = applyNewMessage;
/**
 * Returns true if a message should be recorded to the jorunal.
 */
function shouldBeJournaled(message) {
    if (message.type === messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_COMPLETE ||
        message.type === messages_1.JournalMessageType.CALL_EXECUTION_STATE_COMPLETE ||
        message.type === messages_1.JournalMessageType.SEND_DATA_EXECUTION_STATE_COMPLETE) {
        // We do not journal simulation errors, as we want to re-run those simulations
        // if the deployment gets resumed.
        if (message.result.type === execution_result_1.ExecutionResultType.SIMULATION_ERROR ||
            message.result.type === execution_result_1.ExecutionResultType.STRATEGY_SIMULATION_ERROR) {
            return false;
        }
    }
    return true;
}
exports.shouldBeJournaled = shouldBeJournaled;
