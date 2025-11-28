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
describe("libraries", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should be able to deploy a contract that depends on a hardhat library", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("WithLibModule", (m) => {
                const rubbishMath = m.library("RubbishMath");
                const dependsOnLib = m.contract("DependsOnLib", [], {
                    libraries: {
                        RubbishMath: rubbishMath,
                    },
                });
                return { rubbishMath, dependsOnLib };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result);
            const contractThatDependsOnLib = result.dependsOnLib;
            const libBasedAddtion = yield contractThatDependsOnLib.read.addThreeNumbers([1, 2, 3]);
            chai_1.assert.equal(libBasedAddtion, 6);
        });
    });
    it("should be able to deploy a contract that depends on an artifact library", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
            const libraryArtifact = yield this.hre.artifacts.readArtifact("RubbishMath");
            const moduleDefinition = (0, ignition_core_1.buildModule)("ArtifactLibraryModule", (m) => {
                const rubbishMath = m.library("RubbishMath", libraryArtifact);
                const dependsOnLib = m.contract("DependsOnLib", [], {
                    libraries: {
                        RubbishMath: rubbishMath,
                    },
                });
                return { rubbishMath, dependsOnLib };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result);
            const contractThatDependsOnLib = result.dependsOnLib;
            const libBasedAddtion = yield contractThatDependsOnLib.read.addThreeNumbers([1, 2, 3]);
            chai_1.assert.equal(libBasedAddtion, 6);
        });
    });
    it("should deploy a contract with an existing library", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const libraryModuleDefinition = (0, ignition_core_1.buildModule)("LibraryModule", (m) => {
                const rubbishMath = m.library("RubbishMath");
                return { rubbishMath };
            });
            const libDeployResult = yield this.hre.ignition.deploy(libraryModuleDefinition);
            const libAddress = libDeployResult.rubbishMath.address;
            const moduleDefinition = (0, ignition_core_1.buildModule)("ConsumingLibModule", (m) => {
                const rubbishMath = m.contractAt("RubbishMath", libAddress);
                const dependsOnLib = m.contract("DependsOnLib", [], {
                    libraries: {
                        RubbishMath: rubbishMath,
                    },
                });
                return { dependsOnLib };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.equal(yield libDeployResult.rubbishMath.read.add([1, 2]), 3);
            chai_1.assert.equal(yield result.dependsOnLib.read.addThreeNumbers([1, 2, 3]), 6);
        });
    });
    it("should be able to deploy a library that depends on a library", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("ArtifactLibraryModule", (m) => {
                const rubbishMath = m.library("RubbishMath");
                const libDependsOnLib = m.library("LibDependsOnLib", {
                    libraries: {
                        RubbishMath: rubbishMath,
                    },
                });
                const dependsOnLibThatDependsOnLib = m.contract("DependsOnLibThatDependsOnLib", [], {
                    libraries: {
                        LibDependsOnLib: libDependsOnLib,
                    },
                });
                return { rubbishMath, libDependsOnLib, dependsOnLibThatDependsOnLib };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition);
            chai_1.assert.isDefined(result);
            const contractThatDependsOnLibOnLib = result.dependsOnLibThatDependsOnLib;
            const libBasedAddtion = yield contractThatDependsOnLibOnLib.read.addThreeNumbers([1, 2, 3]);
            chai_1.assert.equal(libBasedAddtion, 6);
        });
    });
});
