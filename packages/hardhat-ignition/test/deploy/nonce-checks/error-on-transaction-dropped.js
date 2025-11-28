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
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * On running a deploy, if a transaction is dropped from the mempool
 * before it is confirmed, then we halt and display an error.
 */
describe("execution - error on transaction dropped", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "error-on-transaction-dropped");
    it("should error on the drop being detected", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // Setup a module with two contract deploys (foo1 and foo2) over 2 batches
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
            // The deploy should exception once the dropped transaction for foo2
            // is detected
            yield chai_1.assert.isRejected(this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Process block 1 confirming foo1
                yield c.mineBlock(1);
                // Wait for foo2 to be pending, then wipe it from memory pool
                yield c.clearMempool(1);
                // Mine further block allowing foo2 to be checked again
                yield c.mineBlock();
            })), "IGN401: Error while executing FooModule#Foo2: all the transactions of its network interaction 1 were dropped. Please try rerunning Hardhat Ignition.");
        });
    });
});
