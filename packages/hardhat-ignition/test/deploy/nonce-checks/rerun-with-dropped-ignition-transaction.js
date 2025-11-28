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
/* eslint-disable import/no-unused-modules */
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const clear_pending_transactions_from_memory_pool_1 = require("../../test-helpers/clear-pending-transactions-from-memory-pool");
const mine_block_1 = require("../../test-helpers/mine-block");
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * Run an initial deploy, that starts but does not finish an on-chain
 * transaction. The transaction is dropped from the memory pool. On rerun
 * the transaction should be resubmitted.
 */
describe("execution - rerun with dropped ignition transactions", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-with-dropped-ignition-transactions");
    it("should deploy successfully on second run", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const foo = m.contract("Foo", []);
                return {
                    foo,
                };
            });
            // Start the deploy
            yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Wait for the submission of foo to mempool
                yield c.waitForPendingTxs(1);
                // kill the deployment before confirming foo
                c.exitDeploy();
            }));
            // remove the submitted foo deploy from mempool
            yield (0, clear_pending_transactions_from_memory_pool_1.clearPendingTransactionsFromMemoryPool)(this.hre);
            // Further blocks with no pending transactions
            yield (0, mine_block_1.mineBlock)(this.hre);
            yield (0, mine_block_1.mineBlock)(this.hre);
            // Rerun the deployment
            const result = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block shound include deployment of foo via resend
                yield c.mineBlock(1);
            }));
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
});
