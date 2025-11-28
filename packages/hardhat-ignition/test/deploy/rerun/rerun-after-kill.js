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
 * Run an initial deploy that deploys multiple contracts, one contract per batch.
 * Kill the process on the first transaction being submitted.
 * Restart the deployment and ensure that the deployment is completed with
 * all contracts deployed.
 *
 * This covers a bug in the nonce mangement code: see #576
 */
describe("execution - rerun after kill", function () {
    this.timeout(60000);
    (0, use_ignition_project_1.useFileIgnitionProject)("minimal", "rerun-after-kill");
    it("should pickup deployment and run contracts to completion", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const foo1 = m.contract("Foo", [], { id: "foo1" });
                const foo2 = m.contract("Foo", [], { id: "foo2" });
                const foo3 = m.contract("Foo", [], { id: "foo3" });
                const foo4 = m.contract("Foo", [], { id: "foo4" });
                const foo5 = m.contract("Foo", [], { id: "foo5" });
                return {
                    foo1,
                    foo2,
                    foo3,
                    foo4,
                    foo5,
                };
            });
            // Start the deploy
            yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block shound include deployment of foo1
                yield c.waitForPendingTxs(1);
                c.exitDeploy();
            }));
            // Rerun the deployment
            const result = yield this.runControlledDeploy(moduleDefinition, (c) => __awaiter(this, void 0, void 0, function* () {
                // this block shound include deployment of foo2
                yield c.mineBlock(1);
                yield c.mineBlock(1);
                yield c.mineBlock(1);
                yield c.mineBlock(1);
                yield c.mineBlock(1);
            }));
            chai_1.assert.equal(yield result.foo1.read.x(), 1n);
            chai_1.assert.equal(yield result.foo2.read.x(), 1n);
            chai_1.assert.equal(yield result.foo3.read.x(), 1n);
            chai_1.assert.equal(yield result.foo4.read.x(), 1n);
            chai_1.assert.equal(yield result.foo5.read.x(), 1n);
        });
    });
});
