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
const get_balance_for_1 = require("../test-helpers/get-balance-for");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("calls", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to call contracts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("SetAddressModule", (m) => {
                const bar = m.contract("Bar");
                const usesContract = m.contract("UsesContract", [
                    "0x0000000000000000000000000000000000000000",
                ]);
                m.call(usesContract, "setAddress", [bar]);
                return { bar, usesContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.bar);
            chai_1.assert.isDefined(result.usesContract);
            const usedAddress = (yield result.usesContract.read.contractAddress());
            chai_1.assert.equal(usedAddress.toLowerCase(), result.bar.address.toLowerCase());
        });
    });
    it("should be able to call contracts with array args", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("ArrayArgModule", (m) => {
                const captureArraysContract = m.contract("CaptureArraysContract");
                m.call(captureArraysContract, "recordArrays", [
                    [1, 2, 3],
                    ["a", "b", "c"],
                    [true, false, true],
                ]);
                return { captureArraysContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.captureArraysContract);
            const captureSuceeded = yield result.captureArraysContract.read.arraysCaptured();
            (0, chai_1.assert)(captureSuceeded);
        });
    });
    it("should be able to call contracts with arrays nested in objects args", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("ArrayNestedModule", (m) => {
                const captureComplexObjectContract = m.contract("CaptureComplexObjectContract");
                m.call(captureComplexObjectContract, "testComplexObject", [
                    {
                        firstBool: true,
                        secondArray: [1, 2, 3],
                        thirdSubcomplex: { sub: "sub" },
                    },
                ]);
                return { captureComplexObjectContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.captureComplexObjectContract);
            const captureSuceeded = yield result.captureComplexObjectContract.read.complexArgCaptured();
            (0, chai_1.assert)(captureSuceeded);
        });
    });
    it("should be able to make calls in order", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("OrderedModule", (m) => {
                const trace = m.contract("Trace", ["first"]);
                const second = m.call(trace, "addEntry", ["second"], { id: "AddEntry1" });
                m.call(trace, "addEntry", ["third"], {
                    id: "AddEntry2",
                    after: [second],
                });
                return { trace };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.trace);
            const entry1 = yield result.trace.read.entries([0n]);
            const entry2 = yield result.trace.read.entries([1n]);
            const entry3 = yield result.trace.read.entries([2n]);
            chai_1.assert.deepStrictEqual([entry1, entry2, entry3], ["first", "second", "third"]);
        });
    });
    describe("passing value", () => {
        it("should be able to call a contract passing a value", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("PassingValue", (m) => {
                    const passingValue = m.contract("PassingValue");
                    m.call(passingValue, "deposit", [], {
                        value: 1000000000n,
                    });
                    return { passingValue };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition);
                chai_1.assert.isDefined(result.passingValue);
                const actualInstanceBalance = yield (0, get_balance_for_1.getBalanceFor)(this.hre, result.passingValue.address);
                chai_1.assert.equal(actualInstanceBalance, 1000000000n);
            });
        });
        it("should be able to call a contract passing a value via a parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const submoduleDefinition = (0, ignition_core_1.buildModule)("Submodule", (m) => {
                    const depositValue = m.getParameter("depositValue", 1000n);
                    const passingValue = m.contract("PassingValue");
                    m.call(passingValue, "deposit", [], {
                        value: depositValue,
                    });
                    return { passingValue };
                });
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const { passingValue } = m.useModule(submoduleDefinition);
                    return { passingValue };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition, {
                    parameters: {
                        Submodule: {
                            depositValue: 1000000000n,
                        },
                    },
                });
                chai_1.assert.isDefined(result.passingValue);
                const actualInstanceBalance = yield (0, get_balance_for_1.getBalanceFor)(this.hre, result.passingValue.address);
                chai_1.assert.equal(actualInstanceBalance, 1000000000n);
            });
        });
    });
});
