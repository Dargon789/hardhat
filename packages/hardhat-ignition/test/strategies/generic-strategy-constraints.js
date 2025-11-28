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
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const mine_block_1 = require("../test-helpers/mine-block");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
const wait_for_pending_txs_1 = require("../test-helpers/wait-for-pending-txs");
const strategies = ["basic", "create2"];
const exampleConfig = {
    basic: {},
    create2: {
        salt: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    },
};
describe("strategies - generic constraints", function () {
    strategies.forEach((strategy) => {
        describe(strategy, function () {
            (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
            it("should deploy a contract", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("Foo");
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.equal(yield result.foo.read.x(), Number(1));
                });
            });
            it("should deploy multiple contracts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("Foo");
                        const bar = m.contract("Bar");
                        return { foo, bar };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 2, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.isDefined(result.bar.address);
                    chai_1.assert.equal(yield result.foo.read.x(), Number(1));
                    chai_1.assert.equal(yield result.bar.read.isBar(), true);
                });
            });
            it("should call a contract function", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("Foo");
                        m.call(foo, "inc");
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.equal(yield result.foo.read.x(), Number(2));
                });
            });
            it("should static call a contract function", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("Foo");
                        const firstInc = m.call(foo, "inc", [], { id: "inc1" });
                        const secondInc = m.call(foo, "inc", [], {
                            id: "inc2",
                            after: [firstInc],
                        });
                        const counter = m.staticCall(foo, "x", [], 0, {
                            id: "inc3",
                            after: [secondInc],
                        });
                        m.call(foo, "incByPositiveNumber", [counter]);
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.equal(yield result.foo.read.x(), Number(6));
                });
            });
            it("should support using existing contracts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("Foo");
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    const fooAddress = result.foo.address;
                    const contractAtDefinition = (0, ignition_core_1.buildModule)("ContractAtModule", (m) => {
                        const contractAtFoo = m.contractAt("Foo", fooAddress);
                        m.call(contractAtFoo, "inc");
                        return { contractAtFoo };
                    });
                    const contractAtPromise = this.hre.ignition.deploy(contractAtDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, contractAtPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const contractAtResult = yield contractAtPromise;
                    chai_1.assert.equal(yield contractAtResult.contractAtFoo.read.x(), Number(2));
                });
            });
            it("should read an event emitted from a constructor", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("EventArgValue");
                        const arg = m.readEventArgument(foo, "EventValue", "value");
                        // will revert if the event argument is not equal to 42
                        m.call(foo, "validateEmitted", [arg]);
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.equal(yield result.foo.read.argWasValidated(), true);
                });
            });
            it("should read an event emitted from a function", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                        const foo = m.contract("SendDataEmitter");
                        const eventCall = m.call(foo, "emitEvent");
                        const arg = m.readEventArgument(eventCall, "SendDataEvent", "arg", {
                            emitter: foo,
                        });
                        // will revert if the event argument is not equal to 42
                        m.call(foo, "validateEmitted", [arg]);
                        return { foo };
                    });
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy,
                        strategyConfig: exampleConfig[strategy],
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.isDefined(result.foo.address);
                    chai_1.assert.equal(yield result.foo.read.wasEmitted(), true);
                });
            });
        });
    });
});
