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
const module_1 = require("../src/internal/module");
const get_futures_from_module_1 = require("../src/internal/utils/get-futures-from-module");
const validateArtifactContractAt_1 = require("../src/internal/validation/futures/validateArtifactContractAt");
const helpers_1 = require("./helpers");
describe("contractAtFromArtifact", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    it("should be able to setup a contract at a given address", () => {
        const moduleWithContractFromArtifact = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract1 = m.contractAt("Contract1", helpers_1.fakeArtifact, exampleAddress);
            return { contract1 };
        });
        chai_1.assert.isDefined(moduleWithContractFromArtifact);
        // Sets ids based on module id and contract name
        chai_1.assert.equal(moduleWithContractFromArtifact.id, "Module1");
        chai_1.assert.equal(moduleWithContractFromArtifact.results.contract1.id, "Module1#Contract1");
        // Stores the address
        chai_1.assert.deepStrictEqual(moduleWithContractFromArtifact.results.contract1.address, exampleAddress);
        // 1 contract future
        chai_1.assert.equal(moduleWithContractFromArtifact.futures.size, 1);
        // No submodules
        chai_1.assert.equal(moduleWithContractFromArtifact.submodules.size, 0);
    });
    it("should be able to pass an after dependency", () => {
        const otherModule = (0, build_module_1.buildModule)("Module2", (m) => {
            const example = m.contract("Example");
            return { example };
        });
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const another = m.contractAt("Another", helpers_1.fakeArtifact, exampleAddress, {
                after: [example, otherModule],
            });
            return { example, another };
        });
        chai_1.assert.equal(moduleWithDependentContracts.futures.size, 2);
        const exampleFuture = moduleWithDependentContracts.results.example;
        const anotherFuture = moduleWithDependentContracts.results.another;
        chai_1.assert.equal(anotherFuture.dependencies.size, 2);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(anotherFuture.dependencies.has(otherModule));
    });
    it("should be able to pass a static call future as the address", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const call = m.staticCall(example, "getAddress");
            const another = m.contractAt("Another", helpers_1.fakeArtifact, call);
            return { example, another };
        });
        chai_1.assert.equal(moduleWithDependentContracts.futures.size, 3);
        const anotherFuture = moduleWithDependentContracts.results.another;
        const callFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example.getAddress");
        chai_1.assert.equal(anotherFuture.dependencies.size, 1);
        (0, chai_1.assert)(anotherFuture.dependencies.has(callFuture));
    });
    it("Should be able to pass a module param as address", () => {
        const module = (0, build_module_1.buildModule)("Module", (m) => {
            const paramWithDefault = m.getParameter("addressWithDefault", "0x000000");
            const paramWithoutDefault = m.getParameter("addressWithoutDefault");
            const withDefault = m.contractAt("C", helpers_1.fakeArtifact, paramWithDefault);
            const withoutDefault = m.contractAt("C2", helpers_1.fakeArtifact, paramWithoutDefault);
            return { withDefault, withoutDefault };
        });
        (0, helpers_1.assertInstanceOf)(module.results.withDefault.address, module_1.ModuleParameterRuntimeValueImplementation);
        chai_1.assert.equal(module.results.withDefault.address.name, "addressWithDefault");
        chai_1.assert.equal(module.results.withDefault.address.defaultValue, "0x000000");
        (0, helpers_1.assertInstanceOf)(module.results.withoutDefault.address, module_1.ModuleParameterRuntimeValueImplementation);
        chai_1.assert.equal(module.results.withoutDefault.address.name, "addressWithoutDefault");
        chai_1.assert.equal(module.results.withoutDefault.address.defaultValue, undefined);
    });
    describe("passing id", () => {
        it("should be able to deploy the same contract twice by passing an id", () => {
            const moduleWithSameContractTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contractAt("SameContract", helpers_1.fakeArtifact, exampleAddress, { id: "first" });
                const sameContract2 = m.contractAt("SameContract", helpers_1.fakeArtifact, differentAddress, {
                    id: "second",
                });
                return { sameContract1, sameContract2 };
            });
            chai_1.assert.equal(moduleWithSameContractTwice.id, "Module1");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract1.id, "Module1#first");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract2.id, "Module1#second");
        });
        it("should throw if the same contract is deployed twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contractAt("SameContract", helpers_1.fakeArtifact, exampleAddress);
                const sameContract2 = m.contractAt("SameContract", helpers_1.fakeArtifact, "0x123");
                return { sameContract1, sameContract2 };
            }), `The autogenerated future id ("Module1#SameContract") is already used. Please provide a unique id, as shown below:

m.contractAt(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a contract tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contractAt("SameContract", helpers_1.fakeArtifact, exampleAddress, {
                    id: "same",
                });
                const sameContract2 = m.contractAt("SameContract", helpers_1.fakeArtifact, "0x123", {
                    id: "same",
                });
                return { sameContract1, sameContract2 };
            }), 'The future id "same" is already used, please provide a different one.');
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate an invalid address", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contractAt("Another", helpers_1.fakeArtifact, 42);
                    return { another };
                }), /Invalid parameter "address" provided to contractAt "Another" in module "Module1"/);
            });
        });
        it("should not validate a missing module parameter", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                const another = m.contractAt("Another", helpers_1.fakeArtifact, p);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.CONTRACT_AT);
            (0, helpers_1.assertValidationError)(yield (0, validateArtifactContractAt_1.validateArtifactContractAt)(future, (0, helpers_1.setupMockArtifactResolver)({
                Another: helpers_1.fakeArtifact,
            }), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should validate a missing module parameter if a default parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", "0x1234");
                const another = m.contractAt("Another", helpers_1.fakeArtifact, p);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.CONTRACT_AT);
            const result = yield (0, validateArtifactContractAt_1.validateArtifactContractAt)(future, (0, helpers_1.setupMockArtifactResolver)({
                Another: helpers_1.fakeArtifact,
            }), {}, []);
            chai_1.assert.deepStrictEqual(result, []);
        }));
        it("should validate a missing module parameter if a global parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                const another = m.contractAt("Another", helpers_1.fakeArtifact, p);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.CONTRACT_AT);
            const result = yield (0, validateArtifactContractAt_1.validateArtifactContractAt)(future, (0, helpers_1.setupMockArtifactResolver)({
                Another: helpers_1.fakeArtifact,
            }), {
                $global: {
                    p: "0x1234",
                },
            }, []);
            chai_1.assert.deepStrictEqual(result, []);
        }));
        it("should not validate a module parameter of the wrong type", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", 123);
                const another = m.contractAt("Another", helpers_1.fakeArtifact, p);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.CONTRACT_AT);
            (0, helpers_1.assertValidationError)(yield (0, validateArtifactContractAt_1.validateArtifactContractAt)(future, (0, helpers_1.setupMockArtifactResolver)({
                Another: helpers_1.fakeArtifact,
            }), {}, []), "Module parameter 'p' must be of type 'string' but is 'number'");
        }));
    });
});
