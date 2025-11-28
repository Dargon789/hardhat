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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Wiper = void 0;
const errors_1 = require("../errors");
const errors_list_1 = require("./errors-list");
const deployment_state_helpers_1 = require("./execution/deployment-state-helpers");
const messages_1 = require("./execution/types/messages");
class Wiper {
    constructor(_deploymentLoader) {
        this._deploymentLoader = _deploymentLoader;
    }
    wipe(futureId) {
        return __awaiter(this, void 0, void 0, function* () {
            const deploymentState = yield (0, deployment_state_helpers_1.loadDeploymentState)(this._deploymentLoader);
            if (deploymentState === undefined) {
                throw new errors_1.IgnitionError(errors_list_1.ERRORS.WIPE.UNINITIALIZED_DEPLOYMENT, {
                    futureId,
                });
            }
            const executionState = deploymentState.executionStates[futureId];
            if (executionState === undefined) {
                throw new errors_1.IgnitionError(errors_list_1.ERRORS.WIPE.NO_STATE_FOR_FUTURE, { futureId });
            }
            const dependents = Object.values(deploymentState.executionStates).filter((psm) => psm.dependencies.has(futureId));
            if (dependents.length > 0) {
                throw new errors_1.IgnitionError(errors_list_1.ERRORS.WIPE.DEPENDENT_FUTURES, {
                    futureId,
                    dependents: dependents.map((d) => d.id).join(", "),
                });
            }
            const wipeMessage = {
                type: messages_1.JournalMessageType.WIPE_APPLY,
                futureId,
            };
            return (0, deployment_state_helpers_1.applyNewMessage)(wipeMessage, deploymentState, this._deploymentLoader);
        });
    }
}
exports.Wiper = Wiper;
