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
const libraries_1 = require("../../src/internal/execution/libraries");
const helpers_1 = require("../helpers");
const execution_result_fixtures_1 = require("../helpers/execution-result-fixtures");
const mockAddress = "0x1122334455667788990011223344556677889900";
const mockAddress2 = "0x0011223344556677889900112233445566778899";
describe("Libraries handling", () => {
    describe("validateLibraryNames", () => {
        it("Should not throw if all libraries are provided, no name is ambiguos, repreated or not recognized", () => {
            chai_1.assert.doesNotThrow(() => {
                (0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, ["Lib"]);
            });
        });
        it("Should throw if a library name is not recognized", () => __awaiter(void 0, void 0, void 0, function* () {
            (0, helpers_1.assertValidationError)((0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, [
                "NotALibrary",
            ]).map((e) => e.message), "Invalid library NotALibrary for contract WithLibrary: this library is not needed by this contract.");
        }));
        it("Should throw if a library name is ambiguous", () => {
            const [error] = (0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithAmbiguousLibraryName, ["Lib"]).map((e) => e.message);
            (0, chai_1.assert)(error !== undefined);
            chai_1.assert.include(error, `The name "Lib" is ambiguous`);
            chai_1.assert.include(error, `contracts/C.sol:Lib`);
            chai_1.assert.include(error, `contracts/Libs.sol:Lib`);
        });
        it("Should throw if a library is missing", () => {
            const [error] = (0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, []).map((e) => e.message);
            (0, chai_1.assert)(error !== undefined);
            chai_1.assert.include(error, `The following libraries are missing:`);
            chai_1.assert.include(error, `contracts/C.sol:Lib`);
        });
        it("Should throw if a name is used twice, as FQN and bare name", () => {
            (0, helpers_1.assertValidationError)((0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, [
                "Lib",
                "contracts/C.sol:Lib",
            ]).map((e) => e.message), `Invalid libraries for contract WithLibrary: The names 'contracts/C.sol:Lib' and 'Lib' clash with each other, please use qualified names for both.`);
        });
        it("Should accept bare names if non-ambiguous", () => {
            chai_1.assert.doesNotThrow(() => {
                (0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, ["Lib"]);
            });
        });
        it("Should accept fully qualified names", () => {
            chai_1.assert.doesNotThrow(() => {
                (0, libraries_1.validateLibraryNames)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, [
                    "contracts/C.sol:Lib",
                ]);
            });
        });
    });
    describe("linkLibraries", () => {
        it("Should validate that the librearies addressses are valid", () => {
            chai_1.assert.throws(() => {
                (0, libraries_1.linkLibraries)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, {
                    Lib: "asd",
                });
            }, `Invalid address asd for library Lib of contract WithLibrary`);
        });
        it("Should link ambigous libraries correctly", () => {
            const linkedBytecode = (0, libraries_1.linkLibraries)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithAmbiguousLibraryName, {
                ["contracts/Libs.sol:Lib"]: mockAddress,
                ["contracts/C.sol:Lib"]: mockAddress2,
            });
            // We don't really validate if they were linked correctly here
            chai_1.assert.include(linkedBytecode, mockAddress.slice(2));
            chai_1.assert.include(linkedBytecode, mockAddress2.slice(2));
        });
        it("Should link by bare name", () => {
            const linkedBytecode = (0, libraries_1.linkLibraries)(execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary, {
                Lib: mockAddress,
            });
            chai_1.assert.include(linkedBytecode, mockAddress.slice(2));
            const firstRef = execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary.linkReferences["contracts/C.sol"].Lib[0];
            chai_1.assert.equal(linkedBytecode.slice(firstRef.start * 2 + 2, firstRef.start * 2 + 2 + firstRef.length * 2), mockAddress.slice(2));
        });
    });
});
