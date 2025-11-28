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
describe("existing contract", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to use an existing contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
            const barArtifact = yield this.hre.artifacts.readArtifact("Bar");
            const usesContractArtifact = yield this.hre.artifacts.readArtifact("UsesContract");
            const firstModuleDefinition = (0, ignition_core_1.buildModule)("FirstModule", (m) => {
                const bar = m.contract("Bar");
                const usesContract = m.contract("UsesContract", [
                    "0x0000000000000000000000000000000000000000",
                ]);
                return { bar, usesContract };
            });
            const firstResult = yield this.hre.ignition.deploy(firstModuleDefinition);
            const barAddress = firstResult.bar.address;
            const usesContractAddress = firstResult.usesContract.address;
            const secondModuleDefinition = (0, ignition_core_1.buildModule)("SecondModule", (m) => {
                const bar = m.contractAt("Bar", barArtifact, barAddress);
                const usesContract = m.contractAt("UsesContract", usesContractArtifact, usesContractAddress);
                m.call(usesContract, "setAddress", [bar]);
                return { bar, usesContract };
            });
            const result = yield this.hre.ignition.deploy(secondModuleDefinition);
            chai_1.assert.isDefined(result.bar);
            chai_1.assert.isDefined(result.usesContract);
            const usedAddress = (yield result.usesContract.read.contractAddress());
            chai_1.assert.equal(usedAddress.toLowerCase(), result.bar.address.toLowerCase());
        });
    });
});
