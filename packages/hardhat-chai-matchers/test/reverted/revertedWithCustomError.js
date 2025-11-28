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
const withArgs_1 = require("../../src/withArgs");
describe("INTEGRATION: Reverted with custom error", function () {
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).not.to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "succeeds",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it didn't revert",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWithCustomError(matchers, "SomeCustomError"),
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
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted without a reason",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWithCustomError(matchers, "SomeCustomError"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertsWith",
                        args: ["some reason"],
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted with reason 'some reason'",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWithCustomError(matchers, "SomeCustomError"),
                    });
                });
            });
            it("failed asserts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "panicAssert",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted with panic code 0x01 (Assertion error)",
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
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                    });
                    yield (0, helpers_1.runSuccessfulAsserts)({
                        matchers,
                        method: "revertWithAnotherCustomError",
                        successfulAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWithCustomError(matchers, "SomeCustomError"),
                    });
                });
            });
            it("failed asserts: expected custom error not to match", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertWithSomeCustomError",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.not.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction NOT to be reverted with custom error 'SomeCustomError', but it was",
                    });
                });
            });
            it("failed asserts: reverts with another custom error of the same contract", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertWithAnotherCustomError",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted with custom error 'AnotherCustomError'",
                    });
                });
            });
            it("failed asserts: reverts with another custom error of another contract", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.runFailedAsserts)({
                        matchers,
                        method: "revertWithAnotherContractCustomError",
                        failedAssert: (x) => (0, chai_1.expect)(x).to.be.revertedWithCustomError(matchers, "SomeCustomError"),
                        failedAssertReason: "Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted with a different custom error",
                    });
                });
            });
        });
        describe("with args", function () {
            describe("one argument", function () {
                it("Should match correct argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUint")
                            .withArgs(1);
                    });
                });
                it("Should fail if wrong argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUint")
                            .withArgs(2)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithUint" custom error: Error in the 1st argument assertion: expected 1 to equal 2.');
                    });
                });
            });
            describe("two arguments", function () {
                it("Should match correct values", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "foo"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(1, "foo");
                    });
                });
                it("Should fail if uint is wrong", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "foo"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(2, "foo")).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithUintAndString" custom error: Error in the 1st argument assertion: expected 1 to equal 2.');
                    });
                });
                it("Should fail if string is wrong", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "foo"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(1, "bar")).to.be.rejectedWith(chai_1.AssertionError, "Error in \"CustomErrorWithUintAndString\" custom error: Error in the 2nd argument assertion: expected 'foo' to equal 'bar'");
                    });
                });
                it("Should fail if first predicate throws", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "foo"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(() => {
                            throw new Error("user-defined error");
                        }, "foo")).to.be.rejectedWith(Error, 'Error in "CustomErrorWithUintAndString" custom error: Error in the 1st argument assertion: The predicate threw when called: user-defined error');
                    });
                });
            });
            describe("different number of arguments", function () {
                it("Should reject if expected fewer arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "s"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(1)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithUintAndString" custom error: Expected arguments array to have length 1, but it has 2');
                    });
                });
                it("Should reject if expected more arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUintAndString(1, "s"))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUintAndString")
                            .withArgs(1, "s", 3)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithUintAndString" custom error: Expected arguments array to have length 3, but it has 2');
                    });
                });
            });
            describe("nested arguments", function () {
                it("should match correct arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(matchers.revertWithCustomErrorWithPair(1, 2))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithPair")
                            .withArgs([1, 2]);
                    });
                });
                it("should reject different arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithPair(1, 2))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithPair")
                            .withArgs([3, 2])).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithPair" custom error: Error in the 1st argument assertion: Error in the 1st argument assertion: expected 1 to equal 3.');
                    });
                });
            });
            describe("array of different lengths", function () {
                it("Should fail if the expected array is bigger", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithPair(1, 2))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithPair")
                            .withArgs([1])).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithPair" custom error: Error in the 1st argument assertion: Expected arguments array to have length 1, but it has 2');
                    });
                });
                it("Should fail if the expected array is smaller", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithPair(1, 2))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithPair")
                            .withArgs([1, 2, 3])).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithPair" custom error: Error in the 1st argument assertion: Expected arguments array to have length 3, but it has 2');
                    });
                });
            });
            it("Should fail when used with .not.", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithSomeCustomError())
                        .to.not.be.revertedWithCustomError(matchers, "SomeCustomError")
                        .withArgs(1)).to.throw(Error, "Do not combine .not. with .withArgs()");
                });
            });
            it("should fail if withArgs is called on its own", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                        // @ts-expect-error
                        .withArgs(1)).to.throw(Error, "withArgs can only be used in combination with a previous .emit or .revertedWithCustomError assertion");
                });
            });
            // TODO: re-enable this test when proper async chaining is implemented.
            // See https://github.com/NomicFoundation/hardhat/issues/4235
            it.skip("should fail if both emit and revertedWithCustomError are called", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithSomeCustomError())
                        .to.emit(matchers, "SomeEvent")
                        .and.to.be.revertedWithCustomError(matchers, "SomeCustomError")
                        .withArgs(1)).to.throw(Error, "withArgs called with both .emit and .revertedWithCustomError, but these assertions cannot be combined");
                });
            });
            describe("Should handle argument predicates", function () {
                it("Should pass when a predicate argument returns true", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUint")
                            .withArgs(withArgs_1.anyValue);
                        yield (0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUint")
                            .withArgs(withArgs_1.anyUint);
                    });
                });
                it("Should fail when a predicate argument returns false", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithUint(1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithUint")
                            .withArgs(() => false)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithUint" custom error: Error in the 1st argument assertion: The predicate did not return true');
                    });
                });
                it("Should fail when a predicate argument throws an error", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(matchers.revertWithCustomErrorWithInt(-1))
                            .to.be.revertedWithCustomError(matchers, "CustomErrorWithInt")
                            .withArgs(withArgs_1.anyUint)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "CustomErrorWithInt" custom error: Error in the 1st argument assertion: The predicate threw when called: anyUint expected its argument to be an unsigned integer, but it was negative, with value -1');
                    });
                });
            });
        });
        describe("invalid values", function () {
            it("non-errors as subject", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(Promise.reject({})).to.be.revertedWithCustomError(matchers, "SomeCustomError")).to.be.rejectedWith(chai_1.AssertionError, "Expected an Error object");
                });
            });
            it("non-string as expectation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { hash } = yield (0, helpers_1.mineSuccessfulTransaction)(this.hre);
                    (0, chai_1.expect)(() => 
                    // @ts-expect-error
                    (0, chai_1.expect)(hash).to.be.revertedWith(10)).to.throw(TypeError, "Expected the revert reason to be a string");
                });
            });
            it("the contract is not specified", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithSomeCustomError())
                        .to.be // @ts-expect-error
                        .revertedWithCustomError("SomeCustomError")).to.throw(TypeError, "The first argument of .revertedWithCustomError must be the contract that defines the custom error");
                });
            });
            it("the contract doesn't have a custom error with that name", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithSomeCustomError()).to.be.revertedWithCustomError(matchers, "SomeCustmError")).to.throw(Error, "The given contract doesn't have a custom error named 'SomeCustmError'");
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
                    })).to.not.be.revertedWithCustomError(matchers, "SomeCustomError")).to.be.eventually.rejectedWith(errors_1.ProviderError, "Sender doesn't have enough funds to send tx");
                });
            });
            it("extra arguments", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertWithSomeCustomError()).to.be.revertedWithCustomError(matchers, "SomeCustomError", 
                    // @ts-expect-error
                    "extraArgument")).to.throw(Error, "`.revertedWithCustomError` expects only two arguments: the contract and the error name. Arguments should be asserted with the `.withArgs` helper.");
                });
            });
        });
        describe("stack traces", function () {
            // smoke test for stack traces
            it("includes test file", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, chai_1.expect)(matchers.revertsWith("some reason")).to.be.revertedWithCustomError(matchers, "SomeCustomError");
                    }
                    catch (e) {
                        const errorString = util_1.default.inspect(e);
                        (0, chai_1.expect)(errorString).to.include("Expected transaction to be reverted with custom error 'SomeCustomError', but it reverted with reason 'some reason'");
                        (0, chai_1.expect)(errorString).to.include(path_1.default.join("test", "reverted", "revertedWithCustomError.ts"));
                        return;
                    }
                    chai_1.expect.fail("Expected an exception but none was thrown");
                });
            });
        });
    }
});
