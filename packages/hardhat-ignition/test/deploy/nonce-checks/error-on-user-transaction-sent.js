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
 * On running a deploy, if a transaction is pending and the user
 * sends a new transaction outside Ignition on the same account
 * we should error and halt immediately
 */
describe("execution - error on user transaction sent", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "error-on-user-transaction-sent");
    it("should error on the drop being detected", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                // batch 1
                const foo1 = m.contract("Foo", [], { id: "Foo1", from: account2 });
                // batch 2
                const foo2 = m.contract("Foo", [], {
                    id: "Foo2",
                    from: account2,
                    after: [foo1],
                });
                return {
                    foo1,
                    foo2,
                };
            });
            // The deploy should exception when the additional user interfering
            // transaction is detected
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // wait for foo1 to be submitted
                yield c.waitForPendingTxs(1);
                const FooArtifact = this.hre.artifacts.readArtifactSync("Foo");
                // Submit user interference transaction to mempool (note a fresh
                // nonce is used, so no replacement)
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
                    gasPrice: 500000000000n,
                });
                // Process block 1 with foo1
                yield c.mineBlock(1);
                const fooAddress = yield deployPromise;
                chai_1.assert.equal(fooAddress, "0x9154ff20c97a7ebf9d2ebbb3f8b7e24bf99caee050a24c50f1162492c0b6af79");
            })), "IGN405: The next nonce for 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc should be 1, but is 2. Please make sure not to send transactions from 0x3c44cdddb6a900fa2b585dd299e03d12fa4293bc while running this deployment and try again.");
        });
    });
});
