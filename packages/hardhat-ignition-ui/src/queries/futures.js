"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCallFuturesFor = exports.getAllDeployFuturesFor = exports.getAllFuturesForModule = exports.getFutureById = void 0;
const ui_helpers_1 = require("@nomicfoundation/ignition-core/ui-helpers");
function getFutureById(ignitionModule, futureId) {
    if (futureId === undefined) {
        return undefined;
    }
    const f = getAllFuturesForModule(ignitionModule).find((f) => f.id === futureId);
    if (f === undefined) {
        return undefined;
    }
    return f;
}
exports.getFutureById = getFutureById;
/* Get all futures in a module and its submodules */
function getAllFuturesForModule({ futures, submodules, }) {
    return Array.from(futures)
        .concat(Array.from(submodules.values()).flatMap((submodule) => getAllFuturesForModule(submodule)))
        .filter((v, i, a) => a.indexOf(v) === i); // remove duplicates
}
exports.getAllFuturesForModule = getAllFuturesForModule;
/**
 * Get all deploy futures in a module and its submodules, including:
 * - hardhat contract deploys
 * - artifact contract deploys
 * - library deploys
 * - artifact library deploys
 */
function getAllDeployFuturesFor(ignitionModule) {
    return getAllFuturesForModule(ignitionModule).filter(ui_helpers_1.isDeploymentFuture);
}
exports.getAllDeployFuturesFor = getAllDeployFuturesFor;
/**
 * Get all calls in a module and its submodules
 */
function getAllCallFuturesFor(ignitionModule) {
    return getAllFuturesForModule(ignitionModule).filter(ui_helpers_1.isFunctionCallFuture);
}
exports.getAllCallFuturesFor = getAllCallFuturesFor;
