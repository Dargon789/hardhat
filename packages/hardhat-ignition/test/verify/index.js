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
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("verify", function () {
    describe("when there is no etherscan API key configured", function () {
        (0, use_ignition_project_1.useEphemeralIgnitionProject)("verify-no-api-key");
        it("should throw in the verify task", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({ scope: "ignition", task: "verify" }, {
                    deploymentId: "test",
                }), /No etherscan API key configured/);
            });
        });
        it("should throw in the deploy task", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({ scope: "ignition", task: "deploy" }, {
                    modulePath: "any",
                    verify: true,
                }), /No etherscan API key configured/);
            });
        });
    });
});
