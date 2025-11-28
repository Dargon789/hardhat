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
const deployment_state_reducer_1 = require("../../../src/internal/execution/reducers/deployment-state-reducer");
const module_1 = require("../../../src/internal/module");
const utils_1 = require("./utils");
const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
describe("future processor", () => {
    const initialDeploymentState = (0, deployment_state_reducer_1.deploymentStateReducer)(undefined);
    describe("deploying a named contractAt", () => {
        it("should record the address of a contractAt future", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const fakeModule = {};
            const deploymentFuture = new module_1.NamedContractAtFutureImplementation("MyModule:TestContract", fakeModule, "TestContract", exampleAddress);
            const { processor, storedDeployedAddresses } = yield (0, utils_1.setupFutureProcessor)((() => { }), {});
            // Act
            yield processor.processFuture(deploymentFuture, initialDeploymentState);
            // Assert
            chai_1.assert.equal(storedDeployedAddresses["MyModule:TestContract"], exampleAddress);
        }));
    });
});
