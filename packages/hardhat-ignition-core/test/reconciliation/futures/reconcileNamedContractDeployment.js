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
describe("Reconciliation - named contract", () => {
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
            const owner = m.getAccount(3);
            const supply = m.getParameter("supply", BigInt(500));
            const ticker = m.getParameter("ticker", "CodeCoin");
            const safeMath = m.library("SafeMath");
            const contract1 = m.contract("Contract1", [owner, { nested: { supply } }, [1, ticker, 3], safeMath], {
                libraries: {
                    SafeMath: safeMath,
                },
            });
            return { contract1 };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { contract1 } = m.useModule(submoduleDefinition);
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#SafeMath", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "SafeMath", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#Contract1", status: execution_state_1.ExecutionStatus.STARTED, constructorArgs: [
                "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
                { nested: { supply: BigInt(500) } },
                [1, "CodeCoin", 3],
                exampleAddress,
            ], libraries: {
                SafeMath: exampleAddress,
            } })));
    }));
    /**
     * This test here is in a first run, the from is undefined and the defaultSender is used.
     * On the second run the from is undefined but a different defaultSender is now in play.
     * We say this should reconcile but the account from the first run should be used, as long
     * as it is in the accounts list
     */
    it("should reconcile where the future is undefined but the exState's from is in the accounts list", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract", [], {
                id: "Example",
                from: undefined,
            });
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "Contract", from: helpers_1.exampleAccounts[3] })));
    }));
    it("should find changes to contract name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("ContractChanged", [], {
                id: "Example",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "ContractUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: "Contract name has been changed from ContractUnchanged to ContractChanged",
            },
        ]);
    }));
    it("should find changes to constructor args unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const owner = m.getAccount(3);
            const supply = m.getParameter("supply", BigInt(500));
            const ticker = m.getParameter("ticker", "CodeCoin");
            const contract1 = m.contract("ContractChanged", [owner, { nested: { supply } }, [1, ticker, 3]], {
                id: "Example",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "ContractUnchanged", constructorArgs: [1, 2, 3] })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: "Contract name has been changed from ContractUnchanged to ContractChanged",
            },
        ]);
    }));
    it("should reconcile an address arg with entirely different casing", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1", [
                "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
            ]);
            return { contract1 };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.STARTED, constructorArgs: ["0x15D34AAF54267DB7D7C367839AAF71A00A2C6A65"] })));
    }));
    it("should fail to reconcile an address arg with partially different casing", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1", [
                "0x15d34aaf54267db7d7c367839aaf71a00a2c6a65",
            ]);
            return { contract1 };
        });
        const reconciliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.STARTED, constructorArgs: ["0x15d34aaf54267db7D7c367839aaf71a00a2c6a65"] })));
        chai_1.assert.deepStrictEqual(reconciliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract1",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should find changes to libraries unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const safeMath = m.library("SafeMath");
            const contract1 = m.contract("Contract1", [], {
                libraries: {
                    SafeMath: safeMath,
                },
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#SafeMath", futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "SafeMath", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.STARTED, libraries: {} })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract1",
                failure: "Library SafeMath has been added",
            },
        ]);
    }));
    it("should find changes to value unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract", [], {
                id: "Example",
                value: BigInt(3),
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "Contract", value: BigInt(2) })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: "Value has been changed from 2 to 3",
            },
        ]);
    }));
    it("should find changes to from unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract", [], {
                id: "Example",
                from: helpers_2.twoAddress,
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "Contract", from: helpers_2.oneAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: `From account has been changed from ${helpers_2.oneAddress} to ${helpers_2.twoAddress}`,
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract", [], {
                id: "Example",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "Contract", strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract", [], {
                id: "Example",
            });
            return { contract1 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Example", status: execution_state_1.ExecutionStatus.STARTED, contractName: "Contract", strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Example",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
