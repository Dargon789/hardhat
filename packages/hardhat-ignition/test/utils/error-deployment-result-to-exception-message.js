"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const error_deployment_result_to_exception_message_1 = require("../../src/utils/error-deployment-result-to-exception-message");
describe("display error deployment result", () => {
    describe("validation", () => {
        it("should display a validation error", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.VALIDATION_ERROR,
                errors: {
                    "MyModule:MyContract": [
                        "The number of params does not match the constructor",
                        "The name of the contract is invalid",
                    ],
                    "MyModule:AnotherContract": ["No library provided"],
                },
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't run because of the following validation errors:

  * MyModule:MyContract: The number of params does not match the constructor
  * MyModule:MyContract: The name of the contract is invalid
  * MyModule:AnotherContract: No library provided`);
        });
    });
    describe("reconciliation", () => {
        it("should display a reconciliation error", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.RECONCILIATION_ERROR,
                errors: {
                    "MyModule:MyContract": [
                        "The params don't match",
                        "The value doesn't match",
                    ],
                    "MyModule:AnotherContract": ["The future is timed out"],
                },
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't run because of the following reconciliation errors:

  * MyModule:MyContract: The params don\'t match
  * MyModule:MyContract: The value doesn\'t match
  * MyModule:AnotherContract: The future is timed out`);
        });
    });
    describe("previous run", () => {
        it("should display a previous run error", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.PREVIOUS_RUN_ERROR,
                errors: {
                    "MyModule:MyContract": ["The previous run failed"],
                    "MyModule:AnotherContract": ["The previous run timed out"],
                },
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't run because of the following errors in a previous run:

  * MyModule:MyContract: The previous run failed
  * MyModule:AnotherContract: The previous run timed out`);
        });
    });
    describe("execution", () => {
        it("should display an execution error with timeouts", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.EXECUTION_ERROR,
                started: [],
                timedOut: [
                    { futureId: "MyModule:MyContract", networkInteractionId: 1 },
                    { futureId: "MyModule:AnotherContract", networkInteractionId: 3 },
                ],
                held: [],
                failed: [],
                successful: [],
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't successful, there were timeouts:

Timed out:

  * MyModule:MyContract/1
  * MyModule:AnotherContract/3`);
        });
        it("should display an execution error with holds", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.EXECUTION_ERROR,
                started: [],
                timedOut: [],
                held: [
                    {
                        futureId: "MyModule:MyContract",
                        heldId: 1,
                        reason: "Vote is not complete",
                    },
                    {
                        futureId: "MyModule:AnotherContract",
                        heldId: 3,
                        reason: "Server timed out",
                    },
                ],
                failed: [],
                successful: [],
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't successful, there were holds:

Held:

  * MyModule:MyContract/1: Vote is not complete
  * MyModule:AnotherContract/3: Server timed out`);
        });
        it("should display an execution error with execution failures", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.EXECUTION_ERROR,
                started: [],
                timedOut: [],
                held: [],
                failed: [
                    {
                        futureId: "MyModule:MyContract",
                        networkInteractionId: 1,
                        error: "Reverted with reason x",
                    },
                    {
                        futureId: "MyModule:AnotherContract",
                        networkInteractionId: 3,
                        error: "Reverted with reason y",
                    },
                ],
                successful: [],
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't successful, there were failures:

Failures:

  * MyModule:MyContract/1: Reverted with reason x
  * MyModule:AnotherContract/3: Reverted with reason y`);
        });
        it("should display an execution error with both timeouts and execution failures", () => {
            const result = {
                type: ignition_core_1.DeploymentResultType.EXECUTION_ERROR,
                started: [],
                timedOut: [
                    { futureId: "MyModule:FirstContract", networkInteractionId: 1 },
                    { futureId: "MyModule:SecondContract", networkInteractionId: 3 },
                ],
                held: [],
                failed: [
                    {
                        futureId: "MyModule:ThirdContract",
                        networkInteractionId: 1,
                        error: "Reverted with reason x",
                    },
                    {
                        futureId: "MyModule:FourthContract",
                        networkInteractionId: 3,
                        error: "Reverted with reason y",
                    },
                ],
                successful: [],
            };
            chai_1.assert.equal((0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result), `The deployment wasn't successful, there were timeouts and failures:

Timed out:

  * MyModule:FirstContract/1
  * MyModule:SecondContract/3

Failures:

  * MyModule:ThirdContract/1: Reverted with reason x
  * MyModule:FourthContract/3: Reverted with reason y`);
        });
    });
});
