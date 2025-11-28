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
 * Run an initial deploy, that starts but does not finish several on-chain
 * transactions via Ignition. Perform another run picking the deployment
 * up where the first run left off and without any other user transactions.
 */
describe("execution - rerun with pending ignition transactions", () => {
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-with-pending-ignition-transactions");
    it("should complete the run on the second attempt", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account2 = m.getAccount(2);
                // batch 1
                const foo1 = m.contract("Foo", [], { id: "Foo1", from: account2 });
                const foo2 = m.contract("Foo", [], { id: "Foo2", from: account2 });
                // batch 2
                const foo3 = m.contract("Foo", [], {
                    id: "Foo3",
                    from: account2,
                    after: [foo1],
                });
                const foo4 = m.contract("Foo", [], {
                    id: "Foo4",
                    from: account2,
                    after: [foo2],
                });
                // batch 3
                const foo5 = m.contract("Foo", [], {
                    id: "Foo5",
                    from: account2,
                    after: [foo3],
                });
                const foo6 = m.contract("Foo", [], {
                    id: "Foo6",
                    from: account2,
                    after: [foo4],
                });
                return {
                    foo1,
                    foo2,
                    foo3,
                    foo4,
                    foo5,
                    foo6,
                };
            });
            yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // Process the first block, include foo1 and foo2
                yield c.mineBlock(2);
                // Kill the deployment, with foo3 and foo4 submitted to mempool
                yield c.waitForPendingTxs(2);
                c.exitDeploy();
            }));
            // NOTE: no blocks mined between previous run and this run
            // there should two deploy contract transactions for foo3 and foo4
            // in the mempool
            const result = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block should confirm foo3 and foo4
                yield c.mineBlock(2);
                // this block shound include foo5 and foo6
                yield c.mineBlock(2);
            }));
            chai_1.assert.isDefined(result);
            const x1 = yield result.foo1.read.x();
            const x2 = yield result.foo2.read.x();
            const x3 = yield result.foo3.read.x();
            const x4 = yield result.foo4.read.x();
            const x5 = yield result.foo5.read.x();
            const x6 = yield result.foo6.read.x();
            chai_1.assert.equal(x1, 1n);
            chai_1.assert.equal(x2, 1n);
            chai_1.assert.equal(x3, 1n);
            chai_1.assert.equal(x4, 1n);
            chai_1.assert.equal(x5, 1n);
            chai_1.assert.equal(x6, 1n);
        });
    });
});
