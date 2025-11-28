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
const validateSendData_1 = require("../src/internal/validation/futures/validateSendData");
const module_2 = require("../src/types/module");
const helpers_1 = require("./helpers");
describe("send", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    it("should be able to setup a send", () => {
        const moduleWithASingleContract = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", exampleAddress, 0n, "test-data");
            return {};
        });
        chai_1.assert.isDefined(moduleWithASingleContract);
        // 1 contract future & 1 call future
        chai_1.assert.equal(moduleWithASingleContract.futures.size, 1);
        chai_1.assert.equal([...moduleWithASingleContract.futures][0].type, module_2.FutureType.SEND_DATA);
        // No submodules
        chai_1.assert.equal(moduleWithASingleContract.submodules.size, 0);
        const sendFuture = [...moduleWithASingleContract.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        chai_1.assert.equal(sendFuture.data, "test-data");
    });
    it("should be able to pass one contract as the 'to' arg for a send", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            m.send("test_send", example, 0n, "");
            return { example };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        chai_1.assert.equal(sendFuture.dependencies.size, 1);
        (0, chai_1.assert)(sendFuture.dependencies.has(exampleFuture));
    });
    it("should be able to pass one contract as an after dependency of a send", () => {
        const otherModule = (0, build_module_1.buildModule)("Module2", (m) => {
            const example = m.contract("Example");
            return { example };
        });
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            m.send("test_send", exampleAddress, 0n, "", {
                after: [example, otherModule],
            });
            return { example };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#Example");
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        chai_1.assert.equal(sendFuture.dependencies.size, 2);
        (0, chai_1.assert)(sendFuture.dependencies.has(exampleFuture));
        (0, chai_1.assert)(sendFuture.dependencies.has(otherModule));
    });
    it("should be able to pass a value", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", exampleAddress, 42n, "");
            return {};
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        chai_1.assert.equal(sendFuture.value, BigInt(42));
    });
    it("Should be able to pass a ModuleParameterRuntimeValue as a value option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", exampleAddress, m.getParameter("value"), "");
            return {};
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        (0, helpers_1.assertInstanceOf)(sendFuture.value, module_1.ModuleParameterRuntimeValueImplementation);
    });
    it("should be able to pass a string as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", exampleAddress, 0n, "", { from: differentAddress });
            return {};
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        chai_1.assert.equal(sendFuture.from, differentAddress);
    });
    it("Should be able to pass an AccountRuntimeValue as from option", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", exampleAddress, 0n, "", { from: m.getAccount(1) });
            return {};
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        (0, helpers_1.assertInstanceOf)(sendFuture.from, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(sendFuture.from.accountIndex, 1);
    });
    it("Should be able to pass an AccountRuntimeValue as address", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            m.send("test_send", m.getAccount(1), 0n, "");
            return {};
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        (0, helpers_1.assertInstanceOf)(sendFuture.to, module_1.AccountRuntimeValueImplementation);
        chai_1.assert.equal(sendFuture.to.accountIndex, 1);
    });
    it("Should be able to pass a module param as address", () => {
        const module = (0, build_module_1.buildModule)("Module", (m) => {
            const paramWithDefault = m.getParameter("addressWithDefault", "0x000000");
            const paramWithoutDefault = m.getParameter("addressWithoutDefault");
            m.send("C", paramWithDefault);
            m.send("C2", paramWithoutDefault);
            return {};
        });
        const futureC = Array.from(module.futures).find((f) => f.id === "Module#C");
        (0, helpers_1.assertInstanceOf)(futureC, module_1.SendDataFutureImplementation);
        const futureC2 = Array.from(module.futures).find((f) => f.id === "Module#C2");
        (0, helpers_1.assertInstanceOf)(futureC2, module_1.SendDataFutureImplementation);
        (0, helpers_1.assertInstanceOf)(futureC.to, module_1.ModuleParameterRuntimeValueImplementation);
        chai_1.assert.equal(futureC.to.name, "addressWithDefault");
        chai_1.assert.equal(futureC.to.defaultValue, "0x000000");
        (0, helpers_1.assertInstanceOf)(futureC2.to, module_1.ModuleParameterRuntimeValueImplementation);
        chai_1.assert.equal(futureC2.to.name, "addressWithoutDefault");
        chai_1.assert.equal(futureC2.to.defaultValue, undefined);
    });
    it("should be able to pass an encode function call future as the 'data' arg for a send", () => {
        const moduleWithDependentContracts = (0, build_module_1.buildModule)("Module1", (m) => {
            const example = m.contract("Example");
            const data = m.encodeFunctionCall(example, "test", []);
            m.send("test_send", example, 0n, data);
            return { example };
        });
        chai_1.assert.isDefined(moduleWithDependentContracts);
        const exampleFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#encodeFunctionCall(Module1#Example.test)");
        const sendFuture = [...moduleWithDependentContracts.futures].find(({ id }) => id === "Module1#test_send");
        if (!(sendFuture instanceof module_1.SendDataFutureImplementation)) {
            chai_1.assert.fail("Not a send data future");
        }
        if (!(exampleFuture instanceof module_1.NamedEncodeFunctionCallFutureImplementation)) {
            chai_1.assert.fail("Not an encode function call future");
        }
        chai_1.assert.equal(sendFuture.dependencies.size, 2);
        (0, chai_1.assert)(sendFuture.dependencies.has(exampleFuture));
    });
    describe("passing id", () => {
        it("should be able to call the same function twice by passing an id", () => {
            const moduleWithSameCallTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                m.send("first", exampleAddress, 0n, "test");
                m.send("second", exampleAddress, 0n, "test");
                return {};
            });
            chai_1.assert.equal(moduleWithSameCallTwice.id, "Module1");
            const sendFuture = [...moduleWithSameCallTwice.futures].find(({ id }) => id === "Module1#first");
            const sendFuture2 = [...moduleWithSameCallTwice.futures].find(({ id }) => id === "Module1#second");
            chai_1.assert.isDefined(sendFuture);
            chai_1.assert.isDefined(sendFuture2);
        });
        it("should throw if the same function is called twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                m.send("test_send", exampleAddress, 0n, "test");
                m.send("test_send", exampleAddress, 0n, "test");
                return {};
            }), 'The future id "test_send" is already used, please provide a different one.');
        });
        it("should throw if a call tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                m.send("first", exampleAddress, 0n, "test");
                m.send("first", exampleAddress, 0n, "test");
                return {};
            }), 'The future id "first" is already used, please provide a different one.');
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate a non-bignumber value option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.send("id", exampleAddress, 42);
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid option "value" received. It should be a bigint, a module parameter, or a value obtained from an event or static call./);
            });
            it("should not validate a non-string data option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.send("id", exampleAddress, 0n, 42);
                    return { another };
                }), /Invalid data given/);
            });
            it("should not validate a non-address from option", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.send("id", another, 0n, "", { from: 1 });
                    return { another };
                }), /IGN702: Module validation failed with reason: Invalid type for option "from": number/);
            });
            it("should not validate an invalid address", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    const call = m.call(another, "test");
                    m.send("id", call, 0n, "");
                    return { another };
                }), /Invalid address given/);
            });
            it("should not validate a `to` as a string that is not an address", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    m.send("id", "0xnot-an-address", 0n, "");
                    return {};
                }), /Invalid address given/);
            });
            it("should not allow the from and to address to be the same", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    m.send("id", m.getAccount(1), 0n, "", { from: m.getAccount(1) });
                    return {};
                }), /The "to" and "from" addresses are the same/);
            });
        });
        it("should not validate a missing module parameter", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                m.send("id", p, 0n, "");
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            (0, helpers_1.assertValidationError)(yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Module parameter 'p' requires a value but was given none");
        }));
        it("should validate a missing module parameter if a default parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", "0x123");
                m.send("id", p, 0n, "");
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            const result = yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []);
            chai_1.assert.deepStrictEqual(result, []);
        }));
        it("should validate a missing module parameter if a global parameter is present", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p");
                m.send("id", p, 0n, "");
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            const result = yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {
                $global: {
                    p: "0x123",
                },
            }, []);
            chai_1.assert.deepStrictEqual(result, []);
        }));
        it("should not validate a module parameter of the wrong type for value", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", false);
                m.send("id", exampleAddress, p, "");
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            (0, helpers_1.assertValidationError)(yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Module parameter 'p' must be of type 'bigint' but is 'boolean'");
        }));
        it("should validate a module parameter of the correct type for value", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const p = m.getParameter("p", 42n);
                m.send("id", exampleAddress, p, "");
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            const result = yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []);
            chai_1.assert.deepStrictEqual(result, []);
        }));
        it("should not validate a negative account index", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(-1);
                m.send("id", exampleAddress, 0n, "", { from: account });
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            (0, helpers_1.assertValidationError)(yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Account index cannot be a negative number");
        }));
        it("should not validate an account index greater than the number of available accounts", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const account = m.getAccount(1);
                m.send("id", exampleAddress, 0n, "", { from: account });
                return {};
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === module_2.FutureType.SEND_DATA);
            (0, helpers_1.assertValidationError)(yield (0, validateSendData_1.validateSendData)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Requested account index '1' is greater than the total number of available accounts '0'");
        }));
    });
});
