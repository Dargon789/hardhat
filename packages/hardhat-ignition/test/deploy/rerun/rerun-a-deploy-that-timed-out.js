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
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const hardhat_artifact_resolver_1 = require("../../../src/hardhat-artifact-resolver");
const mine_block_1 = require("../../test-helpers/mine-block");
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * A run that deploys a contract times out
 *
 * TODO: Needs to be updated to deal with fee bumps
 */
describe("execution - rerun a deploy that timed out", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-a-deploy-that-timed-out", {
        blockPollingInterval: 50,
        timeBeforeBumpingFees: 45,
        maxFeeBumps: 2,
        requiredConfirmations: 1,
    });
    it("shows an error indicating a wipe is required", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup a module with a contract deploy on accounts[2]
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                const foo = m.contract("Foo", [], { from: account2 });
                return {
                    foo,
                };
            });
            // Deploying the module that uses accounts[2], but force timeout,
            // by not processing any blocks
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // wait for the deploy transaction to hit the memory pool,
                // but then never mine the block that will complete it.
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(10000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(100000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(1000000000000n);
                yield c.mineBlock();
            })));
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Mine the block, confirming foo
                yield c.mineBlock(1);
            })), `The deployment wasn\'t run because of the following errors in a previous run:

  * FooModule#Foo: The previous run of the future FooModule#Foo timed out, and will need wiped before running again`);
        });
    });
    /**
     * Perform a run that times out by manipulating the base fee. Reset the base fee
     * and wipe the future, the run again.
     *
     * A new second transaction is submitted that succeeds.
     */
    it("should successfully rerun after a timeout (and a wipe)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup a module with a contract deploy on accounts[2]
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                const foo = m.contract("Foo", [], { from: account2 });
                return {
                    foo,
                };
            });
            // Deploying the module that uses accounts[2], but force timeout,
            // by not processing any blocks
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // wait for the deploy transaction to hit the memory pool,
                // but then never mine the block that will complete it.
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(10000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(100000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(1000000000000n);
                yield c.mineBlock();
            })));
            yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(1000000n);
            yield (0, mine_block_1.mineBlock)(this.hre);
            yield (0, ignition_core_1.wipe)(this.deploymentDir, new hardhat_artifact_resolver_1.HardhatArtifactResolver(this.hre), "FooModule#Foo");
            const result = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Mine the block, confirming foo
                yield c.mineBlock(1);
            }));
            chai_1.assert.isDefined(result);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
});
