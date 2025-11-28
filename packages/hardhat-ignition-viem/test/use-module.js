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
const use_ignition_project_1 = require("./test-helpers/use-ignition-project");
describe("viem results should work across useModule boundaries", () => {
    (0, use_ignition_project_1.useIgnitionProject)("minimal");
    it("should only return properties for the properties of the module results", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const submoduleDefinition = (0, ignition_core_1.buildModule)("Submodule", (m) => {
                const foo = m.contract("Foo");
                return { foo };
            });
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const { foo } = m.useModule(submoduleDefinition);
                return { foo };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield result.foo.read.x(), 1n);
            yield result.foo.write.inc();
            yield result.foo.write.inc();
            chai_1.assert.equal(yield result.foo.read.x(), 3n);
        });
    });
});
