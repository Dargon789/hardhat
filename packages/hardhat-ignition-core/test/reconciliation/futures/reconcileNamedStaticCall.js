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
describe("Reconciliation - named static call", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
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
    const exampleStaticCallState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE,
        futureType: module_1.FutureType.STATIC_CALL,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        networkInteractions: [],
        contractAddress: exampleAddress,
        artifactId: "./artifact.json",
        functionName: "function",
        args: [],
        nameOrIndex: 0,
        from: helpers_1.exampleAccounts[0],
    };
    it("should reconcile unchanged", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [1, "a"]);
            return { contract1 };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { contract1 } = m.useModule(submoduleDefinition);
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Submodule#Contract1.function1", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, contractAddress: exampleAddress, functionName: "function1", args: [1, "a"] })));
    }));
    it("should reconcile when the from is undefined but the exState's from is in the accounts list", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [1, "a"], 0, {
                from: undefined,
            });
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Contract1.function1", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, contractAddress: exampleAddress, functionName: "function1", args: [1, "a"], from: helpers_1.exampleAccounts[4] })));
    }));
    it("should find changes to contract unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [], 0, { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#config", status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", contractAddress: exampleAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: "Contract address has been changed from 0x1F98431c8aD98523631AE4a59f267346ea31F984 to 0xBA12222222228d8Ba445958a75a0704d566BF2C8 (future Module#Contract1)",
            },
        ]);
    }));
    it("should find changes to function name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "functionChanged", [], 0, { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#config", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, functionName: "functionUnchanged" })));
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
            m.staticCall(contract1, "function1", [{ ticker }], 0, {});
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Contract1.function1", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, functionName: "function1", args: [{ ticker: "UNCHANGED" }] })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract1.function1",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should reconcile an address arg with entirely different casing", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [
                "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
            ]);
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Contract1.function1", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", args: ["0x15D34AAF54267DB7D7C367839AAF71A00A2C6A65"] })));
    }));
    it("should fail to reconcile an address arg with partially different casing", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [
                "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
            ]);
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Contract1.function1", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.STARTED, functionName: "function1", args: ["0x15d34aaf54267db7D7c367839aaf71a00a2c6a65"] })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract1.function1",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should find changes to from unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [], 0, {
                id: "config",
                from: helpers_2.twoAddress,
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#config", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, functionName: "function1", from: helpers_2.oneAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: `From account has been changed from ${helpers_2.oneAddress} to ${helpers_2.twoAddress}`,
            },
        ]);
    }));
    it("should find changes to the argument unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.staticCall(contract, "function", [], "argChanged");
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            }, contractName: "Contract" }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Contract.function", status: execution_state_1.ExecutionStatus.STARTED, nameOrIndex: "argUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract.function",
                failure: "Argument name or index has been changed from argUnchanged to argChanged",
            },
        ]);
    }));
    it("should not reconcile the use of the result of a static call that has changed", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            const resultArg1 = m.staticCall(contract1, "function1", ["first"], 0, {
                id: "first_call",
            });
            const resultArg2 = m.staticCall(contract1, "function1", ["second"], 0, {
                id: "second_call",
                after: [resultArg1],
            });
            const contract2 = m.contract("Contract2", [resultArg2], {
                after: [resultArg1, resultArg2],
            });
            return { contract1, contract2 };
        });
        // This state is the equivalent to above, but contract2's
        // constructor arg points at the result of the first call
        // rather than the second
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#first_call", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, dependencies: new Set(["Module#Contract1"]), contractAddress: exampleAddress, functionName: "function1", args: ["first"], result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                value: "first",
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#second_call", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, dependencies: new Set(["Module#Contract1", "Module#first_call"]), contractAddress: exampleAddress, functionName: "function1", args: ["second"], result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                value: "second",
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract2", status: execution_state_1.ExecutionStatus.STARTED, dependencies: new Set(["Module#first_call", "Module#second_call"]), contractName: "Contract2", constructorArgs: ["first"], result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract2",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "function1", [], 0, { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#config", status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, functionName: "function1", strategy: "create2" })));
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
            m.staticCall(contract1, "function1", [], 0, { id: "config" });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#config", status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, functionName: "function1", strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#config",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
