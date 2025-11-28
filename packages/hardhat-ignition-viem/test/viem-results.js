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
const externally_loaded_contract_1 = require("./test-helpers/externally-loaded-contract");
const use_ignition_project_1 = require("./test-helpers/use-ignition-project");
describe("viem results", () => {
    (0, use_ignition_project_1.useIgnitionProject)("minimal");
    it("should only return properties for the properties of the module results", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result.foo);
            // @ts-expect-error - only returned result keys should exist
            chai_1.assert.isUndefined(result.nonexistant);
        });
    });
    it("should differentiate between different contracts in the type system", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const foo = m.contract("Foo");
                const bar = m.contract("Bar");
                const baz = m.contract("Bas", externally_loaded_contract_1.externallyLoadedContractArtifact);
                return { foo, bar, baz };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isTrue(yield result.foo.read.isFoo());
            chai_1.assert.isTrue(yield result.bar.read.isBar());
            chai_1.assert.isTrue(yield result.baz.read.isExternallyLoaded());
            // Calling the wrong method on a viem instance should throw, but more
            // importantly give a type error.
            // foo shouldn't have bar or baz methods
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isBar is not a method on Foo
            result.foo.read.isBar(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isBar is not a method on Foo
            result.foo.read.isExternallyLoaded(), /Make sure you are using the correct ABI and that the function exists on it./);
            // bar shouldn't have foo or baz methods
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isFoo is not a method on Bar
            result.bar.read.isFoo(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isExternallyLoaded is not a method on Bar
            result.bar.read.isExternallyLoaded(), /Make sure you are using the correct ABI and that the function exists on it./);
            // baz shouldn't have foo or bar methods
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isFoo is not a method on the externally loaded contract
            result.baz.read.isFoo(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error - isBar is not a method on the externally loaded contract
            result.baz.read.isBar(), /Make sure you are using the correct ABI and that the function exists on it./);
        });
    });
});
