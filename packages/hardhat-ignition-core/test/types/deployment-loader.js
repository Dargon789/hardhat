"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const ephemeral_deployment_loader_1 = require("../../src/internal/deployment-loader/ephemeral-deployment-loader");
const file_deployment_loader_1 = require("../../src/internal/deployment-loader/file-deployment-loader");
const helpers_1 = require("../helpers");
describe("DeploymentLoaderImpls", function () {
    describe("file-deployment-loader", () => {
        it("Shouldn't have any property apart from the ones defined in the Deployment loader interface", function () {
            const _implementation = new file_deployment_loader_1.FileDeploymentLoader("./example");
            chai_1.assert.isDefined(_implementation);
        });
    });
    describe("ephemeral-deployment-loader", () => {
        it("Shouldn't have any property apart from the ones defined in the Deployment loader interface", function () {
            const _implementation = new ephemeral_deployment_loader_1.EphemeralDeploymentLoader((0, helpers_1.setupMockArtifactResolver)());
            chai_1.assert.isDefined(_implementation);
        });
    });
});
