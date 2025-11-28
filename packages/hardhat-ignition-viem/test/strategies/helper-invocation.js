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
describe("strategies - invocation via helper", () => {
    const example32ByteSalt = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    describe("no Hardhat config setup", () => {
        (0, use_ignition_project_1.useIgnitionProject)("minimal");
        let result;
        it("should execute create2 when passed config programmatically via helper", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                result = yield this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: example32ByteSalt,
                    },
                });
                chai_1.assert.equal(result.foo.address, "0x9318a275A28F46CA742f84402226E27463cA8050");
            });
        });
        it("should error on create2 when passed bad config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: undefined,
                    },
                }), /IGN1102: Missing required strategy configuration parameter 'salt' for the strategy 'create2'/);
            });
        });
    });
    describe("Hardhat config setup with create2 config", () => {
        (0, use_ignition_project_1.useIgnitionProject)("create2");
        let result;
        it("should execute create2 with the helper loading the Hardhat config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const baz = m.contract("Baz");
                    return { baz };
                });
                result = yield this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                });
                chai_1.assert.equal(result.baz.address, "0x8EFE40FAEF47066689Cb06b561F5EC63F9DeA616");
            });
        });
    });
});
