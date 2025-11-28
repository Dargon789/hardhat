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
const get_futures_from_module_1 = require("../src/internal/utils/get-futures-from-module");
const validateReadEventArgument_1 = require("../src/internal/validation/futures/validateReadEventArgument");
const helpers_1 = require("./helpers");
describe("Read event argument", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    describe("creating modules with it", () => {
        it("should support reading arguments from all the futures that can emit them", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("Contract");
                const contractFromArtifact = m.contract("ContractFromArtifact", helpers_1.fakeArtifact);
                const call = m.call(contract, "fuc");
                m.readEventArgument(contract, "EventName1", "arg1");
                m.readEventArgument(contractFromArtifact, "EventName2", "arg2");
                m.readEventArgument(call, "EventName3", "arg3");
                return { contract, contractFromArtifact };
            });
            const callFuture = Array.from(mod.futures).find((f) => f.type === src_1.FutureType.CONTRACT_CALL);
            const [read1, read2, read3] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.futureToReadFrom, mod.results.contract);
            chai_1.assert.equal(read2.futureToReadFrom, mod.results.contractFromArtifact);
            chai_1.assert.equal(read3.futureToReadFrom, callFuture);
        });
        it("should infer the emitter from the future correctly", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("Contract");
                const call = m.call(contract, "fuc");
                m.readEventArgument(contract, "EventName1", "arg1");
                m.readEventArgument(call, "EventName2", "arg2");
                return { contract };
            });
            const [read1, read2] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.emitter, mod.results.contract);
            chai_1.assert.equal(read2.emitter, mod.results.contract);
        });
        it("should accept an explicit emitter", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("ContractThatCallsEmitter");
                const emitter = m.contract("ContractThatEmittsEvent2");
                const call = m.call(contract, "doSomethingAndCallThEmitter", [emitter]);
                m.readEventArgument(contract, "EventEmittedDuringConstruction", "arg1");
                m.readEventArgument(call, "Event2", "arg2", { emitter });
                return { contract, emitter };
            });
            const [read1, read2] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.emitter, mod.results.contract);
            chai_1.assert.equal(read2.emitter, mod.results.emitter);
        });
        it("should set the right eventName and nameOrIndex", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("Contract");
                const call = m.call(contract, "fuc");
                m.readEventArgument(contract, "EventName1", "arg1");
                m.readEventArgument(call, "EventName2", 2);
                return { contract };
            });
            const [read1, read2] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.eventName, "EventName1");
            chai_1.assert.equal(read1.nameOrIndex, "arg1");
            chai_1.assert.equal(read2.eventName, "EventName2");
            chai_1.assert.equal(read2.nameOrIndex, 2);
        });
        it("should default the eventIndex to 0", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("Contract");
                m.readEventArgument(contract, "EventName1", "arg1");
                return { contract };
            });
            const [read1] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.eventIndex, 0);
        });
        it("should accept an explicit eventIndex", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract = m.contract("Contract");
                m.readEventArgument(contract, "EventName1", "arg1", { eventIndex: 1 });
                return { contract };
            });
            const [read1] = Array.from(mod.futures).filter((f) => f.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            chai_1.assert.equal(read1.eventIndex, 1);
        });
    });
    describe("using the values", () => {
        // TODO
    });
    describe("passing ids", () => {
        it("should have a default id based on the emitter's contract name, the event name, argument and index", () => {
            const mod = (0, build_module_1.buildModule)("Module1", (m) => {
                const main = m.contract("Main");
                const emitter = m.contract("Emitter");
                m.readEventArgument(main, "EventName", "arg1");
                m.readEventArgument(main, "EventName2", "arg2", {
                    emitter,
                    eventIndex: 1,
                });
                return { main, emitter };
            });
            chai_1.assert.equal(mod.id, "Module1");
            const futuresIds = Array.from(mod.futures).map((f) => f.id);
            chai_1.assert.include(futuresIds, "Module1#Main.EventName.arg1.0");
            chai_1.assert.include(futuresIds, "Module1#Emitter.EventName2.arg2.1");
        });
        it("should be able to read the same argument twice by passing a explicit id", () => {
            const moduleWithSameReadEventArgumentTwice = (0, build_module_1.buildModule)("Module1", (m) => {
                const example = m.contract("Example");
                m.readEventArgument(example, "EventName", "arg1");
                m.readEventArgument(example, "EventName", "arg1", {
                    id: "second",
                });
                return { example };
            });
            chai_1.assert.equal(moduleWithSameReadEventArgumentTwice.id, "Module1");
            const futuresIds = Array.from(moduleWithSameReadEventArgumentTwice.futures).map((f) => f.id);
            chai_1.assert.include(futuresIds, "Module1#Example.EventName.arg1.0");
            chai_1.assert.include(futuresIds, "Module1#second");
        });
        it("should throw if the same read event arguennet is done twice without differentiating ids", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const example = m.contract("Example");
                m.readEventArgument(example, "EventName", "arg1");
                m.readEventArgument(example, "EventName", "arg1");
                return {};
            }), `IGN702: Module validation failed with reason: The autogenerated future id ("Module1#Example.EventName.arg1.0") is already used. Please provide a unique id, as shown below:

m.readEventArgument(..., { id: "MyUniqueId"})`);
        });
        it("should throw if a read event argument tries to pass the same id twice", () => {
            chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                const example = m.contract("Example");
                m.readEventArgument(example, "EventName", "arg1", {
                    id: "ReadEvent1",
                });
                m.readEventArgument(example, "EventName", "arg1", {
                    id: "ReadEvent1",
                });
                m.send("first", "0xtest", 0n, "test");
                m.send("first", "0xtest", 0n, "test");
                return {};
            }), `IGN702: Module validation failed with reason: The future id "ReadEvent1" is already used, please provide a different one.`);
        });
    });
    describe("validation", () => {
        describe("module stage", () => {
            it("should not validate a SendDataFuture if no emitter is provided", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const send = m.send("id", exampleAddress, 42n);
                    m.readEventArgument(send, "SomeEvent", "someArg");
                    return {};
                }), /`options.emitter` must be provided when reading an event from a SendDataFuture/);
            });
            it("should not validate a nameOrIndex that is not a number or string", () => {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("Module1", (m) => {
                    const another = m.contract("Another", []);
                    m.readEventArgument(another, "test", {});
                    return { another };
                }), /Invalid nameOrIndex given/);
            });
        });
        it("should not validate a non-existant hardhat contract", () => __awaiter(void 0, void 0, void 0, function* () {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", []);
                m.readEventArgument(another, "test", "arg");
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            (0, helpers_1.assertValidationError)(yield (0, validateReadEventArgument_1.validateReadEventArgument)(future, (0, helpers_1.setupMockArtifactResolver)({ Another: {} }), {}, []), "Artifact for contract 'Another' is invalid");
        }));
        it("should not validate a non-existant event", () => __awaiter(void 0, void 0, void 0, function* () {
            const fakerArtifact = Object.assign(Object.assign({}, helpers_1.fakeArtifact), { contractName: "Another" });
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const another = m.contract("Another", fakerArtifact, []);
                m.readEventArgument(another, "test", "arg");
                return { another };
            });
            const future = (0, get_futures_from_module_1.getFuturesFromModule)(module).find((v) => v.type === src_1.FutureType.READ_EVENT_ARGUMENT);
            (0, helpers_1.assertValidationError)(yield (0, validateReadEventArgument_1.validateReadEventArgument)(future, (0, helpers_1.setupMockArtifactResolver)(), {}, []), "Event 'test' not found in contract Another");
        }));
    });
});
