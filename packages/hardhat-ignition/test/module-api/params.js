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
describe("module parameters", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to retrieve a default number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultModule", (m) => {
                const myNumber = m.getParameter("MyNumber", 42);
                const foo = m.contract("Foo");
                m.call(foo, "incByPositiveNumber", [myNumber]);
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const v = yield result.foo.read.x();
            chai_1.assert.equal(v, 43n);
        });
    });
    it("should be able to override a default number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultModule", (m) => {
                const myNumber = m.getParameter("MyNumber", 10);
                const foo = m.contract("Foo");
                m.call(foo, "incByPositiveNumber", [myNumber]);
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition, {
                parameters: {
                    WithDefaultModule: {
                        MyNumber: 20,
                    },
                },
            });
            chai_1.assert.equal(yield result.foo.read.x(), 21n);
        });
    });
    it("should be able to retrieve a default string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultStringModule", (m) => {
                const myString = m.getParameter("MyString", "Example");
                const greeter = m.contract("Greeter", [myString]);
                return { greeter };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const v = yield result.greeter.read.getGreeting();
            chai_1.assert.equal(v, "Example");
        });
    });
    it("should be able to override a default string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultStringModule", (m) => {
                const myString = m.getParameter("MyString", "Example");
                const greeter = m.contract("Greeter", [myString]);
                return { greeter };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition, {
                parameters: {
                    WithDefaultStringModule: {
                        MyString: "NotExample",
                    },
                },
            });
            chai_1.assert.equal(yield result.greeter.read.getGreeting(), "NotExample");
        });
    });
    it("should be able to retrieve a default AccountRuntimeValue", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultAccountModule", (m) => {
                const newOwner = m.getParameter("newOwner", m.getAccount(1));
                const ownerContract = m.contract("Owner", [], { from: m.getAccount(0) });
                m.call(ownerContract, "setOwner", [newOwner]);
                return { ownerContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            const v = (yield result.ownerContract.read.owner());
            const accounts = yield this.hre.network.provider.send("eth_accounts");
            chai_1.assert.equal(v.toLowerCase(), accounts[1]);
        });
    });
    it("should be able to override a default AccountRuntimeValue", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithDefaultAccountModule", (m) => {
                const newOwner = m.getParameter("newOwner", m.getAccount(1));
                const ownerContract = m.contract("Owner", [], { from: m.getAccount(0) });
                m.call(ownerContract, "setOwner", [newOwner]);
                return { ownerContract };
            });
            const accounts = yield this.hre.network.provider.send("eth_accounts");
            const result = yield this.hre.ignition.deploy(moduleDefinition, {
                parameters: {
                    WithDefaultAccountModule: {
                        newOwner: accounts[2],
                    },
                },
            });
            const v = (yield result.ownerContract.read.owner());
            chai_1.assert.equal(v.toLowerCase(), accounts[2]);
        });
    });
});
describe("params validation", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should throw if no parameters object provided", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
            const userModule = (0, ignition_core_1.buildModule)("UserModule", (m) => {
                const myNumber = m.getParameter("MyNumber");
                const foo = m.contract("Foo");
                m.call(foo, "incByPositiveNumber", [myNumber]);
                return { foo };
            });
            const deployPromise = this.hre.ignition.deploy(userModule);
            yield chai_1.assert.isRejected(deployPromise, "Module parameter 'MyNumber' requires a value but was given none");
        });
    });
    it("should throw if parameter missing from parameters", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
            const userModule = (0, ignition_core_1.buildModule)("UserModule", (m) => {
                const myNumber = m.getParameter("MyNumber");
                const foo = m.contract("Foo");
                m.call(foo, "incByPositiveNumber", [myNumber]);
                return { foo };
            });
            const deployPromise = this.hre.ignition.deploy(userModule, {
                parameters: {
                    UserModule: {
                        NotMyNumber: 11,
                    },
                },
            });
            yield chai_1.assert.isRejected(deployPromise, "Module parameter 'MyNumber' requires a value but was given none");
        });
    });
});
