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
const errors_1 = require("hardhat/internal/core/providers/errors");
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
require("../../src/internal/add-chai-matchers");
const helpers_1 = require("../helpers");
describe("INTEGRATION: Reverted", function () {
    describe("with the in-process hardhat network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        runTests();
    });
    describe("connected to a hardhat node", function () {
        (0, helpers_1.useEnvironmentWithNode)("hardhat-project");
        runTests();
    });
    function runTests() {
        // deploy Matchers contract before each test
        let matchers;
        beforeEach("deploy matchers contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Matchers = yield this.hre.ethers.getContractFactory("Matchers");
                matchers = yield Matchers.deploy();
            });
        });
        // helpers
        const expectAssertionError = (x, message) => __awaiter(this, void 0, void 0, function* () {
            return (0, chai_1.expect)(x).to.be.eventually.rejectedWith(chai_1.AssertionError, message);
        });
        describe("with a string as its subject", function () {
            it("hash of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    yield expectAssertionError((0, chai_1.expect)(hash).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(hash).to.not.be.reverted;
                });
            });
            it("hash of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    yield (0, chai_1.expect)(hash).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(hash).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
            it("invalid string", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)("0x123").to.be.reverted).to.be.rejectedWith(TypeError, "Expected a valid transaction hash, but got '0x123'");
                    yield (0, chai_1.expect)((0, chai_1.expect)("0x123").to.not.be.reverted).to.be.rejectedWith(TypeError, "Expected a valid transaction hash, but got '0x123'");
                });
            });
            it("promise of a hash of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    yield expectAssertionError((0, chai_1.expect)(Promise.resolve(hash)).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(Promise.resolve(hash)).to.not.be.reverted;
                });
            });
            it("promise of a hash of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    yield (0, chai_1.expect)(Promise.resolve(hash)).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(Promise.resolve(hash)).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
            it("promise of an invalid string", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(Promise.resolve("0x123")).to.be.reverted).to.be.rejectedWith(TypeError, "Expected a valid transaction hash, but got '0x123'");
                    yield (0, chai_1.expect)((0, chai_1.expect)(Promise.resolve("0x123")).to.not.be.reverted).to.be.rejectedWith(TypeError, "Expected a valid transaction hash, but got '0x123'");
                });
            });
            it("promise of a byte32 string", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(Promise.resolve("0x3230323400000000000000000000000000000000000000000000000000000000")).not.to.be.reverted;
                });
            });
        });
        describe("with a TxResponse as its subject", function () {
            it("TxResponse of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    yield expectAssertionError((0, chai_1.expect)(tx).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(tx).to.not.be.reverted;
                });
            });
            it("TxResponse of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    yield (0, chai_1.expect)(tx).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(tx).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
            it("promise of a TxResponse of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const txPromise = (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    yield expectAssertionError((0, chai_1.expect)(txPromise).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(txPromise).to.not.be.reverted;
                });
            });
            it("promise of a TxResponse of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    yield (0, chai_1.expect)(txPromise).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(txPromise).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
            it("reverted: should throw if chained to another non-chainable method", function () {
                const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                (0, chai_1.expect)(() => (0, chai_1.expect)(txPromise).to.be.revertedWith("an error message").and.to.be
                    .reverted).to.throw(/The matcher 'reverted' cannot be chained after 'revertedWith'./);
            });
            it("revertedWith: should throw if chained to another non-chainable method", function () {
                const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                (0, chai_1.expect)(() => (0, chai_1.expect)(txPromise)
                    .to.be.revertedWithCustomError(matchers, "SomeCustomError")
                    .and.to.be.revertedWith("an error message")).to.throw(/The matcher 'revertedWith' cannot be chained after 'revertedWithCustomError'./);
            });
            it("revertedWithCustomError: should throw if chained to another non-chainable method", function () {
                const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                (0, chai_1.expect)(() => (0, chai_1.expect)(txPromise)
                    .to.be.revertedWithoutReason()
                    .and.to.be.revertedWithCustomError(matchers, "SomeCustomError")).to.throw(/The matcher 'revertedWithCustomError' cannot be chained after 'revertedWithoutReason'./);
            });
            it("revertedWithoutReason: should throw if chained to another non-chainable method", function () {
                const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                (0, chai_1.expect)(() => (0, chai_1.expect)(txPromise)
                    .to.be.revertedWithPanic()
                    .and.to.be.revertedWithoutReason()).to.throw(/The matcher 'revertedWithoutReason' cannot be chained after 'revertedWithPanic'./);
            });
            it("revertedWithPanic: should throw if chained to another non-chainable method", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [sender] = yield this.hre.ethers.getSigners();
                    const txPromise = (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    (0, chai_1.expect)(() => (0, chai_1.expect)(txPromise)
                        .to.changeEtherBalance(sender, "-200")
                        .and.to.be.revertedWithPanic()).to.throw(/The matcher 'revertedWithPanic' cannot be chained after 'changeEtherBalance'./);
                });
            });
        });
        describe("with a TxReceipt as its subject", function () {
            it("TxReceipt of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    const receipt = yield tx.wait();
                    yield expectAssertionError((0, chai_1.expect)(receipt).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(receipt).to.not.be.reverted;
                });
            });
            it("TxReceipt of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    const receipt = yield this.hre.ethers.provider.getTransactionReceipt(tx.hash); // tx.wait rejects, so we use provider.getTransactionReceipt
                    yield (0, chai_1.expect)(receipt).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(receipt).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
            it("promise of a TxReceipt of a successful transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    const receiptPromise = tx.wait();
                    yield expectAssertionError((0, chai_1.expect)(receiptPromise).to.be.reverted, "Expected transaction to be reverted");
                    yield (0, chai_1.expect)(receiptPromise).to.not.be.reverted;
                });
            });
            it("promise of a TxReceipt of a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = yield (0, helpers_1.mineRevertedTransaction)(this.hre, matchers);
                    const receiptPromise = this.hre.ethers.provider.getTransactionReceipt(tx.hash); // tx.wait rejects, so we use provider.getTransactionReceipt
                    yield (0, chai_1.expect)(receiptPromise).to.be.reverted;
                    yield expectAssertionError((0, chai_1.expect)(receiptPromise).to.not.be.reverted, "Expected transaction NOT to be reverted");
                });
            });
        });
        describe("calling a contract method that succeeds", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "succeeds",
                        args: [],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.reverted,
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "succeeds",
                        args: [],
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.reverted,
                        failedAssertReason: "Expected transaction to be reverted",
                    });
                });
            });
        });
        describe("calling a method that reverts without a reason", function () {
            // depends on a bug being fixed on ethers.js
            // see https://github.com/NomicFoundation/hardhat/issues/3446
            it.skip("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertsWithoutReason",
                        args: [],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.reverted,
                    });
                });
            });
            // depends on a bug being fixed on ethers.js
            // see https://github.com/NomicFoundation/hardhat/issues/3446
            it.skip("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWithoutReason",
                        args: [],
                        failedAssert: (x) => (0, chai_1.expect)(x).not.to.be.reverted,
                        failedAssertReason: "Expected transaction NOT to be reverted",
                    });
                });
            });
        });
        describe("calling a method that reverts with a reason string", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["some reason"],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.reverted,
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["some reason"],
                        failedAssert: (x) => (0, chai_1.expect)(x).not.to.be.reverted,
                        failedAssertReason: "Expected transaction NOT to be reverted, but it reverted with reason 'some reason'",
                    });
                });
            });
        });
        describe("calling a method that reverts with a panic code", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "panicAssert",
                        args: [],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.reverted,
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "panicAssert",
                        args: [],
                        failedAssert: (x) => (0, chai_1.expect)(x).not.to.be.reverted,
                        failedAssertReason: "Expected transaction NOT to be reverted, but it reverted with panic code 0x01 (Assertion error)",
                    });
                });
            });
        });
        describe("calling a method that reverts with a custom error", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertWithSomeCustomError",
                        args: [],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.reverted,
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertWithSomeCustomError",
                        args: [],
                        failedAssert: (x) => (0, chai_1.expect)(x).not.to.be.reverted,
                        failedAssertReason: "Expected transaction NOT to be reverted",
                    });
                });
            });
        });
        describe("invalid rejection values", function () {
            it("non-errors", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield expectAssertionError((0, chai_1.expect)(Promise.reject({})).to.be.reverted, "Expected an Error object");
                });
            });
            it("errors that are not related to a reverted transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // use an address that almost surely doesn't have balance
                    const randomPrivateKey = "0xc5c587cc6e48e9692aee0bf07474118e6d830c11905f7ec7ff32c09c99eba5f9";
                    const signer = new this.hre.ethers.Wallet(randomPrivateKey, this.hre.ethers.provider);
                    const matchersFromSenderWithoutFunds = matchers.connect(signer);
                    // this transaction will fail because of lack of funds, not because of a
                    // revert
                    yield (0, chai_1.expect)((0, chai_1.expect)(matchersFromSenderWithoutFunds.revertsWithoutReason({
                        gasLimit: 1000000,
                    })).to.not.be.reverted).to.be.eventually.rejectedWith(errors_1.ProviderError, "Sender doesn't have enough funds to send tx");
                });
            });
        });
        describe("stack traces", function () {
            // smoke test for stack traces
            it("includes test file", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, chai_1.expect)(matchers.succeeds()).to.be.reverted;
                    }
                    catch (e) {
                        const errorString = util_1.default.inspect(e);
                        (0, chai_1.expect)(errorString).to.include("Expected transaction to be reverted");
                        (0, chai_1.expect)(errorString).to.include(path_1.default.join("test", "reverted", "reverted.ts"));
                        return;
                    }
                    chai_1.expect.fail("Expected an exception but none was thrown");
                });
            });
        });
    }
});
