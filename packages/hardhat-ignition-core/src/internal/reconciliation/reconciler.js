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
exports.Reconciler = void 0;
const errors_1 = require("../../errors");
const errors_list_1 = require("../errors-list");
const execution_state_1 = require("../execution/types/execution-state");
const adjacency_list_1 = require("../utils/adjacency-list");
const adjacency_list_converter_1 = require("../utils/adjacency-list-converter");
const get_futures_from_module_1 = require("../utils/get-futures-from-module");
const reconcile_current_and_previous_type_match_1 = require("./reconcile-current-and-previous-type-match");
const reconcile_dependency_rules_1 = require("./reconcile-dependency-rules");
const reconcile_future_specific_reconciliations_1 = require("./reconcile-future-specific-reconciliations");
class Reconciler {
    static reconcile(module, deploymentState, deploymentParameters, accounts, deploymentLoader, artifactResolver, defaultSender, strategy, strategyConfig) {
        return __awaiter(this, void 0, void 0, function* () {
            const reconciliationFailures = yield this._reconcileEachFutureInModule(module, {
                deploymentState,
                deploymentParameters,
                accounts,
                deploymentLoader,
                artifactResolver,
                defaultSender,
                strategy,
                strategyConfig,
            }, [
                reconcile_current_and_previous_type_match_1.reconcileCurrentAndPreviousTypeMatch,
                reconcile_dependency_rules_1.reconcileDependencyRules,
                reconcile_future_specific_reconciliations_1.reconcileFutureSpecificReconciliations,
            ]);
            // TODO: Reconcile sender of incomplete futures.
            const missingExecutedFutures = this._missingPreviouslyExecutedFutures(module, deploymentState);
            return { reconciliationFailures, missingExecutedFutures };
        });
    }
    static checkForPreviousRunErrors(deploymentState) {
        const failuresOrTimeouts = Object.values(deploymentState.executionStates).filter((exState) => exState.status === execution_state_1.ExecutionStatus.FAILED ||
            exState.status === execution_state_1.ExecutionStatus.TIMEOUT);
        return failuresOrTimeouts.map((exState) => ({
            futureId: exState.id,
            failure: this._previousRunFailedMessageFor(exState),
        }));
    }
    static _previousRunFailedMessageFor(exState) {
        if (exState.status === execution_state_1.ExecutionStatus.FAILED) {
            return `The previous run of the future ${exState.id} failed, and will need wiped before running again`;
        }
        if (exState.status === execution_state_1.ExecutionStatus.TIMEOUT) {
            return `The previous run of the future ${exState.id} timed out, and will need wiped before running again`;
        }
        throw new errors_1.IgnitionError(errors_list_1.ERRORS.RECONCILIATION.INVALID_EXECUTION_STATUS, {
            status: exState.status,
        });
    }
    static _reconcileEachFutureInModule(module, context, checks) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: swap this out for linearization of execution state
            // once execution is fleshed out.
            const futures = this._getFuturesInReverseTopoligicalOrder(module);
            const failures = [];
            for (const future of futures) {
                const exState = context.deploymentState.executionStates[future.id];
                if (exState === undefined) {
                    continue;
                }
                const result = yield this._check(future, exState, context, checks);
                if (result.success) {
                    continue;
                }
                failures.push(result.failure);
            }
            return failures;
        });
    }
    static _missingPreviouslyExecutedFutures(module, deploymentState) {
        const moduleFutures = new Set((0, get_futures_from_module_1.getFuturesFromModule)(module).map((f) => f.id));
        const previouslyStarted = Object.values(deploymentState.executionStates).map((es) => es.id);
        const missing = previouslyStarted.filter((sf) => !moduleFutures.has(sf));
        return missing;
    }
    static _getFuturesInReverseTopoligicalOrder(module) {
        const futures = (0, get_futures_from_module_1.getFuturesFromModule)(module);
        const adjacencyList = adjacency_list_converter_1.AdjacencyListConverter.buildAdjacencyListFromFutures(futures);
        const sortedFutureIds = adjacency_list_1.AdjacencyList.topologicalSort(adjacencyList).reverse();
        return sortedFutureIds
            .map((id) => futures.find((f) => f.id === id))
            .filter((x) => x !== undefined);
    }
    static _check(future, executionState, context, checks) {
        return __awaiter(this, void 0, void 0, function* () {
            for (const check of checks) {
                const result = yield check(future, executionState, context);
                if (result.success) {
                    continue;
                }
                return result;
            }
            return { success: true };
        });
    }
}
exports.Reconciler = Reconciler;
