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
const chai_1 = require("chai");
const build_module_1 = require("../../../src/build-module");
const execution_result_1 = require("../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const module_1 = require("../../../src/types/module");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
describe("Reconciliation - named encode function call", () => {
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const exampleDeploymentState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE,
        futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        networkInteractions: [],
        artifactId: "./artifact.json",
        contractName: "Contract1",
        value: BigInt("0"),
        constructorArgs: [],
        libraries: {},
        from: helpers_1.exampleAccounts[0],
    };
    const exampleEncodeFunctionCallState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.ENCODE_FUNCTION_CALL_EXECUTION_STATE,
        futureType: module_1.FutureType.ENCODE_FUNCTION_CALL,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        artifactId: "./artifact.json",
        functionName: "function",
        args: [],
        result: "",
    };
    it("should reconcile unchanged", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "function1", [1, "a", contract1], {});
            return { contract1 };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { contract1 } = m.useModule(submoduleDefinition);
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Submodule#encodeFunctionCall(Submodule#Contract1.function1)", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, functionName: "function1", args: [1, "a", differentAddress] })));
    }));
    it("should find changes to future dependencies unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "function1", [], { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract2", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Module#config", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: "A dependency from Module#config to Module#Contract1 has been added. The former has started executing before the latter started executing, so this change is incompatible.",
            },
        ]);
    }));
    it("should find changes to function name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "functionChanged", [], { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Module#config", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "functionUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: "Function name has been changed from functionUnchanged to functionChanged",
            },
        ]);
    }));
    it("should find changes to function args unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const ticker = m.getParameter("ticker", "CHANGED");
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "function1", [[ticker]], {});
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Module#encodeFunctionCall(Module#Contract1.function1)", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", args: [["UNCHANGED"]] })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#encodeFunctionCall(Module#Contract1.function1)",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "function1", [], { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Module#config", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.encodeFunctionCall(contract1, "function1", [], { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleEncodeFunctionCallState), { id: "Module#config", futureType: module_1.FutureType.ENCODE_FUNCTION_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
