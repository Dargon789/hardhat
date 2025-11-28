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
const externally_loaded_contract_1 = require("../test-helpers/externally-loaded-contract");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("deploy converts ignition artifact contract to viem instance", () => {
    (0, use_ignition_project_1.useIgnitionProject)("minimal");
    let result;
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const externallyLoadedContract = m.contract("ExternallyLoadedContract", externally_loaded_contract_1.externallyLoadedContractArtifact, [], { id: "ExternallyLoadedContract" });
                return { externallyLoadedContract };
            });
            result = yield this.hre.ignition.deploy(moduleDefinition);
        });
    });
    it("should provide the address", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(result.externallyLoadedContract.address, "0x5FbDB2315678afecb367f032d93F642f64180aa3");
        });
    });
    it("should provide the abi", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(result.externallyLoadedContract.abi, externally_loaded_contract_1.externallyLoadedContractArtifact.abi);
        });
    });
    it("should allow reading the contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(yield result.externallyLoadedContract.read.buildMessage(["Hello World"]), "A message: Hello World");
        });
    });
    it("should allow writing to the contract instance", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield result.externallyLoadedContract.write.inc();
            yield result.externallyLoadedContract.write.inc();
            yield result.externallyLoadedContract.write.inc();
            chai_1.assert.equal(yield result.externallyLoadedContract.read.x(), 4n);
        });
    });
    it("should support simulating write function calls", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const { result: simulationResult } = yield result.externallyLoadedContract.simulate.inc();
            chai_1.assert.equal(simulationResult, 2n);
        });
    });
    it("should support gas estimation of write function calls", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const estimation = yield result.externallyLoadedContract.estimateGas.inc();
            chai_1.assert.isDefined(estimation);
            (0, chai_1.assert)(typeof estimation === "bigint");
        });
    });
    it("should enforce the type is constrained to the contracts functions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.externallyLoadedContract.write.nonexistantWrite(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.externallyLoadedContract.read.nonexistantRead(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.externallyLoadedContract.estimateGas.nonexistantEstimate(), /Make sure you are using the correct ABI and that the function exists on it./);
            yield chai_1.assert.isRejected(
            // @ts-expect-error
            result.externallyLoadedContract.simulate.nonexistantEstimate(), /Make sure you are using the correct ABI and that the function exists on it./);
        });
    });
});
