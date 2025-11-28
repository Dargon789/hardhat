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
describe("contract deploys", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to deploy a contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const foo = m.contract("Foo");
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
        });
    });
    it("should be able to deploy a contract with arguments", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("GreeterModule", (m) => {
                const greeter = m.contract("Greeter", ["Hello World"]);
                return { greeter };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const greeting = yield result.greeter.read.getGreeting();
            chai_1.assert.equal(greeting, "Hello World");
        });
    });
    it("should be able to deploy contracts with dependencies", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("DependentModule", (m) => {
                const bar = m.contract("Bar");
                const usesContract = m.contract("UsesContract", [bar]);
                return { bar, usesContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.bar);
            chai_1.assert.isDefined(result.usesContract);
            const usedAddress = (yield result.usesContract.read.contractAddress());
            chai_1.assert.equal(usedAddress.toLowerCase(), result.bar.address.toLowerCase());
        });
    });
    it("should be able to deploy contracts without dependencies", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithoutDepModule", (m) => {
                const foo = m.contract("Foo");
                const bar = m.contract("Bar");
                return { foo, bar };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const x = yield result.foo.read.x();
            const isBar = yield result.bar.read.isBar();
            chai_1.assert.equal(x, 1n);
            chai_1.assert.equal(isBar, true);
        });
    });
    it("should be able to use an artifact to deploy a contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
            const artifact = yield this.hre.artifacts.readArtifact("Greeter");
            const moduleDefinition = (0, ignition_core_1.buildModule)("ArtifactModule", (m) => {
                const greeter = m.contract("Greeter", artifact, ["Hello World"]);
                return { greeter };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const greeting = yield result.greeter.read.getGreeting();
            chai_1.assert.equal(greeting, "Hello World");
        });
    });
    describe("with endowment", () => {
        it("should be able to deploy a contract with an endowment", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("EndowmentModule", (m) => {
                    const passingValue = m.contract("PassingValue", [], {
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
        it("should be able to deploy a contract with an endowment via a parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const submoduleDefinition = (0, ignition_core_1.buildModule)("submodule", (m) => {
                    const endowment = m.getParameter("endowment", 2000000000n);
                    const passingValue = m.contract("PassingValue", [], {
                        value: endowment,
                    });
                    return { passingValue };
                });
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const { passingValue } = m.useModule(submoduleDefinition);
                    return { passingValue };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition);
                chai_1.assert.isDefined(result.passingValue);
                const actualInstanceBalance = yield (0, get_balance_for_1.getBalanceFor)(this.hre, result.passingValue.address);
                chai_1.assert.equal(actualInstanceBalance, 2000000000n);
            });
        });
        it("should be able to deploy a contract with an endowment via a static call", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const submoduleDefinition = (0, ignition_core_1.buildModule)("submodule", (m) => {
                    const valueContract = m.contract("StaticCallValue");
                    const valueResult = m.staticCall(valueContract, "getValue");
                    const passingValue = m.contract("PassingValue", [], {
                        value: valueResult,
                    });
                    return { passingValue };
                });
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const { passingValue } = m.useModule(submoduleDefinition);
                    return { passingValue };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition);
                chai_1.assert.isDefined(result.passingValue);
                const actualInstanceBalance = yield (0, get_balance_for_1.getBalanceFor)(this.hre, result.passingValue.address);
                chai_1.assert.equal(actualInstanceBalance.toString(), "42");
            });
        });
        it("should be able to deploy a contract with an endowment via an event argument", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const submoduleDefinition = (0, ignition_core_1.buildModule)("submodule", (m) => {
                    const valueContract = m.contract("EventArgValue");
                    const valueResult = m.readEventArgument(valueContract, "EventValue", "value");
                    const passingValue = m.contract("PassingValue", [], {
                        value: valueResult,
                    });
                    return { passingValue };
                });
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const { passingValue } = m.useModule(submoduleDefinition);
                    return { passingValue };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition);
                chai_1.assert.isDefined(result.passingValue);
                const actualInstanceBalance = yield (0, get_balance_for_1.getBalanceFor)(this.hre, result.passingValue.address);
                chai_1.assert.equal(actualInstanceBalance.toString(), "42");
            });
        });
    });
});
