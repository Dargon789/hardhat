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
const build_module_1 = require("../src/build-module");
const module_1 = require("../src/internal/module");
const get_futures_from_module_1 = require("../src/internal/utils/get-futures-from-module");
const validateNamedLibraryDeployment_1 = require("../src/internal/validation/futures/validateNamedLibraryDeployment");
const module_2 = require("../src/types/module");
const helpers_1 = require("./helpers");
describe("library", () => {
    it("should be able to setup a deploy library call", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            const library1 = m.library("Library1");
            return { library1 };
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        // Sets ids based on module id and library name
        chai_1.assert.equal(moduleWithASingleContract.id, "Module1");
        chai_1.assert.equal(moduleWithASingleContract.results.library1.id, "Module1#Library1");
        // 1 contract future
        chai_1.assert.equal(moduleWithASingleContract.futures.size, 1);
        chai_1.assert.equal([...moduleWithASingleContract.futures][0].type, module_2.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT);
        // No submodules
        chai_1.assert.equal(moduleWithASingleContract.submodules.size, 0);
    });
    it("should be able to pass one library as an after dependency of another", () => {
        const otherModule = (0, build_module_1.buildModule)("Module2", (m) => {
            const example = m.contract("Example");
            return { example };
        });
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.library("Example");
            const another = m.library("Another", { after: [example, otherModule] });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named library deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 2);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(anotherFuture.dependencies.has(otherModule));
    });
    it("should be able to pass a library as a dependency of a library", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.library("Example");
            const another = m.library("Another", {
                libraries: { Example: example },
            });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named library deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 1);
        chai_1.assert.equal(anotherFuture.libraries.Example.id, exampleFuture === null || exampleFuture === void 0 ? void 0 : exampleFuture.id);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
    });
    it("should be able to pass a string as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.library("Another", {
                from: "0x2",
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named library deployment");
        }
        chai_1.assert.equal(anotherFuture.from, "0x2");
    });
    it("Should be able to pass an AccountRuntimeValue as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.library("Another", {
                from: m.getAccount(1),
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named library deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(anotherFuture.from.accountIndex, 1);
    });
    describe("passing id", () => {
        it("should be able to deploy the same library twice by passing an id", () => {
            const moduleWithSameContractTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract", { id: "first" });
                const sameContract2 = m.library("SameContract", {
                    id: "second",
                });
                return { sameContract1, sameContract2 };
            });
            chai_1.assert.equal(moduleWithSameContractTwice.id, "Module1");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract1.id, "Module1#first");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract2.id, "Module1#second");
        });
        it("should throw if the same library is deployed twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract");
                const sameContract2 = m.library("SameContract");
                return { sameContract1, sameContract2 };
            }), `The autogenerated future id ("Module1#SameContract") is already used. Please provide a unique id, as shown below:

m.library(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a library tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract", {
                    id: "same",
                });
                const sameContract2 = m.library("SameContract", {
                    id: "same",
                });
                return { sameContract1, sameContract2 };
            }), 'The future id "same" is already used, please provide a different one.');
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate a non-address from option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", [], { from: 1 });
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid type for option "from": number/);
            });
            it("should not validate a non-contract library", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    const call = m.call(another, "test");
                    const test = m.library("Test", {
                        libraries: { Call: call },
                    });
                    return { another, test };
                }), /IGN702: Module validation failed with reason: The value you provided for the library 'Call' is not a valid Future or it doesn't represent a contract/);
            });
        });
        it("should not validate an invalid artifact", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.library("Another");
                return { another };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedLibraryDeployment_1.validateNamedLibraryDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Artifact for contract 'Another' is invalid");
        }));
        it("should not validate a negative account index", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(-1);
                const test = m.library("Test", { from: account });
                return { test };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedLibraryDeployment_1.validateNamedLibraryDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate an account index greater than the number of available accounts", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(1);
                const test = m.library("Test", { from: account });
                return { test };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedLibraryDeployment_1.validateNamedLibraryDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Requested account index '1' is greater than the total number of available accounts '0'");
        }));
    });
});
