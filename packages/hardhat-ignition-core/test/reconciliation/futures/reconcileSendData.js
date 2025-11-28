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
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const module_1 = require("../../../src/types/module");
const helpers_1 = require("../../helpers");
const helpers_2 = require("../helpers");
describe("Reconciliation - send data", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const exampleSendState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.SEND_DATA_EXECUTION_STATE,
        futureType: module_1.FutureType.SEND_DATA,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        networkInteractions: [],
        to: exampleAddress,
        data: "example_data",
        value: BigInt("0"),
        from: helpers_1.exampleAccounts[0],
    };
    it("should reconcile unchanged", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            m.send("test_send", exampleAddress, 0n, "example_data");
            return {};
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const {} = m.useModule(submoduleDefinition);
            return {};
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Submodule#test_send", status: execution_state_1.ExecutionStatus.STARTED })));
    }));
    /**
     * This test here is in a first run, the from is undefined and the defaultSender is used.
     * On the second run the from is undefined but a different defaultSender is now in play.
     * We say this should reconcile but the account from the first run should be used, as long
     * as it is in the accounts list.
     */
    it("should reconcile where the future is undefined but the exState's from is in the accounts list", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, "example_data", {
                from: undefined,
            });
            return {};
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED })));
    }));
    it("should reconcile between undefined and 0x for data", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, undefined);
            return {};
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, data: "0x" })));
    }));
    it("should reconcile between `to` and an account value", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const givenAccount = m.getAccount(2);
            m.send("test_send", givenAccount, 0n, "example_data");
            return {};
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, to: helpers_1.exampleAccounts[2], data: "example_data" })));
    }));
    it("should find changes to the to address unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", differentAddress, 0n, "example_data");
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, to: exampleAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: 'Address "to" has been changed from 0x1F98431c8aD98523631AE4a59f267346ea31F984 to 0xBA12222222228d8Ba445958a75a0704d566BF2C8',
            },
        ]);
    }));
    it("should find changes to the to data unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, "changed_data");
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, data: "unchanged_data" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: "Data has been changed from unchanged_data to changed_data",
            },
        ]);
    }));
    it("should find changes to the value unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 3n, "example_data");
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, value: 2n })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: "Value has been changed from 2 to 3",
            },
        ]);
    }));
    it("should find changes to from unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, "example_data", {
                from: differentAddress,
            });
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, from: exampleAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: `From account has been changed from ${exampleAddress} to ${differentAddress}`,
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, "example_data");
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            m.send("test_send", exampleAddress, 0n, "example_data");
            return {};
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleSendState), { id: "Module#test_send", status: execution_state_1.ExecutionStatus.STARTED, strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#test_send",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
