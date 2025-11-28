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
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
const wait_for_pending_txs_1 = require("../../test-helpers/wait-for-pending-txs");
/**
 * For all accounts that will be used during the deployment we check
 * to see if there are pending transactions (not from previous runs)
 * and error if there are any.
 */
describe("execution - error on pending user transactions", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "error-on-rerun-with-replaced-pending-user-transaction");
    it("should error if a transaction is in flight for an account used in the deploy", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup a module with a contract deploy on accounts[2]
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                const foo = m.contract("Foo", [], { from: account2 });
                return {
                    foo,
                };
            });
            const FooArtifact = this.hre.artifacts.readArtifactSync("Foo");
            // Before deploy, put a valid transaction into the mempool for accounts[2]
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
            });
            yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
            // Deploying the module that uses accounts[2] throws with a warning
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (_c) => __awaiter(this, void 0, void 0, function* () { })), "IGN403: You have sent transactions from 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc and they interfere with Hardhat Ignition. Please wait until they get 1 confirmations before running Hardhat Ignition again.");
            // Now mine the user interference transaction
            yield (0, mine_block_1.mineBlock)(this.hre);
            // The users interfering transaction completes normally
            const outsideFoo = yield deployPromise;
            chai_1.assert.equal(outsideFoo, "0x3d0ac80b8daf180b4d03e0ff107caa7089b5494cdbd81ba9d7619cc4d710caae");
        });
    });
});
