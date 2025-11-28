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
describe("Reconciliation - read event argument", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const txId = "0x123";
    const exampleReadArgState = {
        id: "Example",
        type: execution_state_1.ExecutionStateType.READ_EVENT_ARGUMENT_EXECUTION_STATE,
        futureType: module_1.FutureType.READ_EVENT_ARGUMENT,
        strategy: "basic",
        strategyConfig: {},
        status: execution_state_1.ExecutionStatus.STARTED,
        dependencies: new Set(),
        artifactId: "./artifact.json",
        eventName: "event1",
        nameOrIndex: "argument1",
        eventIndex: 0,
        emitterAddress: exampleAddress,
        txToReadFrom: txId,
        result: "first",
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
    it("should reconcile unchanged", () => __awaiter(void 0, void 0, void 0, function* () {
        const submoduleDefinition = (0, build_module_1.buildModule)("Submodule", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "EventName1", "arg1");
            return { contract };
        });
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const { contract } = m.useModule(submoduleDefinition);
            return { contract };
        });
        yield (0, helpers_2.assertSuccessReconciliation)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Submodule#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Submodule#Contract.EventName1.arg1.0", status: execution_state_1.ExecutionStatus.STARTED, eventName: "EventName1", nameOrIndex: "arg1" })));
    }));
    it("should find changes to the event unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "EventChanged", "arg1", {
                id: "ReadEvent",
            });
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, eventName: "eventUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: "Event name has been changed from eventUnchanged to EventChanged",
            },
        ]);
    }));
    it("should find changes to the argument unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "event1", "argChanged", {
                id: "ReadEvent",
            });
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            }, contractName: "Contract" }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, nameOrIndex: "argUnchanged" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: "Argument name or index has been changed from argUnchanged to argChanged",
            },
        ]);
    }));
    it("should find changes to the event index unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "event1", "argument1", {
                id: "ReadEvent",
                eventIndex: 3,
            });
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            }, contractName: "Contract" }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, eventIndex: 1 })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: "Event index has been changed from 1 to 3",
            },
        ]);
    }));
    it("should find changes to the emitter unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            const contract2 = m.contract("Contract2");
            m.readEventArgument(contract1, "event1", "argument1", {
                id: "ReadEvent",
                emitter: contract2,
            });
            return { contract1, contract2 };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract1", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract2", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract2", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, emitterAddress: exampleAddress })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: "Emitter has been changed from 0x1F98431c8aD98523631AE4a59f267346ea31F984 to 0xBA12222222228d8Ba445958a75a0704d566BF2C8 (future Module#Contract2)",
            },
        ]);
    }));
    it("should not reconcile the use of an event argument that has changed", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract1 = m.contract("Contract1");
            const readEvent1 = m.readEventArgument(contract1, "event1", "argument1", {
                id: "ReadEvent1",
            });
            const readEvent2 = m.readEventArgument(contract1, "event2", "argument2", {
                id: "ReadEvent2",
            });
            const contract2 = m.contract("Contract2", [readEvent2], {
                after: [readEvent1, readEvent2],
            });
            return { contract1, contract2 };
        });
        // This state is the equivalent to above, but contract2's
        // constructor arg points at the result of the first call
        // rather than the second
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract1", status: execution_state_1.ExecutionStatus.SUCCESS, result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent1", status: execution_state_1.ExecutionStatus.SUCCESS, dependencies: new Set(["Module#Contract1"]), eventName: "event1", nameOrIndex: "argument1", emitterAddress: exampleAddress, result: "first" }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent2", status: execution_state_1.ExecutionStatus.SUCCESS, dependencies: new Set(["Module#Contract1"]), eventName: "event2", nameOrIndex: "argument2", emitterAddress: exampleAddress, result: "second" }), Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract2", status: execution_state_1.ExecutionStatus.STARTED, dependencies: new Set(["Module#ReadEvent1", "Module#ReadEvent2"]), contractName: "Contract2", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            }, constructorArgs: ["first"] })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#Contract2",
                failure: "Argument at index 0 has been changed",
            },
        ]);
    }));
    it("should find changes to strategy name unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "event1", "argument1", {
                id: "ReadEvent",
            });
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, strategy: "create2" })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: 'Strategy changed from "create2" to "basic"',
            },
        ]);
    }));
    it("should find changes to strategy config unreconciliable", () => __awaiter(void 0, void 0, void 0, function* () {
        const moduleDefinition = (0, build_module_1.buildModule)("Module", (m) => {
            const contract = m.contract("Contract");
            m.readEventArgument(contract, "event1", "argument1", {
                id: "ReadEvent",
            });
            return { contract };
        });
        const reconiliationResult = yield (0, helpers_2.reconcile)(moduleDefinition, (0, helpers_2.createDeploymentState)(Object.assign(Object.assign({}, exampleDeploymentState), { id: "Module#Contract", futureType: module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT, status: execution_state_1.ExecutionStatus.SUCCESS, contractName: "Contract", result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            } }), Object.assign(Object.assign({}, exampleReadArgState), { id: "Module#ReadEvent", status: execution_state_1.ExecutionStatus.STARTED, strategyConfig: { salt: "value" } })));
        chai_1.assert.deepStrictEqual(reconiliationResult.reconciliationFailures, [
            {
                futureId: "Module#ReadEvent",
                failure: 'Strategy config changed from {"salt":"value"} to {}',
            },
        ]);
    }));
});
