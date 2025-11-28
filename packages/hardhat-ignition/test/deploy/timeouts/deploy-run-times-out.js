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
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * A run that deploys a contract times out
 */
describe("execution - deploy run times out", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "deploy-run-times-out", {
        blockPollingInterval: 50,
        timeBeforeBumpingFees: 45,
        maxFeeBumps: 2,
        requiredConfirmations: 1,
    });
    it("should error naming timed out transactions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup a module with a contract deploy on accounts[2]
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                const foo = m.contract("Foo", [], { from: account2 });
                return {
                    foo,
                };
            });
            // Deploying the module that uses accounts[2] throws with a warning
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // wait for the deploy transaction to hit the memory pool,
                // but then bump the base fee so that it doesn't get mined,
                // with the next block
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(10000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(100000000000n);
                yield c.mineBlock();
                yield c.waitForPendingTxs(1);
                yield (0, hardhat_network_helpers_1.setNextBlockBaseFeePerGas)(1000000000000n);
                yield c.mineBlock();
            })), "The deployment wasn't successful, there were timeouts:\n\nTimed out:\n\n  * FooModule#Foo/1");
        });
    });
});
