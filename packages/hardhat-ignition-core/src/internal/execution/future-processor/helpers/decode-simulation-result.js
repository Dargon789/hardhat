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
exports.decodeSimulationResult = void 0;
const assertions_1 = require("../../../utils/assertions");
const execution_result_1 = require("../../types/execution-result");
const execution_strategy_1 = require("../../types/execution-strategy");
function decodeSimulationResult(strategyGenerator, exState) {
    return (simulationResult) => __awaiter(this, void 0, void 0, function* () {
        const response = yield strategyGenerator.next({
            type: execution_strategy_1.OnchainInteractionResponseType.SIMULATION_RESULT,
            result: simulationResult,
        });
        (0, assertions_1.assertIgnitionInvariant)(response.value.type === execution_strategy_1.SIMULATION_SUCCESS_SIGNAL_TYPE ||
            response.value.type === execution_result_1.ExecutionResultType.STRATEGY_SIMULATION_ERROR ||
            response.value.type === execution_result_1.ExecutionResultType.SIMULATION_ERROR, `Invalid response received from strategy after a simulation was run before sending a transaction for ExecutionState ${exState.id}`);
        if (response.value.type === execution_strategy_1.SIMULATION_SUCCESS_SIGNAL_TYPE) {
            return undefined;
        }
        return response.value;
    });
}
exports.decodeSimulationResult = decodeSimulationResult;
