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
const sleep_1 = require("../test-helpers/sleep");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
/**
 * Deploy a multiple contracts over several batches.
 *
 * The intent here is to test batching.
 */
describe("execution - multiple batch contract deploy", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should deploy over multiple batches", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const contract1 = m.contract("Foo", [], { id: "Contract1" });
                const contractA = m.contract("Foo", [], { id: "ContractA" });
                const contract2 = m.contract("Foo", [], {
                    id: "Contract2",
                    after: [contract1],
                });
                const contractB = m.contract("Foo", [], {
                    id: "ContractB",
                    after: [contractA],
                });
                const contract3 = m.contract("Foo", [], {
                    id: "Contract3",
                    after: [contract2],
                });
                const contractC = m.contract("Foo", [], {
                    id: "ContractC",
                    after: [contractB],
                });
                return {
                    contract1,
                    contractA,
                    contract2,
                    contractB,
                    contract3,
                    contractC,
                };
            });
            const deployPromise = this.hre.ignition.deploy(moduleDefinition);
            yield (0, sleep_1.sleep)(300);
            yield this.hre.network.provider.send("evm_mine");
            yield (0, sleep_1.sleep)(300);
            yield this.hre.network.provider.send("evm_mine");
            yield (0, sleep_1.sleep)(300);
            yield this.hre.network.provider.send("evm_mine");
            const result = yield deployPromise;
            const x1 = yield result.contract1.read.x();
            const xA = yield result.contractA.read.x();
            const x2 = yield result.contract2.read.x();
            const xB = yield result.contractB.read.x();
            const x3 = yield result.contract3.read.x();
            const xC = yield result.contractC.read.x();
            chai_1.assert.equal(x1, 1n);
            chai_1.assert.equal(xA, 1n);
            chai_1.assert.equal(x2, 1n);
            chai_1.assert.equal(xB, 1n);
            chai_1.assert.equal(x3, 1n);
            chai_1.assert.equal(xC, 1n);
        });
    });
});
