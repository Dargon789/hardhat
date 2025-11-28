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
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("deploy converts ignition named contractAt to viem instance", () => {
    (0, use_ignition_project_1.useIgnitionProject)("minimal");
    let result;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                const contractAtFoo = m.contractAt("Foo", foo, { id: "ContractAtFoo" });
                return { contractAtFoo };
            });
            result = yield this.hre.ignition.deploy(moduleDefinition);
        });
    });
    it("should provide the address", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(result.contractAtFoo.address, "0x5FbDB2315678afecb367f032d93F642f64180aa3");
        });
    });
    it("should provide the abi", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.isDefined(result.contractAtFoo.abi);
        });
    });
    it("should allow reading the contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(yield result.contractAtFoo.read.x(), 1n);
        });
    });
    it("should allow writing to the contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(yield result.contractAtFoo.read.x(), 1n);
            yield result.contractAtFoo.write.inc();
            yield result.contractAtFoo.write.inc();
            chai_1.assert.equal(yield result.contractAtFoo.read.x(), 3n);
        });
    });
    it("should support simulating write function calls", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const { result: addedNumberResult } = yield result.contractAtFoo.simulate.incByPositiveNumber([2n]);
            chai_1.assert.equal(addedNumberResult, 3n);
        });
    });
    it("should support gas estimation of write function calls", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const estimation = yield result.contractAtFoo.estimateGas.inc();
            chai_1.assert.isDefined(estimation);
            (0, chai_1.assert)(typeof estimation === "bigint");
        });
    });
    it("should support events", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield result.contractAtFoo.write.inc();
            const logs = yield result.contractAtFoo.getEvents.IncEvent();
            chai_1.assert.equal(logs.length, 1);
            chai_1.assert.equal(logs[0].args.sender, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
        });
    });
    it("should enforce the type is constrained to the contracts functions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.contractAtFoo.write.nonexistantWrite(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.contractAtFoo.read.nonexistantRead(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.contractAtFoo.estimateGas.nonexistantEstimate(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.contractAtFoo.simulate.nonexistantEstimate(), /Make sure you are using the correct ABI and that the function exists on it./);
        });
    });
});
