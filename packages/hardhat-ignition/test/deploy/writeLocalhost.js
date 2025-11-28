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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
const fixtureProjectName = "minimal";
const deploymentDir = path_1.default.join(path_1.default.resolve(__dirname, `../fixture-projects/${fixtureProjectName}/ignition`), "deployments", "chain-31337");
describe("localhost deployment flag", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)(fixtureProjectName);
    beforeEach("clean filesystem", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // make sure nothing is left over from a previous test
            (0, fs_extra_1.removeSync)(deploymentDir);
        });
    });
    afterEach("clean filesystem", function () {
        // cleanup
        (0, fs_extra_1.removeSync)(deploymentDir);
    });
    it("true should write deployment to disk", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/OwnModule.js",
                writeLocalhostDeployment: true,
            });
            (0, chai_1.assert)(yield (0, fs_extra_1.pathExists)(deploymentDir), "Deployment was not written to disk");
        });
    });
    it("false should not write deployment to disk", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/OwnModule.js",
                writeLocalhostDeployment: false,
            });
            (0, chai_1.assert)(!(yield (0, fs_extra_1.pathExists)(deploymentDir)), "Deployment was not written to disk");
        });
    });
});
