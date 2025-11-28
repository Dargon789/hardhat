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
exports.takeSnapshot = void 0;
const errors_1 = require("../errors");
const utils_1 = require("../utils");
/**
 * Takes a snapshot of the state of the blockchain at the current block.
 *
 * Returns an object with a `restore` method that can be used to reset the
 * network to this state.
 */
function takeSnapshot() {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        let snapshotId = yield provider.request({
            method: "evm_snapshot",
        });
        if (typeof snapshotId !== "string") {
            throw new errors_1.HardhatNetworkHelpersError("Assertion error: the value returned by evm_snapshot should be a string");
        }
        return {
            restore: () => __awaiter(this, void 0, void 0, function* () {
                const reverted = yield provider.request({
                    method: "evm_revert",
                    params: [snapshotId],
                });
                if (typeof reverted !== "boolean") {
                    throw new errors_1.HardhatNetworkHelpersError("Assertion error: the value returned by evm_revert should be a boolean");
                }
                if (!reverted) {
                    throw new errors_1.InvalidSnapshotError();
                }
                // re-take the snapshot so that `restore` can be called again
                snapshotId = yield provider.request({
                    method: "evm_snapshot",
                });
            }),
            snapshotId,
        };
    });
}
exports.takeSnapshot = takeSnapshot;
