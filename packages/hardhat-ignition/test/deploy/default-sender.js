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
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("default sender", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should throw if default sender is not in configured accounts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isRejected(this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "ignition/modules/OwnModule.js",
                defaultSender: "0x1234567890abcdef1234567890abcdef12345678",
            }), /IGN700: Default sender 0x1234567890abcdef1234567890abcdef12345678 is not part of the configured accounts./);
        });
    });
    it("should allow setting default sender via cli", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const secondAccountAddress = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
            yield this.hre.run({ scope: "ignition", task: "deploy" }, {
                modulePath: "ignition/modules/OwnModule.js",
                defaultSender: secondAccountAddress,
            });
            const existingModule = (0, ignition_core_1.buildModule)("ExistingModule", (m) => {
                const bar = m.contractAt("Ownable", "0x8464135c8F25Da09e49BC8782676a84730C318bC");
                return { bar };
            });
            const result = yield this.hre.ignition.deploy(existingModule);
            chai_1.assert.equal(yield result.bar.read.owner(), secondAccountAddress);
        });
    });
});
