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
const mine_block_1 = require("../../test-helpers/mine-block");
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * Run an initial deploy, that deploys a contract. The module is modified
 * to add an additional dependent contract. On the second run only one contract
 * is deployed.
 */
describe("execution - rerun with new contract deploy", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-with-new-contract-deploy");
    it("should deploy only one contract on second run", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("BarModule", (m) => {
                const bar = m.contract("Bar");
                return {
                    bar,
                };
            });
            // Start the deploy
            const { bar: originalBar } = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block shound include deployment of foo1
                yield c.mineBlock(1);
            }));
            const firstRunBarAddress = originalBar.address.toLowerCase();
            // Further blocks with no pending transactions
            yield (0, mine_block_1.mineBlock)(this.hre);
            yield (0, mine_block_1.mineBlock)(this.hre);
            const updatedModuleDefinition = (0, ignition_core_1.buildModule)("BarModule", (m) => {
                const bar = m.contract("Bar");
                const usesContract = m.contract("UsesContract", [bar]);
                return {
                    bar,
                    usesContract,
                };
            });
            // Rerun the deployment
            const result = yield this.runControlledDeploy(updatedModuleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block shound include deployment of foo2
                yield c.mineBlock(1);
            }));
            const usedAddress = (yield result.usesContract.read.contractAddress()).toLowerCase();
            const secondRunBarAddress = result.bar.address.toLowerCase();
            // The BarModule#Bar contract has not been redeployed if
            // it shares the same address.
            chai_1.assert.equal(firstRunBarAddress, secondRunBarAddress);
            chai_1.assert.equal(usedAddress, secondRunBarAddress);
        });
    });
});
