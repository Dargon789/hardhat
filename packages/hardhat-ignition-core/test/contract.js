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
const validateNamedContractDeployment_1 = require("../src/internal/validation/futures/validateNamedContractDeployment");
const module_2 = require("../src/types/module");
const helpers_1 = require("./helpers");
describe("contract", () => {
    it("should be able to setup a deploy contract call", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract1 = m.contract("Contract1");
            return { contract1 };
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        // Sets ids based on module id and contract name
        chai_1.assert.equal(moduleWithASingleContract.id, "Module1");
        chai_1.assert.equal(moduleWithASingleContract.results.contract1.id, "Module1#Contract1");
        // 1 contract future
        chai_1.assert.equal(moduleWithASingleContract.futures.size, 1);
        chai_1.assert.equal([...moduleWithASingleContract.futures][0].type, module_2.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT);
        // No submodules
        chai_1.assert.equal(moduleWithASingleContract.submodules.size, 0);
    });
    it("should be able to pass one contract as an arg dependency to another", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const another = m.contract("Another", [example]);
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 1);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
    });
    it("should be able to pass one contract as an after dependency of another", () => {
        const otherModule = (0, build_module_1.buildModule)("Module2", (m) => {
            const example = m.contract("Example");
            return { example };
        });
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const another = m.contract("Another", [], {
                after: [example, otherModule],
            });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 2);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(anotherFuture.dependencies.has(otherModule));
    });
    it("should be able to pass a library as a dependency of a contract", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.library("Example");
            const another = m.contract("Another", [], {
                libraries: { Example: example },
            });
            return { example, another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(anotherFuture.dependencies.size, 1);
        chai_1.assert.equal(anotherFuture.libraries.Example.id, exampleFuture === null || exampleFuture === void 0 ? void 0 : exampleFuture.id);
        (0, chai_1.assert)(anotherFuture.dependencies.has(exampleFuture));
    });
    it("should be able to pass value as an option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.contract("Another", [], { value: BigInt(42) });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(anotherFuture.value, BigInt(42));
    });
    it("Should be able to pass a ModuleParameterRuntimeValue as a value option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.contract("Another", [], {
                value: m.getParameter("value"),
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.value, module_1.ModuleParameterRuntimeValueImplementation);
    });
    it("Should be able to pass a StaticCallFuture as a value option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract = m.contract("Contract");
            const staticCall = m.staticCall(contract, "test");
            const another = m.contract("Another", [], {
                value: staticCall,
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.value, module_1.NamedStaticCallFutureImplementation);
    });
    it("Should be able to pass a ReadEventArgumentFuture as a value option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const contract = m.contract("Contract");
            const eventArg = m.readEventArgument(contract, "TestEvent", "eventArg");
            const another = m.contract("Another", [], {
                value: eventArg,
            });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.value, module_1.ReadEventArgumentFutureImplementation);
    });
    it("should be able to pass a string as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.contract("Another", [], { from: "0x2" });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        chai_1.assert.equal(anotherFuture.from, "0x2");
    });
    it("Should be able to pass an AccountRuntimeValue as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const another = m.contract("Another", [], { from: m.getAccount(1) });
            return { another };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const anotherFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Another");
        if (!(anotherFuture instanceof module_1.NamedContractDeploymentFutureImplementation)) {
            chai_1.assert.fail("Not a named contract deployment");
        }
        (0, helpers_1.assertInstanceOf)(anotherFuture.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(anotherFuture.from.accountIndex, 1);
    });
    describe("Arguments", () => {
        it("Should support base values as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [1, true, "string", 4n]);
                return { contract1 };
            });
            chai_1.assert.deepEqual(module.results.contract1.constructorArgs, [
                1,
                true,
                "string",
                4n,
            ]);
        });
        it("Should support arrays as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [[1, 2, 3n]]);
                return { contract1 };
            });
            chai_1.assert.deepEqual(module.results.contract1.constructorArgs[0], [1, 2, 3n]);
        });
        it("Should support objects as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [{ a: 1, b: [1, 2] }]);
                return { contract1 };
            });
            chai_1.assert.deepEqual(module.results.contract1.constructorArgs[0], {
                a: 1,
                b: [1, 2],
            });
        });
        it("Should support futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2", [contract1]);
                return { contract1, contract2 };
            });
            chai_1.assert.equal(module.results.contract2.constructorArgs[0], module.results.contract1);
        });
        it("should support nested futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2", [{ arr: [contract1] }]);
                return { contract1, contract2 };
            });
            chai_1.assert.equal(module.results.contract2.constructorArgs[0].arr[0], module.results.contract1);
        });
        it("should support AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1", [account1]);
                return { contract1 };
            });
            (0, helpers_1.assertInstanceOf)(module.results.contract1.constructorArgs[0], module_1.AccountRuntimeValueImplementation);
            chai_1.assert.equal(module.results.contract1.constructorArgs[0].accountIndex, 1);
        });
        it("should support nested AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1", [{ arr: [account1] }]);
                return { contract1 };
            });
            const account = module.results.contract1.constructorArgs[0]
                .arr[0];
            (0, helpers_1.assertInstanceOf)(account, module_1.AccountRuntimeValueImplementation);
            chai_1.assert.equal(account.accountIndex, 1);
        });
        it("should support ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1", [p]);
                return { contract1 };
            });
            (0, helpers_1.assertInstanceOf)(module.results.contract1.constructorArgs[0], module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(module.results.contract1.constructorArgs[0].name, "p");
            chai_1.assert.equal(module.results.contract1.constructorArgs[0].defaultValue, 123);
        });
        it("should support nested ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1", [{ arr: [p] }]);
                return { contract1 };
            });
            const param = module.results.contract1.constructorArgs[0].arr[0];
            (0, helpers_1.assertInstanceOf)(param, module_1.ModuleParameterRuntimeValueImplementation);
            chai_1.assert.equal(param.name, "p");
            chai_1.assert.equal(param.defaultValue, 123);
        });
    });
    describe("passing id", () => {
        it("should be able to deploy the same contract twice by passing an id", () => {
            const moduleWithSameContractTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contract("SameContract", [], { id: "first" });
                const sameContract2 = m.contract("SameContract", [], {
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
                const sameContract1 = m.contract("SameContract");
                const sameContract2 = m.contract("SameContract");
                return { sameContract1, sameContract2 };
            }), `The autogenerated future id ("Module1#SameContract") is already used. Please provide a unique id, as shown below:

m.contract(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a contract tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const sameContract1 = m.contract("SameContract", [], {
                    id: "same",
                });
                const sameContract2 = m.contract("SameContract", [], {
                    id: "same",
                });
                return { sameContract1, sameContract2 };
            }), 'The future id "same" is already used, please provide a different one.');
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate a non-bignumber value option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", [], { value: 42 });
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid option "value" received. It should be a bigint, a module parameter, or a value obtained from an event or static call./);
            });
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
                    const test = m.contract("Test", [], {
                        libraries: { Call: call },
                    });
                    return { another, test };
                }), /IGN702: Module validation failed with reason: The value you provided for the library 'Call' is not a valid Future or it doesn't represent a contract/);
            });
        });
        it("should not validate an invalid artifact", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another");
                return { another };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({
                Another: {},
            }), {}, []), "Artifact for contract 'Another' is invalid");
        }));
        it("should not validate an incorrect number of constructor args", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Test", [1, 2, 3]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: helpers_1.fakeArtifact }), {}, []), "The constructor of the contract 'Test' expects 0 arguments but 3 were given");
        }));
        it("should not validate a missing module parameter", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                const contract1 = m.contract("Test", [p]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should not validate a module parameter of the wrong type for value", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", false);
                const contract1 = m.contract("Test", [], { value: p });
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []), "Module parameter 'p' must be of type 'bigint' but is 'boolean'");
        }));
        it("should validate a module parameter of the correct type for value", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", 42n);
                const contract1 = m.contract("Test", [], { value: p });
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            yield chai_1.assert.isFulfilled((0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []));
        }));
        it("should validate a missing module parameter if a default parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Test", [p]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            const result = yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []);
            chai_1.assert.deepEqual(result, []);
        }));
        it("should validate a missing module parameter if a global parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                const contract1 = m.contract("Test", [p]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            const result = yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {
                $global: { p: 123 },
            }, []);
            chai_1.assert.deepEqual(result, []);
        }));
        it("should not validate a missing module parameter (deeply nested)", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                const contract1 = m.contract("Test", [
                    [123, { really: { deeply: { nested: [p] } } }],
                ]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should validate a missing module parameter if a default parameter is present (deeply nested)", () => __awaiter(void 0, void 0, void 0, function* () {
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
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Test", [
                    [123, { really: { deeply: { nested: [p] } } }],
                ]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            yield chai_1.assert.isFulfilled((0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []));
        }));
        it("should validate a module parameter with a default value that is an AccountRuntimeValue", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "p",
                                type: "address",
                            },
                        ],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", m.getAccount(1));
                const contract1 = m.contract("Test", [p]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            yield chai_1.assert.isFulfilled((0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []));
        }));
        it("should not validate a module parameter with a default value that is an AccountRuntimeValue for a negative index", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { abi: [
                    {
                        inputs: [
                            {
                                internalType: "address",
                                name: "p",
                                type: "address",
                            },
                        ],
                        stateMutability: "payable",
                        type: "constructor",
                    },
                ] });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", m.getAccount(-1));
                const contract1 = m.contract("Test", [p]);
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: fakerArtifact }), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate a negative account index", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(-1);
                const contract1 = m.contract("Test", [], { from: account });
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: helpers_1.fakeArtifact }), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate an account index greater than the number of available accounts", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(1);
                const contract1 = m.contract("Test", [], { from: account });
                return { contract1 };
            });
            const [future] = (0, get_futures_from_module_1.getFuturesFromModule)(module);
            (0, helpers_1.assertValidationError)(yield (0, validateNamedContractDeployment_1.validateNamedContractDeployment)(future, (0, helpers_1.setupMockArtifactResolver)({ Test: helpers_1.fakeArtifact }), {}, []), "Requested account index '1' is greater than the total number of available accounts '0'");
        }));
    });
});
