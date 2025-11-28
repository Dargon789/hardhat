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
const hardhat_projects_1 = require("../../helpers/hardhat-projects");
// This test exists to ensure Ignition succeeds in a CI environment.
// This is a test that the UI, runs even in constrained terminal environments.
// It should always pass locally.
describe("Running deployment in CI environment", function () {
    this.timeout(60000);
    (0, hardhat_projects_1.useHardhatProject)("ci-success");
    it("should succeed with UI in a CI environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isFulfilled(this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/LockModule.js",
            }));
        });
    });
});
