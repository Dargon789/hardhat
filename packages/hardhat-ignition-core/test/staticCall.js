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
const validateNamedStaticCall_1 = require("../src/internal/validation/futures/validateNamedStaticCall");
const module_2 = require("../src/types/module");
const helpers_1 = require("./helpers");
describe("static call", () => {
    it("should be able to setup a static call", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "test");
            return { contract1 };
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        // Sets ids based on module id and contract name
        chai_1.assert.equal(moduleWithASingleContract.id, "Module1");
        chai_1.assert.equal(moduleWithASingleContract.results.contract1.id, "Module1#Contract1");
        // 1 contract future & 1 call future
        chai_1.assert.equal(moduleWithASingleContract.futures.size, 2);
        chai_1.assert.equal([...moduleWithASingleContract.futures][0].type, module_2.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT);
        chai_1.assert.equal([...moduleWithASingleContract.futures][1].type, module_2.FutureType.STATIC_CALL);
        // No submodules
        chai_1.assert.equal(moduleWithASingleContract.submodules.size, 0);
    });
    it("should be able to pass one contract as an arg dependency to a static call", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const another = m.contract("Another");
            m.staticCall(example, "test", [another]);
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const callFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example.test");
        if (!(callFuture instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named contract call future");
        }
        chai_1.assert.equal(callFuture.dependencies.size, 2);
        (0, chai_1.assert)(callFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(callFuture.dependencies.has(anotherFuture));
    });
    it("should be able to pass one contract as an after dependency of a static call", () => {
        const otherModule = (0, build_module_1.buildModule)("Module2", (m) => {
            const example = m.contract("Example");
            return { example };
        });
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const another = m.contract("Another");
            m.staticCall(example, "test", [], 0, { after: [another, otherModule] });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        const callFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example.test");
        if (!(callFuture instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(callFuture.dependencies.size, 3);
        (0, chai_1.assert)(callFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(callFuture.dependencies.has(anotherFuture));
        (0, chai_1.assert)(callFuture.dependencies.has(otherModule));
    });
    it("should be able to pass its result into another call", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract1 = m.contract("Contract1");
            const data = m.staticCall(contract1, "test");
            m.call(contract1, "test2", [data]);
            return { contract1 };
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        const staticCallFuture = [...moduleWithASingleContract.futures].find(({ id }) => id === "Module1#Contract1.test");
        const callFuture = [...moduleWithASingleContract.futures].find(({ id }) => id === "Module1#Contract1.test2");
        if (!(callFuture instanceof module_1.NamedContractCallFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(callFuture.dependencies.size, 2);
        (0, chai_1.assert)(callFuture.dependencies.has(staticCallFuture));
    });
    it("should be able to use a string or number to index its result", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract1 = m.contract("Contract1");
            m.staticCall(contract1, "test", [], "testName");
            m.staticCall(contract1, "test2", [], 2);
            return { contract1 };
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        const staticCallFuture = [...moduleWithASingleContract.futures].find(({ id }) => id === "Module1#Contract1.test");
        const staticCallFuture2 = [...moduleWithASingleContract.futures].find(({ id }) => id === "Module1#Contract1.test2");
        if (!(staticCallFuture instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named static contract deployment");
        }
        if (!(staticCallFuture2 instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named static contract deployment");
        }
        chai_1.assert.equal(staticCallFuture.nameOrIndex, "testName");
        chai_1.assert.equal(staticCallFuture2.nameOrIndex, 2);
    });
    it("should be able to pass a string as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            m.staticCall(example, "test", [], 0, { from: "0x2" });
            return { example };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const callFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example.test");
        if (!(callFuture instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(callFuture.from, "0x2");
    });
    it("Should be able to pass an AccountRuntimeValue as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            m.staticCall(example, "test", [], 0, { from: m.getAccount(1) });
            return { example };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const callFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example.test");
        if (!(callFuture instanceof module_1.NamedStaticCallFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        (0, helpers_1.assertInstanceOf)(callFuture.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(callFuture.from.accountIndex, 1);
    });
    describe("Arguments", () => {
        it("Should support base values as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [1, true, "string", 4n]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            chai_1.assert.deepEqual(future.args, [1, true, "string", 4n]);
        });
        it("Should support arrays as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [[1, 2, 3n]]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            chai_1.assert.deepEqual(future.args, [[1, 2, 3n]]);
        });
        it("Should support objects as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [{ a: 1, b: [1, 2] }]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            chai_1.assert.deepEqual(future.args, [{ a: 1, b: [1, 2] }]);
        });
        it("Should support futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [contract1]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            chai_1.assert.equal(future.args[0], module.results.contract1);
        });
        it("should support nested futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [{ arr: [contract1] }]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            chai_1.assert.equal(future.args[0].arr[0], module.results.contract1);
        });
        it("should support AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [account1]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            (0, helpers_1.assertInstanceOf)(future.args[0], module_1.AccountRuntimeValueImplementation);
            chai_1.assert.equal(future.args[0].accountIndex, 1);
        });
        it("should support nested AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [{ arr: [account1] }]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            const account = future.args[0].arr[0];
            (0, helpers_1.assertInstanceOf)(account, module_1.AccountRuntimeValueImplementation);
            chai_1.assert.equal(account.accountIndex, 1);
        });
        it("should support ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [p]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            (0, helpers_1.assertInstanceOf)(future.args[0], module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(future.args[0].name, "p");
            chai_1.assert.equal(future.args[0].defaultValue, 123);
        });
        it("should support nested ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "foo", [{ arr: [p] }]);
                return { contract1 };
            });
            const future = [...module.futures].find(({ type }) => type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertInstanceOf)(future, module_1.NamedStaticCallFutureImplementation);
            const param = future.args[0].arr[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.equal(param.defaultValue, 123);
        });
    });
    describe("passing id", () => {
        it("should be able to statically call the same function twice by passing an id", () => {
            const moduleWithSameCallTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contract("Example");
                m.staticCall(sameContract1, "test", [], 0, { id: "first" });
                m.staticCall(sameContract1, "test", [], 0, { id: "second" });
                return { sameContract1 };
            });
            chai_1.assert.equal(moduleWithSameCallTwice.id, "Module1");
            const callFuture = [...moduleWithSameCallTwice.futures].find(({ id }) => id === "Module1#first");
            const callFuture2 = [...moduleWithSameCallTwice.futures].find(({ id }) => id === "Module1#second");
            chai_1.assert.isDefined(callFuture);
            chai_1.assert.isDefined(callFuture2);
        });
        it("should throw if the same function is statically called twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contract("SameContract");
                m.staticCall(sameContract1, "test");
                m.staticCall(sameContract1, "test");
                return { sameContract1 };
            }), `The autogenerated future id ("Module1#SameContract.test") is already used. Please provide a unique id, as shown below:

m.staticCall(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a static call tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contract("SameContract");
                m.staticCall(sameContract1, "test", [], 0, { id: "first" });
                m.staticCall(sameContract1, "test", [], 0, { id: "first" });
                return { sameContract1 };
            }), 'The future id "first" is already used, please provide a different one.');
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate a non-address from option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.staticCall(another, "test", [], 0, { from: 1 });
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid type for option "from": number/);
            });
            it("should not validate a nameOrIndex that is not a number or string", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.staticCall(another, "test", [], {});
                    return { another };
                }), /Invalid nameOrIndex given/);
            });
            it("should not validate a non-contract", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    const call = m.call(another, "test");
                    m.staticCall(call, "test");
                    return { another };
                }), /Invalid contract given/);
            });
            it("should not validate a library", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.library("Another");
                    m.staticCall(another, "test");
                    return { another };
                }), /Invalid contract given/);
            });
        });
        it("should not validate a non-existant hardhat contract", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                m.staticCall(another, "test");
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Artifact for contract 'Another' is invalid");
        }));
        it("should not validate a non-existant function", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { contractName: "Another" });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "test");
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function 'test' not found in contract Another");
        }));
        it("should not validate a static call with wrong number of arguments", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "inc", [1, 2]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function inc in contract Another expects 1 arguments but 2 were given");
        }));
        it("should not validate an overloaded call with wrong number of arguments", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                            {
                                internalType: "uint256",
                                name: "n",
                                type: "uint256",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                ], contractName: "Another" });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "inc(bool,uint256)", [1, 2, 3]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function inc(bool,uint256) in contract Another expects 2 arguments but 3 were given");
        }));
        it("should not validate a non-readonly function", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "nonpayable",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "inc", [1]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function inc in contract Another is not 'pure' or 'view' and should not be statically called");
        }));
        it("should not validate a nameOrIndex that is invalid (nonexistent name)", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [],
                        name: "inc",
                        outputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        stateMutability: "pure",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "inc", [], "a");
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function inc of contract Another has no return value named a");
        }));
        it("should not validate a nameOrIndex that is invalid (out of range)", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [],
                        name: "inc",
                        outputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        stateMutability: "pure",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "inc", [], 2);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Function inc of contract Another has only 1 return values, but value 2 was requested");
        }));
        it("should not validate a missing module parameter", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                const p = m.getParameter("p");
                m.staticCall(another, "test", [p]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: helpers_1.fakeArtifact }), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should validate a missing module parameter if a default parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "test",
                        outputs: [
                            {
                                internalType: "bool",
                                name: "result",
                                type: "bool",
                            },
                        ],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                const p = m.getParameter("p", true);
                m.staticCall(another, "test", [p]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            const result = yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: fakerArtifact }), {}, []);
            chai_1.assert.deepEqual(result, []);
        }));
        it("should validate a missing module parameter if a global parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "test",
                        outputs: [
                            {
                                internalType: "bool",
                                name: "result",
                                type: "bool",
                            },
                        ],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                const p = m.getParameter("p");
                m.staticCall(another, "test", [p]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            const result = yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: fakerArtifact }), {
                $global: {
                    p: "0x1234",
                },
            }, []);
            chai_1.assert.deepEqual(result, []);
        }));
        it("should not validate a missing module parameter (deeply nested)", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                const p = m.getParameter("p");
                m.staticCall(another, "test", [
                    [123, { really: { deeply: { nested: [p] } } }],
                ]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: helpers_1.fakeArtifact }), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should validate a missing module parameter if a default parameter is present (deeply nested)", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "test",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                const p = m.getParameter("p", true);
                m.staticCall(another, "test", [
                    [123, { really: { deeply: { nested: [p] } } }],
                ]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            yield chai_1.assert.isFulfilled((0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: fakerArtifact }), {}, []));
        }));
        it("should validate a module parameter with a default value that is an AccountRuntimeValue", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "b",
                                type: "address",
                            },
                        ],
                        name: "test",
                        outputs: [],
                        stateMutability: "pure",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", m.getAccount(1));
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "test", [p]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            yield chai_1.assert.isFulfilled((0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: helpers_1.fakeArtifact }), {}, []));
        }));
        it("should validate a module parameter with a default value that is an AccountRuntimeValue for a negative index", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "b",
                                type: "address",
                            },
                        ],
                        name: "test",
                        outputs: [],
                        stateMutability: "pure",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", m.getAccount(-1));
                const another = m.contract("Another", fakerArtifact, []);
                m.staticCall(another, "test", [p]);
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate a negative account index", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                const account = m.getAccount(-1);
                m.staticCall(another, "inc", [1], 0, { from: account });
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate an account index greater than the number of available accounts", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "bool",
                                name: "b",
                                type: "bool",
                            },
                        ],
                        name: "inc",
                        outputs: [],
                        stateMutability: "view",
                        type: "function",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                const account = m.getAccount(1);
                m.staticCall(another, "inc", [1], 0, { from: account });
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.STATIC_CALL);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedStaticCall_1.validateNamedStaticCall)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Requested account index '1' is greater than the total number of available accounts '0'");
        }));
    });
});
