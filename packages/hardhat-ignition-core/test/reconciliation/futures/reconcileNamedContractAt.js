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
describe("Reconciliation - named contract at", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const exampleContractAtState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.CONTRACT_AT_EXECUTION_STATE,
        futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        contractName: "Contract1",
        contractAddress: exampleAddress,
        artifactId: "./artifact.json",
    };
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
    it("should reconcile unchanged when using an address string", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            const contract1 = m.contractAt("Contract1", exampleAddress);
            return { contract1 };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { contract1 } = m.useModule(submoduleDefinition);
            return { contract1 };
        });
        const deploymentState = (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleContractAtState), { id: `Submodule#Contract1`, futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress }));
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, deploymentState);
    }));
    it("should reconcile unchanged when using an static call", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const example = m.contract("Example");
            const call = m.staticCall(example, "getAddress");
            const another = m.contractAt("Another", call);
            return { another };
        });
        const previousExecutionState = (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Example", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleStaticCallState), { id: "Module#Example.getAddress", futureType: module_1.FutureType.STATIC_CALL, status: execution_state_1.ExecutionStatus.SUCCESS, functionName: "getAddress", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                value: differentAddress,
            } }), Object.assign(Object.assign({}, exampleContractAtState), { id: "Module#Another", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: differentAddress, contractName: "Another" }));
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, previousExecutionState);
    }));
    it("should find changes to contract name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contractAt("ContractChanged", exampleAddress, {
                id: "Factory",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleContractAtState), { id: "Module#Factory", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "ContractUnchanged", contractAddress: exampleAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Factory",
                failure: "Contract name has been changed from ContractUnchanged to ContractChanged",
            },
        ]);
    }));
    it("should find changes to contract address as a literal unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contractAt("Contract1", exampleAddress, {
                id: "Factory",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleContractAtState), { id: "Module#Factory", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: differentAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Factory",
                failure: "Address has been changed from 0xBA12222222228d8Ba445958a75a0704d566BF2C8 to 0x1F98431c8aD98523631AE4a59f267346ea31F984",
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contractAt("Contract1", exampleAddress, {
                id: "Factory",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleContractAtState), { id: "Module#Factory", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Factory",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contractAt("Contract1", exampleAddress, {
                id: "Factory",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleContractAtState), { id: "Module#Factory", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT, status: execution_state_1.ExecutionStatus.STARTED, contractAddress: exampleAddress, strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Factory",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
