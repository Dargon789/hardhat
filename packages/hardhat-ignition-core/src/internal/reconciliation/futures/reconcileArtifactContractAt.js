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
exports.reconcileArtifactContractAt = void 0;
const reconcile_address_1 = require("../helpers/reconcile-address");
const reconcile_artifacts_1 = require("../helpers/reconcile-artifacts");
const reconcile_contract_name_1 = require("../helpers/reconcile-contract-name");
const reconcile_strategy_1 = require("../helpers/reconcile-strategy");
function reconcileArtifactContractAt(future, executionState, context) {
    return __awaiter(this, void 0, void 0, function* () {
        let result = (0, reconcile_contract_name_1.reconcileContractName)(future, executionState, context);
        if (result !== undefined) {
            return result;
        }
        result = yield (0, reconcile_artifacts_1.reconcileArtifacts)(future, executionState, context);
        if (result !== undefined) {
            return result;
        }
        result = (0, reconcile_address_1.reconcileAddress)(future, executionState, context);
        if (result !== undefined) {
            return result;
        }
        result = (0, reconcile_strategy_1.reconcileStrategy)(future, executionState, context);
        if (result !== undefined) {
            return result;
        }
        return { success: true };
    });
}
exports.reconcileArtifactContractAt = reconcileArtifactContractAt;
