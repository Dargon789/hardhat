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
describe("gas estimation", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should throw with simulation error if sender account has less ETH than gas estimate", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                const foo = m.contract("Fails");
                return { foo };
            });
            yield this.hre.network.provider.send("hardhat_setBalance", [
                "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
                "0x1",
            ]);
            yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition), /Simulating the transaction failed with error: Reverted with reason "Constructor failed"/);
        });
    });
});
