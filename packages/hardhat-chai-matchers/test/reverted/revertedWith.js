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
const helpers_1 = require("../helpers");
require("../../src/internal/add-chai-matchers");
describe("INTEGRATION: Reverted with", function () {
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
        describe("calling a method that succeeds", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "succeeds",
                        successfulAssert: (x) => (0, chai_1.expect)(x).not.to.be.revertedWith("some reason"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "succeeds",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some reason', but it didn't revert",
                    });
                });
            });
        });
        describe("calling a method that reverts without a reason", function () {
            it("successful asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertsWithoutReason",
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWith("some reason"),
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
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some reason', but it reverted without a reason",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                    });
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["regular expression reason"],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith(/regular .* reason/),
                    });
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["some reason"],
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWith("another reason"),
                    });
                });
            });
            it("failed asserts: expected reason not to match", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["some reason"],
                        failedAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction NOT to be reverted with reason 'some reason', but it was",
                    });
                });
            });
            it("failed asserts: expected a different reason", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["another reason"],
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some reason', but it reverted with reason 'another reason'",
                    });
                });
            });
            it("failed asserts: expected a different regular expression reason ", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["another regular expression reason"],
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith(/some regular .* reason/),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some regular .* reason', but it reverted with reason 'another regular expression reason'",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWith("some reason"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "panicAssert",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some reason', but it reverted with panic code 0x01 (Assertion error)",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWith("some reason"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertWithSomeCustomError",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWith("some reason"),
                        failedAssertReason: "Expected transaction to be reverted with reason 'some reason', but it reverted with a custom error",
                    });
                });
            });
        });
        describe("invalid values", function () {
            it("non-errors as subject", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(Promise.reject({})).to.be.revertedWith("some reason")).to.be.rejectedWith(chai_1.AssertionError, "Expected an Error object");
                });
            });
            it("non-string as expectation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    (0, chai_1.expect)(() => 
                    // @ts-expect-error
                    (0, chai_1.expect)(hash).to.be.revertedWith(10)).to.throw(TypeError, "Expected the revert reason to be a string or a regular expression");
                });
            });
            it("non-string as expectation, subject is a rejected promise", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const tx = matchers.revertsWithoutReason();
                    (0, chai_1.expect)(() => 
                    // @ts-expect-error
                    (0, chai_1.expect)(tx).to.be.revertedWith(10)).to.throw(TypeError, "Expected the revert reason to be a string or a regular expression");
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
                    })).to.not.be.revertedWith("some reason")).to.be.eventually.rejectedWith(errors_1.ProviderError, "Sender doesn't have enough funds to send tx");
                });
            });
        });
        describe("stack traces", function () {
            // smoke test for stack traces
            it("includes test file", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, chai_1.expect)(matchers.revertsWith("bar")).to.be.revertedWith("foo");
                    }
                    catch (e) {
                        const errorString = util_1.default.inspect(e);
                        (0, chai_1.expect)(errorString).to.include("Expected transaction to be reverted with reason 'foo', but it reverted with reason 'bar'");
                        (0, chai_1.expect)(errorString).to.include(path_1.default.join("test", "reverted", "revertedWith.ts"));
                        return;
                    }
                    chai_1.expect.fail("Expected an exception but none was thrown");
                });
            });
        });
    }
});
