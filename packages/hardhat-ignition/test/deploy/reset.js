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
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const hardhat_artifact_resolver_1 = require("../../src/hardhat-artifact-resolver");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("reset flag", function () {
    (0, use_ignition_project_1.useFileIgnitionProject)("reset-flag", "custom-reset-id");
    it("should reset a deployment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.hre.network.name = "something-else";
            yield this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/FirstPass.js",
                deploymentId: "custom-reset-id",
                reset: true,
            });
            yield this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/SecondPass.js",
                deploymentId: "custom-reset-id",
                reset: true,
            });
            const artifactResolver = new hardhat_artifact_resolver_1.HardhatArtifactResolver(this.hre);
            const result = yield (0, ignition_core_1.status)(this.deploymentDir, artifactResolver);
            // ResetModule#B will only be in the success list if the second
            // run ran without any reconciliation errors - so the retry
            // cleared the first pass
            (0, chai_1.assert)(result.successful.includes("ResetModule#B"), "Retry did not clear first pass, so second pass failed");
        });
    });
});
