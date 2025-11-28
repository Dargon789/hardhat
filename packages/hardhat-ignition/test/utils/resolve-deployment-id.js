"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const resolve_deployment_id_1 = require("../../src/utils/resolve-deployment-id");
describe("deploy id rules", () => {
    const exampleChainId = 31337;
    it("should use the user provided id if one is provided", () => {
        const deploymentId = (0, resolve_deployment_id_1.resolveDeploymentId)("my-deployment-id", exampleChainId);
        chai_1.assert.equal(deploymentId, "my-deployment-id");
    });
    it("should generate a default id based on the chainId if the user provided no deploymentId", () => {
        const deploymentId = (0, resolve_deployment_id_1.resolveDeploymentId)(undefined, exampleChainId);
        chai_1.assert.equal(deploymentId, "chain-31337");
    });
    it("should throw if the user provided an invalid deploymentId", () => {
        chai_1.assert.throws(() => {
            (0, resolve_deployment_id_1.resolveDeploymentId)("deployment/test", exampleChainId);
        }, /The deployment-id "deployment\/test" contains banned characters, ids can only contain alphanumerics, dashes or underscores/);
    });
});
