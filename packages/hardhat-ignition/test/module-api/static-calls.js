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
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("static calls", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to use the output of a static call in a contract at", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const newAddress = m.staticCall(fooFactory, "deployed", [], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", newAddress);
                return { fooFactory, foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.fooFactory.read.isDeployed(), true);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
    it("should be able to use the output of a static call in an artifact contract at", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const artifact = yield this.hre.artifacts.readArtifact("Foo");
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const newAddress = m.staticCall(fooFactory, "deployed", [], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", artifact, newAddress);
                return { fooFactory, foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.fooFactory.read.isDeployed(), true);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
    it("should be able to use the output of a static call function in a contract at (with arg)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const newAddress = m.staticCall(fooFactory, "allDeployed", [0], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", newAddress);
                return { fooFactory, foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.fooFactory.read.isDeployed(), true);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
    it("should be able to use the output of a static call function in a contract at (with function signature)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const newAddress = m.staticCall(fooFactory, "getDeployed(uint256)", [0], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", newAddress);
                return { fooFactory, foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.fooFactory.read.isDeployed(), true);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
    it("should be able to use the output of a static call with an indexed tuple result", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const tupleContract = m.contract("TupleReturn");
                const arg1 = m.staticCall(tupleContract, "getTuple", [], "arg1", {
                    id: "arg1",
                });
                const arg2 = m.staticCall(tupleContract, "getTuple", [], "arg2", {
                    id: "arg2",
                });
                m.call(tupleContract, "verifyArg1", [arg1], { id: "call1" });
                m.call(tupleContract, "verifyArg2", [arg2], { id: "call2" });
                return { tupleContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.tupleContract.read.arg1Captured(), true);
            chai_1.assert.equal(yield result.tupleContract.read.arg2Captured(), true);
        });
    });
    it("should not be able to use the output of a non-address static call in a contract at", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const nonAddress = m.staticCall(fooFactory, "nonAddressResult", [], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", nonAddress);
                return { fooFactory, foo };
            });
            yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition), /Future 'FooModule#FooFactory.nonAddressResult' must be a valid address/);
        });
    });
    it("should not be able to use the output of a non-address static call in an artifact contract at", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const artifact = yield this.hre.artifacts.readArtifact("Foo");
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const account1 = m.getAccount(1);
                const fooFactory = m.contract("FooFactory", [], { from: account1 });
                const createCall = m.call(fooFactory, "create", []);
                const nonAddress = m.staticCall(fooFactory, "nonAddressResult", [], 0, {
                    after: [createCall],
                });
                const foo = m.contractAt("Foo", artifact, nonAddress);
                return { fooFactory, foo };
            });
            yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition), /Future 'FooModule#FooFactory.nonAddressResult' must be a valid address/);
        });
    });
});
