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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const sinon_1 = __importDefault(require("sinon"));
const environment_1 = require("./environment");
const helpers_1 = require("./helpers");
(0, chai_1.use)(chai_as_promised_1.default);
describe("provider events", function () {
    (0, environment_1.useEnvironment)("minimal-project");
    describe("transaction events", function () {
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.network.provider.send("evm_setAutomine", [false]);
            });
        });
        it("should support .on(txHash)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx = yield s.sendTransaction({ to: s });
                let listener;
                const txPromise = new Promise((resolve) => {
                    listener = resolve;
                });
                yield this.env.ethers.provider.on(tx.hash, listener);
                yield this.env.network.provider.send("hardhat_mine");
                yield txPromise;
                yield this.env.ethers.provider.off(tx.hash, listener);
            });
        });
        it("should support .addListener and .removeListener as aliases", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx = yield s.sendTransaction({ to: s });
                let listener;
                const txPromise = new Promise((resolve) => {
                    listener = resolve;
                });
                yield this.env.ethers.provider.addListener(tx.hash, listener);
                yield this.env.network.provider.send("hardhat_mine");
                yield txPromise;
                yield this.env.ethers.provider.removeListener(tx.hash, listener);
            });
        });
        it("should support .once(txHash)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx = yield s.sendTransaction({ to: s });
                const listener = sinon_1.default.stub();
                yield this.env.ethers.provider.once(tx.hash, listener);
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.tryUntil)(() => {
                    chai_1.assert.equal(listener.callCount, 1);
                });
            });
        });
        it("should remove a listener with .off()", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx1 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const tx2 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on(tx1.hash, listener1);
                yield this.env.ethers.provider.once(tx2.hash, listener2);
                yield this.env.ethers.provider.off(tx1.hash, listener1);
                yield this.env.ethers.provider.off(tx2.hash, listener2);
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if .off() is called without a listener", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx1 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const tx2 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on(tx1.hash, listener1);
                yield this.env.ethers.provider.once(tx2.hash, listener2);
                yield this.env.ethers.provider.off(tx1.hash);
                yield this.env.ethers.provider.off(tx2.hash);
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if removeAllListeners(txHash) is called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx1 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const tx2 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on(tx1.hash, listener1);
                yield this.env.ethers.provider.once(tx2.hash, listener2);
                yield this.env.ethers.provider.removeAllListeners(tx1.hash);
                yield this.env.ethers.provider.removeAllListeners(tx2.hash);
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if removeAllListeners() is called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const tx1 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const tx2 = yield s.sendTransaction({ to: s, gasLimit: 21000 });
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on(tx1.hash, listener1);
                yield this.env.ethers.provider.once(tx2.hash, listener2);
                yield this.env.ethers.provider.removeAllListeners();
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should support emitting a transaction event", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const fakeTransactionHash = "0x1234567812345678123456781234567812345678123456781234567812345678";
                const listener = sinon_1.default.spy();
                yield this.env.ethers.provider.once(fakeTransactionHash, listener);
                const fakeTransaction = {};
                yield this.env.ethers.provider.emit(fakeTransactionHash, fakeTransaction);
                yield (0, helpers_1.tryUntil)(() => {
                    chai_1.assert.isTrue(listener.calledOnceWith(fakeTransaction));
                });
            });
        });
    });
    describe("block events", function () {
        it("should support .on('block')", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let listener;
                const blockPromise = new Promise((resolve) => {
                    listener = resolve;
                });
                yield this.env.ethers.provider.on("block", listener);
                // should be emitted when a tx is sent
                yield this.env.network.provider.send("hardhat_mine");
                yield blockPromise;
                // remove subscription
                yield this.env.ethers.provider.off("block", listener);
            });
        });
        it("should support .on('block') in multiple contexts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const blockListener = sinon_1.default.stub();
                yield this.env.ethers.provider.on("block", blockListener);
                // should be emitted when a tx is sent
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                // should be emitted when a block is mined
                yield this.env.network.provider.send("hardhat_mine");
                // should be emitted when several blocks are mined
                yield this.env.network.provider.send("hardhat_mine", ["0x5"]);
                yield (0, helpers_1.tryUntil)(() => {
                    chai_1.assert.equal(blockListener.callCount, 7);
                });
                // remove subscription
                yield this.env.ethers.provider.off("block", blockListener);
            });
        });
        it("should support .once('block')", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const blockListener = sinon_1.default.stub();
                yield this.env.ethers.provider.once("block", blockListener);
                // should be emitted when a tx is sent
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.tryUntil)(() => {
                    chai_1.assert.equal(blockListener.callCount, 1);
                });
                // shouldn't be emitted a second time
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.equal(blockListener.callCount, 1);
            });
        });
        it("should remove a listener with .off()", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                yield this.env.ethers.provider.off("block", listener1);
                yield this.env.ethers.provider.off("block", listener2);
                // mine a block
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if .off() is called without a listener", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                yield this.env.ethers.provider.off("block");
                // mine a block
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if .removeAllListeners('block') is called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                yield this.env.ethers.provider.removeAllListeners("block");
                // mine a block
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should remove all listeners if .removeAllListeners() is called", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = sinon_1.default.stub();
                const listener2 = sinon_1.default.stub();
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                yield this.env.ethers.provider.removeAllListeners();
                // mine a block
                const [s] = yield this.env.ethers.getSigners();
                yield s.sendTransaction({ to: s });
                yield (0, helpers_1.sleep)(100);
                chai_1.assert.isFalse(listener1.called);
                chai_1.assert.isFalse(listener2.called);
            });
        });
        it("should support emitting a block event", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let listener = null;
                const blockPromise = new Promise((resolve) => {
                    listener = sinon_1.default.spy(() => {
                        resolve();
                    });
                });
                yield this.env.ethers.provider.on("block", listener);
                // should be emitted when a tx is sent
                yield this.env.ethers.provider.emit("block", 123);
                yield blockPromise;
                chai_1.assert.isTrue(listener.calledOnceWith(123));
                // remove subscription
                yield this.env.ethers.provider.off("block", listener);
            });
        });
    });
    describe("listeners getters", function () {
        it("should get all the block listeners", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = () => { };
                const listener2 = () => { };
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                const listeners = yield this.env.ethers.provider.listeners("block");
                chai_1.assert.lengthOf(listeners, 2);
                chai_1.assert.sameMembers(listeners, [listener1, listener2]);
                yield this.env.ethers.provider.off("block");
            });
        });
        it("should get the right block listeners after a block is mined", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const listener1 = () => { };
                const listener2 = () => { };
                yield this.env.ethers.provider.on("block", listener1);
                yield this.env.ethers.provider.once("block", listener2);
                yield this.env.network.provider.send("hardhat_mine");
                yield (0, helpers_1.tryUntil)(() => __awaiter(this, void 0, void 0, function* () {
                    const listeners = yield this.env.ethers.provider.listeners("block");
                    chai_1.assert.lengthOf(listeners, 1);
                    chai_1.assert.sameMembers(listeners, [listener1]);
                }));
                yield this.env.ethers.provider.off("block");
            });
        });
    });
    describe("unsupported events", function () {
        it("should throw if .on is called with an unsupported event type", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.env.ethers.provider.on([], () => { }), "is not supported");
            });
        });
        it("should throw if .once is called with an unsupported event type", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.env.ethers.provider.once([], () => { }), "is not supported");
            });
        });
    });
});
