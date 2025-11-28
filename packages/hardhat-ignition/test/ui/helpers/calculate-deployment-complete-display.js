"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const chalk_1 = __importDefault(require("chalk"));
const calculate_deployment_complete_display_1 = require("../../../src/ui/helpers/calculate-deployment-complete-display");
const types_1 = require("../../../src/ui/types");
const test_format_1 = require("./test-format");
describe("ui - calculate deployment complete display", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0x0011223344556677889900112233445566778899";
    const exampleMultipleBatches = [
        [
            {
                status: {
                    type: types_1.UiFutureStatusType.SUCCESS,
                    result: "0x0",
                },
                futureId: "MyModule#MyContract1",
            },
        ],
    ];
    const exampleNoBatches = [];
    describe("successful deployment", () => {
        it("should render a sucessful deployment", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] successfully deployed 🚀

        ${chalk_1.default.bold("Deployed Addresses")}

        MyModule#Token - 0x1F98431c8aD98523631AE4a59f267346ea31F984
        MyModule#AnotherToken - 0x0011223344556677889900112233445566778899`);
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result: {
                    type: ignition_core_1.DeploymentResultType.SUCCESSFUL_DEPLOYMENT,
                    contracts: {
                        "MyModule#Token": {
                            id: "MyModule#Token",
                            address: exampleAddress,
                            contractName: "Token",
                        },
                        "MyModule#AnotherToken": {
                            id: "MyModule#AnotherToken",
                            address: differentAddress,
                            contractName: "AnotherToken",
                        },
                    },
                },
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
        it("should render a sucessful deployment with no contracts", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] successfully deployed 🚀

        ${chalk_1.default.bold("Deployed Addresses")}

        ${chalk_1.default.italic("No contracts were deployed")}`);
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result: {
                    type: ignition_core_1.DeploymentResultType.SUCCESSFUL_DEPLOYMENT,
                    contracts: {},
                },
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
        it("should render a resumed deployment with no new deployments", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] Nothing new to deploy based on previous execution stored in test

        ${chalk_1.default.bold("Deployed Addresses")}

        ${chalk_1.default.italic("No contracts were deployed")}`);
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result: {
                    type: ignition_core_1.DeploymentResultType.SUCCESSFUL_DEPLOYMENT,
                    contracts: {},
                },
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: true,
                batches: exampleNoBatches,
                deploymentDir: "test",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
    });
    describe("validation failures", () => {
        it("should render multiple validation errors on multiple futures", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] validation failed ⛔

        The module contains futures that would fail to execute:

        MyModule#MyContract:
         - The number of params does not match the constructor
         - The name of the contract is invalid

        MyModule#AnotherContract:
         - No library provided

        Update the invalid futures and rerun the deployment.`);
            const result = {
                type: ignition_core_1.DeploymentResultType.VALIDATION_ERROR,
                errors: {
                    "MyModule#MyContract": [
                        "The number of params does not match the constructor",
                        "The name of the contract is invalid",
                    ],
                    "MyModule#AnotherContract": ["No library provided"],
                },
            };
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result,
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
    });
    describe("reconciliation errors", () => {
        it("should render a multiple reconciliation errors on multiple futures", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] reconciliation failed ⛔

        The module contains changes to executed futures:

        MyModule#MyContract:
         - The params don't match
         - The value doesn't match

        MyModule#AnotherContract:
         - The artifact bytecode has changed

        Consider modifying your module to remove the inconsistencies with deployed futures.`);
            const result = {
                type: ignition_core_1.DeploymentResultType.RECONCILIATION_ERROR,
                errors: {
                    "MyModule#MyContract": [
                        "The params don't match",
                        "The value doesn't match",
                    ],
                    "MyModule#AnotherContract": ["The artifact bytecode has changed"],
                },
            };
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result,
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
    });
    describe("previous run errors", () => {
        it("should render a multiple previous run errors on multiple futures", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] deployment cancelled ⛔

        These futures failed or timed out on a previous run:
         - MyModule#MyContract
         - MyModule#AnotherContract

        Use the ${chalk_1.default.italic("wipe")} task to reset them.`);
            const result = {
                type: ignition_core_1.DeploymentResultType.PREVIOUS_RUN_ERROR,
                errors: {
                    "MyModule#MyContract": ["The previous run failed"],
                    "MyModule#AnotherContract": ["The previous run timed out"],
                },
            };
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result,
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
    });
    describe("execution errors", () => {
        it("should render an execution failure with multiple of each problem type", () => {
            const expectedText = (0, test_format_1.testFormat)(`
        [ MyModule ] failed ⛔

        Futures timed out with transactions unconfirmed after maximum fee bumps:
         - MyModule#MyContract1
         - MyModule#AnotherContract1

        Futures failed during execution:
         - MyModule#MyContract3: Reverted with reason x
         - MyModule#AnotherContract3: Reverted with reason y

        To learn how to handle these errors: https://hardhat.org/ignition-errors

        Held:
         - MyModule#MyContract2: Vote is not complete
         - MyModule#AnotherContract2: Server timed out`);
            const result = {
                type: ignition_core_1.DeploymentResultType.EXECUTION_ERROR,
                started: [],
                timedOut: [
                    { futureId: "MyModule#MyContract1", networkInteractionId: 1 },
                    { futureId: "MyModule#AnotherContract1", networkInteractionId: 3 },
                ],
                held: [
                    {
                        futureId: "MyModule#MyContract2",
                        heldId: 1,
                        reason: "Vote is not complete",
                    },
                    {
                        futureId: "MyModule#AnotherContract2",
                        heldId: 3,
                        reason: "Server timed out",
                    },
                ],
                failed: [
                    {
                        futureId: "MyModule#MyContract3",
                        networkInteractionId: 1,
                        error: "Reverted with reason x",
                    },
                    {
                        futureId: "MyModule#AnotherContract3",
                        networkInteractionId: 3,
                        error: "Reverted with reason y",
                    },
                ],
                successful: [],
            };
            const event = {
                type: ignition_core_1.ExecutionEventType.DEPLOYMENT_COMPLETE,
                result,
            };
            const actualText = (0, calculate_deployment_complete_display_1.calculateDeploymentCompleteDisplay)(event, {
                moduleName: "MyModule",
                isResumed: false,
                batches: exampleMultipleBatches,
                deploymentDir: "",
            });
            chai_1.assert.equal(actualText, expectedText);
        });
    });
});
