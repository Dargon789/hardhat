"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const build_module_1 = require("../src/build-module");
const module_1 = require("../src/internal/module");
const helpers_1 = require("./helpers");
describe("getParameter", () => {
    describe("Without default value", function () {
        it("should return the correct RuntimeValue", () => {
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const p = m.getParameter("p");
                const contract = m.contract("Contract", [p]);
                return { contract };
            });
            const param = mod.results.contract.constructorArgs[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.equal(param.defaultValue, undefined);
        });
    });
    describe("With default value", function () {
        it("should accept base values as default", () => {
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const s = m.getParameter("string", "default");
                const n = m.getParameter("number", 1);
                const bi = m.getParameter("bigint", 1n);
                const b = m.getParameter("boolean", true);
                const contract = m.contract("Contract", [s, n, bi, b]);
                return { contract };
            });
            const isS = mod.results.contract.constructorArgs[0];
            const isN = mod.results.contract.constructorArgs[1];
            const isBi = mod.results.contract.constructorArgs[2];
            const isB = mod.results.contract.constructorArgs[3];
            (0, helpers_1.assertInstanceOf)(isS, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(isS.name, "string");
            chai_1.assert.equal(isS.defaultValue, "default");
            (0, helpers_1.assertInstanceOf)(isN, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(isN.name, "number");
            chai_1.assert.equal(isN.defaultValue, 1);
            (0, helpers_1.assertInstanceOf)(isBi, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(isBi.name, "bigint");
            chai_1.assert.equal(isBi.defaultValue, 1n);
            (0, helpers_1.assertInstanceOf)(isB, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(isB.name, "boolean");
            chai_1.assert.equal(isB.defaultValue, true);
        });
        it("Should accept arrays as deafult", () => {
            const defaultValue = [1, "dos", 3n, false];
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const p = m.getParameter("p", defaultValue);
                const contract = m.contract("Contract", [p]);
                return { contract };
            });
            const param = mod.results.contract.constructorArgs[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.deepEqual(param.defaultValue, defaultValue);
        });
        it("Should accept objects as deafult", () => {
            const defaultValue = { a: 1, b: "dos", c: 3n };
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const p = m.getParameter("p", defaultValue);
                const contract = m.contract("Contract", [p]);
                return { contract };
            });
            const param = mod.results.contract.constructorArgs[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.deepEqual(param.defaultValue, defaultValue);
        });
        it("Should accept complex combinations as default", () => {
            const defaultValue = {
                arr: [123, { a: [{ o: true }] }],
            };
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const p = m.getParameter("p", defaultValue);
                const contract = m.contract("Contract", [p]);
                return { contract };
            });
            const param = mod.results.contract.constructorArgs[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.deepEqual(param.defaultValue, defaultValue);
        });
        it("should accept account runtime values as default", () => {
            const mod = (0, build_module_1.buildModule)("MyModule", (m) => {
                const p = m.getParameter("p", m.getAccount(1));
                const contract = m.contract("Contract", [p]);
                return { contract };
            });
            const param = mod.results.contract.constructorArgs[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.deepEqual(param.defaultValue, {
                accountIndex: 1,
                type: "ACCOUNT",
            });
        });
    });
});
