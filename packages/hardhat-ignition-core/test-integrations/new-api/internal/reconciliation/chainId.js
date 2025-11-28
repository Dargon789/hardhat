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
const hardhat_projects_1 = require("../../../helpers/hardhat-projects");
describe("chainId reconciliation", function () {
    this.timeout(60000);
    (0, hardhat_projects_1.useHardhatProject)("default-with-new-chain-id");
    it("should halt when running a deployment on a different chain", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.hre.network.name = "something-else";
            process.env.HARDHAT_IGNITION_CONFIRM_DEPLOYMENT = "true";
            yield chai_1.assert.isRejected(this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "./ignition/modules/LockModule.js",
            }), /The deployment's chain cannot be changed between runs. The deployment was previously run against the chain 123, but the current network is the chain 1337./);
            delete process.env.HARDHAT_IGNITION_CONFIRM_DEPLOYMENT;
        });
    });
});
