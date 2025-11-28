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
const src_1 = require("../src");
const build_module_1 = require("../src/build-module");
const validate_1 = require("../src/internal/validation/validate");
const helpers_1 = require("./helpers");
describe("useModule", () => {
    it("should be able to use a submodule", () => {
        const submodule = (0, build_module_1.buildModule)("Submodule1", (m) => {
            const contract1 = m.contract("Contract1");
            return { contract1 };
        });
        const moduleWithSubmodule = (0, build_module_1.buildModule)("Module1", (m) => {
            const { contract1 } = m.useModule(submodule);
            return { contract1 };
        });
        // the submodule is linked
        chai_1.assert.equal(moduleWithSubmodule.submodules.size, 1);
        (0, chai_1.assert)(moduleWithSubmodule.submodules.has(submodule));
    });
    it("returns the same result set (object equal) for each usage", () => {
        const submodule = (0, build_module_1.buildModule)("Submodule1", (m) => {
            const contract1 = m.contract("Contract1");
            return { contract1 };
        });
        const moduleWithSubmodule = (0, build_module_1.buildModule)("Module1", (m) => {
            const { contract1: first } = m.useModule(submodule);
            const { contract1: second } = m.useModule(submodule);
            return { first, second };
        });
        chai_1.assert.equal(moduleWithSubmodule.results.first, moduleWithSubmodule.results.second);
        chai_1.assert.equal(moduleWithSubmodule.submodules.size, 1);
        (0, chai_1.assert)(moduleWithSubmodule.submodules.has(submodule));
    });
    it("supports dependending on returned results", () => {
        const submodule = (0, build_module_1.buildModule)("Submodule1", (m) => {
            const contract1 = m.contract("Contract1");
            return { contract1 };
        });
        const moduleWithSubmodule = (0, build_module_1.buildModule)("Module1", (m) => {
            const { contract1 } = m.useModule(submodule);
            const contract2 = m.contract("Contract2", [contract1]);
            return { contract2 };
        });
        (0, chai_1.assert)(moduleWithSubmodule.results.contract2.dependencies.has(submodule.results.contract1));
    });
    describe("validation", () => {
        it("should validate nested module parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "uint256",
                                name: "p",
                                type: "uint256",
                            },
                        ],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const submodule = (0, build_module_1.buildModule)("Submodule1", (m) => {
                const param1 = m.getParameter("param1");
                const contract1 = m.contract("Contract1", [param1]);
                return { contract1 };
            });
            const submodule2 = (0, build_module_1.buildModule)("Submodule2", (m) => {
                const { contract1 } = m.useModule(submodule);
                const param2 = m.getParameter("param2");
                const contract2 = m.contract("Contract2", [param2]);
                return { contract1, contract2 };
            });
            const moduleWithSubmodule = (0, build_module_1.buildModule)("Module1", (m) => {
                const { contract1, contract2 } = m.useModule(submodule2);
                const param3 = m.getParameter("param3");
                const contract3 = m.contract("Contract3", [param3]);
                return { contract1, contract2, contract3 };
            });
            const moduleParams = {
                Submodule1: {
                    param1: 42,
                },
                Submodule2: {
                    param2: 123,
                },
                Module1: {
                    param3: 40,
                },
            };
            yield chai_1.assert.isFulfilled((0, validate_1.validate)(moduleWithSubmodule, (0, helpers_1.setupMockArtifactResolver)({
                Contract1: fakerArtifact,
                Contract2: fakerArtifact,
                Contract3: fakerArtifact,
            }), moduleParams, []));
        }));
        it("should not validate missing module parameters is deeply nested submodules", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "uint256",
                                name: "p",
                                type: "uint256",
                            },
                        ],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const submodule = (0, build_module_1.buildModule)("Submodule1", (m) => {
                const param1 = m.getParameter("param1");
                const contract1 = m.contract("Contract1", [param1]);
                return { contract1 };
            });
            const submodule2 = (0, build_module_1.buildModule)("Submodule2", (m) => {
                const { contract1 } = m.useModule(submodule);
                const param2 = m.getParameter("param2");
                const contract2 = m.contract("Contract2", [param2]);
                return { contract1, contract2 };
            });
            const moduleWithSubmodule = (0, build_module_1.buildModule)("Module1", (m) => {
                const { contract1, contract2 } = m.useModule(submodule2);
                const param3 = m.getParameter("param3");
                const contract3 = m.contract("Contract3", [param3]);
                return { contract1, contract2, contract3 };
            });
            const moduleParams = {
                Submodule2: {
                    param2: 123,
                },
                Module1: {
                    param3: 40,
                },
            };
            const result = yield (0, validate_1.validate)(moduleWithSubmodule, (0, helpers_1.setupMockArtifactResolver)({
                Contract1: fakerArtifact,
                Contract2: fakerArtifact,
                Contract3: fakerArtifact,
            }), moduleParams, []);
            chai_1.assert.deepStrictEqual(result, {
                type: src_1.DeploymentResultType.VALIDATION_ERROR,
                errors: {
                    "Submodule1#Contract1": [
                        "IGN725: Module parameter 'param1' requires a value but was given none",
                    ],
                },
            });
        }));
    });
});
