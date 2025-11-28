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
const validateArtifactLibraryDeployment_1 = require("../src/internal/validation/futures/validateArtifactLibraryDeployment");
const helpers_1 = require("./helpers");
describe("libraryFromArtifact", () => {
    it("should be able to deploy with a library based on an artifact", () => {
        const moduleWithContractFromArtifact = (0, build_module_1.buildModule)("Module1", (m) => {
            const library1 = m.library("Library1", helpers_1.fakeArtifact);
            return { library1 };
        });
        chai_1.assert.isDefined(moduleWithContractFromArtifact);
        // Sets ids based on module id and contract name
        chai_1.assert.equal(moduleWithContractFromArtifact.id, "Module1");
        chai_1.assert.equal(moduleWithContractFromArtifact.results.library1.id, "Module1#Library1");
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
            const example = m.library("Example");
            const another = m.library("Another", helpers_1.fakeArtifact, {
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
    it("should be able to pass a library as a dependency of a library", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.library("Example");
            const another = m.library("Another", helpers_1.fakeArtifact, {
                libraries: { Example: example },
            });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.ArtifactLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not an artifact library deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 1);
        chai_1.assert.equal(anotherFuture.libraries.Example.id, exampleFuture === null || exampleFuture === void 0 ? void 0 : exampleFuture.id);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
    });
    it("should be able to pass a string as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.library("Another", helpers_1.fakeArtifact, {
                from: "0x2",
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.ArtifactLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not an artifact library deployment");
        }
        chai_1.assert.equal(anotherFuture.from, "0x2");
    });
    it("Should be able to pass an AccountRuntimeValue as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.library("Another", helpers_1.fakeArtifact, {
                from: m.getAccount(1),
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.ArtifactLibraryDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not an artifact library deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(anotherFuture.from.accountIndex, 1);
    });
    describe("passing id", () => {
        it("should use library from artifact twice by passing an id", () => {
            const moduleWithSameContractTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract", helpers_1.fakeArtifact, {
                    id: "first",
                });
                const sameContract2 = m.library("SameContract", helpers_1.fakeArtifact, {
                    id: "second",
                });
                return { sameContract1, sameContract2 };
            });
            // Sets ids based on module id and contract name
            chai_1.assert.equal(moduleWithSameContractTwice.id, "Module1");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract1.id, "Module1#first");
            chai_1.assert.equal(moduleWithSameContractTwice.results.sameContract2.id, "Module1#second");
        });
        it("should throw if the same library is deployed twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract", helpers_1.fakeArtifact);
                const sameContract2 = m.library("SameContract", helpers_1.fakeArtifact);
                return { sameContract1, sameContract2 };
            }), `The autogenerated future id ("Module1#SameContract") is already used. Please provide a unique id, as shown below:

m.library(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a library tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.library("SameContract", helpers_1.fakeArtifact, {
                    id: "same",
                });
                const sameContract2 = m.library("SameContract", helpers_1.fakeArtifact, {
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
                    const another = m.library("Another", helpers_1.fakeArtifact, {
                        from: 1,
                    });
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid type for option "from": number/);
            });
            it("should not validate a non-contract library", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    const call = m.call(another, "test");
                    const test = m.library("Test", helpers_1.fakeArtifact, {
                        libraries: { Call: call },
                    });
                    return { another, test };
                }), /IGN702: Module validation failed with reason: The value you provided for the library 'Call' is not a valid Future or it doesn't represent a contract/);
            });
        });
        it("should not validate a negative account index", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(-1);
                const test = m.library("Test", helpers_1.fakeArtifact, {
                    from: account,
                });
                return { test };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateArtifactLibraryDeployment_1.validateArtifactLibraryDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate an account index greater than the number of available accounts", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(1);
                const test = m.library("Test", helpers_1.fakeArtifact, {
                    from: account,
                });
                return { test };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateArtifactLibraryDeployment_1.validateArtifactLibraryDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Requested account index '1' is greater than the total number of available accounts '0'");
        }));
    });
});
