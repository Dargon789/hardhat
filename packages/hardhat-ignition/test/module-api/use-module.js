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
describe("useModule", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    describe("returning futures from module usage", () => {
        it("using useModule", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const thirdPartyModule = (0, ignition_core_1.buildModule)("ThirdPartySubmodule", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                const userModule = (0, ignition_core_1.buildModule)("UserModule", (m) => {
                    const { foo } = m.useModule(thirdPartyModule);
                    m.call(foo, "inc");
                    return { foo };
                });
                const result = yield this.hre.ignition.deploy(userModule);
                chai_1.assert.equal(yield result.foo.read.x(), 2n);
            });
        });
    });
    describe("modules depending on other modules contracts", () => {
        it("should execute all in a module before any that depends on a contract within the module", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const firstSecondAndThirdModule = (0, ignition_core_1.buildModule)("SecondAndThirdCallModule", (m) => {
                    const trace = m.contract("Trace", ["first"]);
                    const secondCall = m.call(trace, "addEntry", ["second"]);
                    m.call(trace, "addEntry", ["third"], {
                        id: "third_add_entry",
                        after: [secondCall],
                    });
                    return { trace };
                });
                const fourthCallModule = (0, ignition_core_1.buildModule)("FourthCallModule", (m) => {
                    const { trace } = m.useModule(firstSecondAndThirdModule);
                    m.call(trace, "addEntry", ["fourth"]);
                    return { trace };
                });
                const userModule = (0, ignition_core_1.buildModule)("UserModule", (m) => {
                    const { trace } = m.useModule(fourthCallModule);
                    return { trace };
                });
                const result = yield this.hre.ignition.deploy(userModule);
                const entry1 = yield result.trace.read.entries([0n]);
                const entry2 = yield result.trace.read.entries([1n]);
                const entry3 = yield result.trace.read.entries([2n]);
                const entry4 = yield result.trace.read.entries([3n]);
                chai_1.assert.deepStrictEqual([entry1, entry2, entry3, entry4], ["first", "second", "third", "fourth"]);
            });
        });
    });
});
