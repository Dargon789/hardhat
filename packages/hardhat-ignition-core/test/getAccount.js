"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const build_module_1 = require("../src/build-module");
const module_1 = require("../src/internal/module");
const helpers_1 = require("./helpers");
describe("getAccount", () => {
    it("should return the correct RuntimeValue", () => {
        const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
            const account2 = m.getAccount(2);
            const contract = m.contract("Contract", [], { from: account2 });
            return { contract };
        });
        (0, helpers_1.assertInstanceOf)(mod.results.contract.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(mod.results.contract.from.accountIndex, 2);
    });
});
