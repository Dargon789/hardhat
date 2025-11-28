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
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * Run an initial deploy, that starts but does not finish several on-chain
 * transactions via Ignition. The user then replaces a transaction by
 * reusing a nonce with a higher gas value. On the rerun we should
 * error that there is a pending non-ignition transaction.
 */
describe("execution - error on rerun with replaced pending user transaction", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "error-on-rerun-with-replaced-pending-user-transaction");
    it("should error on the second run", function () {
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
            // Start the deployment, but exit before processing a block,
            // so transactions are in memory pool but not confirmed
            yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Wait for the submission of foo1 foo2 and foo3 to mempool
                yield c.waitForPendingTxs(3);
                // Then kill before any blocks
                c.exitDeploy();
            }));
            const FooArtifact = this.hre.artifacts.readArtifactSync("Foo");
            // Send user interefering deploy transaction, between runs
            // so it is in mempool, overriding the existing nonce 2
            // transaction
            const [, , signer2] = (yield this.hre.network.provider.request({
                method: "eth_accounts",
            }));
            const walletClient = (0, viem_1.createWalletClient)({
                chain: chains_1.hardhat,
                transport: (0, viem_1.custom)(this.hre.network.provider),
            });
            void walletClient.deployContract({
                abi: FooArtifact.abi,
                bytecode: FooArtifact.bytecode,
                args: [],
                account: signer2,
                gasPrice: (0, viem_1.parseEther)("500", "gwei"),
                nonce: 2,
            });
            // On the second run, we should detect the user interference
            // and error
            yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition), "IGN403: You have sent transactions from 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc and they interfere with Hardhat Ignition. Please wait until they get 5 confirmations before running Hardhat Ignition again.");
        });
    });
});
