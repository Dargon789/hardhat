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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
const externally_loaded_contract_1 = require("./test-helpers/externally-loaded-contract");
const fixtureProjectName = "minimal";
describe("deploy with ethers result", () => {
    beforeEach("Load environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.join(__dirname, "./fixture-projects", fixtureProjectName));
            const hre = require("hardhat");
            yield hre.network.provider.send("evm_setAutomine", [true]);
            yield hre.run("compile", { quiet: true });
            this.hre = hre;
        });
    });
    afterEach("reset hardhat context", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
    it("should get return ethers result from deploy", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                const fooAt = m.contractAt("Foo", foo, { id: "FooAt" });
                return { foo, fooAt };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.foo.x(), 1n);
            chai_1.assert.equal(yield result.fooAt.x(), 1n);
        });
    });
    it("should get return a deployed contract as an ethers contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.foo.x(), 1n);
        });
    });
    it("should get return a contractAt as an ethers contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                const contractAtFoo = m.contractAt("Foo", foo, { id: "ContractAtFoo" });
                return { contractAtFoo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.contractAtFoo.x(), 1n);
        });
    });
    it("should return a contract loaded from an arbitrary artifact as an ethers instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const externallyLoadedContract = m.contract("ExternallyLoadedContract", externally_loaded_contract_1.externallyLoadedContractArtifact, [], { id: "ExternallyLoadedContract" });
                return { externallyLoadedContract };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isTrue(yield result.externallyLoadedContract.isExternallyLoaded());
        });
    });
    it("should differentiate between different contracts in the type system", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                const bar = m.contract("Bar");
                return { foo, bar };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isTrue(yield result.foo.isFoo());
            chai_1.assert.isTrue(yield result.bar.isBar());
            // A function on the abi will not be defined on the ethers contract,
            // but more importantly this should how up as a type error.
            // TODO: add @ts-expect-error when we have typescript support
            chai_1.assert.isUndefined(result.foo.isBar);
            chai_1.assert.isUndefined(result.bar.isFoo);
        });
    });
});
