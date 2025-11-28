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
const chai_1 = require("chai");
const ephemeral_deployment_loader_1 = require("../src/internal/deployment-loader/ephemeral-deployment-loader");
const deployment_state_helpers_1 = require("../src/internal/execution/deployment-state-helpers");
const messages_1 = require("../src/internal/execution/types/messages");
const wiper_1 = require("../src/internal/wiper");
const module_1 = require("../src/types/module");
describe("wipe", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const mockArtifactResolver = {
        getBuildInfo(_) {
            throw new Error("Mock not implemented");
        },
        loadArtifact(_) {
            throw new Error("Mock not implemented");
        },
    };
    const contract1Id = "Module1:Contract1";
    const contract1InitMessage = {
        type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
        futureId: contract1Id,
        futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
        artifactId: contract1Id,
        constructorArgs: [],
        contractName: "Contract1",
        dependencies: [],
        from: exampleAddress,
        libraries: {},
        strategy: "basic",
        strategyConfig: {},
        value: 0n,
    };
    const contract2Id = "Module1:Contract1";
    const contract2InitMessage = {
        type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
        futureId: contract1Id,
        futureType: module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
        artifactId: contract2Id,
        constructorArgs: [],
        contractName: "Contract1",
        dependencies: [contract1Id],
        from: exampleAddress,
        libraries: {},
        strategy: "basic",
        strategyConfig: {},
        value: 0n,
    };
    it("should allow wiping of future", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentLoader = new ephemeral_deployment_loader_1.EphemeralDeploymentLoader(mockArtifactResolver);
        let deploymentState = yield (0, deployment_state_helpers_1.initializeDeploymentState)(123, deploymentLoader);
        deploymentState = yield (0, deployment_state_helpers_1.applyNewMessage)(contract1InitMessage, deploymentState, deploymentLoader);
        chai_1.assert.isDefined(deploymentState.executionStates[contract1Id]);
        const wiper = new wiper_1.Wiper(deploymentLoader);
        deploymentState = yield wiper.wipe(contract1Id);
        chai_1.assert.isUndefined(deploymentState.executionStates[contract1Id]);
    }));
    it("should error if the deployment hasn't been initialized", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentLoader = new ephemeral_deployment_loader_1.EphemeralDeploymentLoader(mockArtifactResolver);
        const wiper = new wiper_1.Wiper(deploymentLoader);
        yield chai_1.assert.isRejected(wiper.wipe("whatever"), "hasn't been intialialized yet");
    }));
    it("should error if the future id doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentLoader = new ephemeral_deployment_loader_1.EphemeralDeploymentLoader(mockArtifactResolver);
        yield (0, deployment_state_helpers_1.initializeDeploymentState)(123, deploymentLoader);
        const wiper = new wiper_1.Wiper(deploymentLoader);
        yield chai_1.assert.isRejected(wiper.wipe("Module1:Nonexistant"), "IGN601: Cannot wipe Module1:Nonexistant as it has no previous execution recorded");
    }));
    it("should error if other futures are depenent on the future being wiped", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentLoader = new ephemeral_deployment_loader_1.EphemeralDeploymentLoader(mockArtifactResolver);
        let deploymentState = yield (0, deployment_state_helpers_1.initializeDeploymentState)(123, deploymentLoader);
        deploymentState = yield (0, deployment_state_helpers_1.applyNewMessage)(contract1InitMessage, deploymentState, deploymentLoader);
        deploymentState = yield (0, deployment_state_helpers_1.applyNewMessage)(contract2InitMessage, deploymentState, deploymentLoader);
        chai_1.assert.isDefined(deploymentState.executionStates[contract1Id]);
        chai_1.assert.isDefined(deploymentState.executionStates[contract2Id]);
        const wiper = new wiper_1.Wiper(deploymentLoader);
        yield chai_1.assert.isRejected(wiper.wipe(contract1Id), `IGN602: Cannot wipe ${contract1Id} as there are dependent futures that have previous executions recorded. Consider wiping these first: ${contract2Id}`);
    }));
});
