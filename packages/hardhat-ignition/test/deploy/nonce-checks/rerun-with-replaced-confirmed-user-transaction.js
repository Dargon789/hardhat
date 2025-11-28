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
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const mine_block_1 = require("../../test-helpers/mine-block");
const sleep_1 = require("../../test-helpers/sleep");
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * Run an initial deploy, that starts but does not finish several on-chain
 * transactions via Ignition. The user then replaces a transaction by
 * reusing a nonce with a higher gas value. The user submitted transaction
 * confirms between runs. On the rerun we should we should resubmit
 * the original transaction with a new nonce.
 */
describe("execution - rerun with replaced confirmed user transaction", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-with-replaced-confirmed-user-transaction", {
        requiredConfirmations: 2,
    });
    it.skip("should deploy user interfered transaction on second run", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                // batch 1
                const foo1 = m.contract("Foo", [], { id: "Foo1", from: account2 });
                const foo2 = m.contract("Foo", [], { id: "Foo2", from: account2 });
                const foo3 = m.contract("Foo", [], { id: "Foo3", from: account2 });
                return {
                    foo1,
                    foo2,
                    foo3,
                };
            });
            // First run fo the deploy
            yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Wait for the submission of foo1 foo2 and foo3 to mempool,
                // then kill the deploy process
                yield c.waitForPendingTxs(3);
                c.exitDeploy();
            }));
            const FooArtifact = this.hre.artifacts.readArtifactSync("Foo");
            // Submit a user interfering deploy transaction
            // to the mempool reusing nonce 2
            const [, , signer2] = (yield this.hre.network.provider.request({
                method: "eth_accounts",
            }));
            const walletClient = (0, viem_1.createWalletClient)({
                chain: chains_1.hardhat,
                transport: (0, viem_1.custom)(this.hre.network.provider),
            });
            const deployPromise = walletClient.deployContract({
                abi: FooArtifact.abi,
                bytecode: FooArtifact.bytecode,
                args: [],
                account: signer2,
                gasPrice: (0, viem_1.parseEther)("500", "gwei"),
                nonce: 2,
            });
            // mine a block confirming foo1, foo2, and the user provided transaction
            // foo3 is no longer in the mempool
            yield (0, sleep_1.sleep)(300);
            yield (0, mine_block_1.mineBlock)(this.hre);
            // Rerun the deployment with foo3 replaced, causing it to
            // be resubmitted
            const result = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block should confirm foo3
                yield c.mineBlock(1);
            }));
            chai_1.assert.isDefined(result);
            chai_1.assert.equal(yield result.foo1.read.x(), 1n);
            chai_1.assert.equal(yield result.foo2.read.x(), 1n);
            chai_1.assert.equal(yield result.foo3.read.x(), 1n);
            // the user deployed contract is working as well
            const userDeployed = yield deployPromise;
            (0, chai_1.assert)(userDeployed);
        });
    });
});
