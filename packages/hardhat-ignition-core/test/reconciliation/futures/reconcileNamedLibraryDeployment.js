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
describe("Reconciliation - named library", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
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
    it("should reconcile unchanged", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            const safeMath = m.library("SafeMath");
            const mainLib = m.library("MainLibrary", {
                libraries: { SafeMath: safeMath },
            });
            return { safeMath, mainLib };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { mainLib } = m.useModule(submoduleDefinition);
            return { mainLib };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#SafeMath", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "SafeMath", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#MainLibrary", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "MainLibrary", libraries: {
                SafeMath: exampleAddress,
            } })));
    }));
    it("should find changes to library name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const library = m.library("LibraryChanged", { id: "Library" });
            return { library };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Library", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "LibraryUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Library",
                failure: "Contract name has been changed from LibraryUnchanged to LibraryChanged",
            },
        ]);
    }));
    it("should find changes to libraries unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const safeMath = m.library("SafeMath");
            const mainLib = m.library("MainLibrary", {
                libraries: { Changed: safeMath },
            });
            return { safeMath, mainLib };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#SafeMath", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "SafeMath", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#MainLibrary", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "MainLibrary", libraries: {
                Unchanged: exampleAddress,
            } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#MainLibrary",
                failure: "Library Unchanged has been removed",
            },
        ]);
    }));
    it("should find changes to from unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const library = m.library("Library", { id: "Library", from: helpers_2.twoAddress });
            return { library };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Library", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "Library", from: helpers_2.oneAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Library",
                failure: `From account has been changed from ${helpers_2.oneAddress} to ${helpers_2.twoAddress}`,
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const library = m.library("Library", { id: "Library" });
            return { library };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Library", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "Library", strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Library",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const library = m.library("Library", { id: "Library" });
            return { library };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Library", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.STARTED, contractName: "Library", strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Library",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
