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
const chai_1 = require("chai");
const ethers_1 = require("ethers");
require("../src/internal/add-chai-matchers");
const withArgs_1 = require("../src/withArgs");
const helpers_1 = require("./helpers");
describe(".to.emit (contract events)", () => {
    let contract;
    let otherContract;
    let overrideEventContract;
    let matchers;
    describe("with the in-process hardhat network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        runTests();
    });
    describe("connected to a hardhat node", function () {
        (0, helpers_1.useEnvironmentWithNode)("hardhat-project");
        runTests();
    });
    function runTests() {
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                otherContract = yield this.hre.ethers.deployContract("AnotherContract");
                contract = yield (yield this.hre.ethers.getContractFactory("Events")).deploy(yield otherContract.getAddress());
                overrideEventContract = yield (yield this.hre.ethers.getContractFactory("OverrideEventContract")).deploy();
                const Matchers = yield this.hre.ethers.getContractFactory("Matchers");
                matchers = yield Matchers.deploy();
            });
        });
        it("Should fail when expecting an event that's not in the contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(contract.doNotEmit()).to.emit(contract, "NonexistentEvent")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Event "NonexistentEvent" doesn\'t exist in the contract');
            });
        });
        it("Should fail when expecting an event that's not in the contract to NOT be emitted", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(contract.doNotEmit()).not.to.emit(contract, "NonexistentEvent")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Event "NonexistentEvent" doesn\'t exist in the contract');
            });
        });
        it("Should fail when the matcher is called with too many arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(
                // @ts-expect-error
                (0, chai_1.expect)(contract.emitUint(1)).not.to.emit(contract, "WithoutArgs", 1)).to.be.eventually.rejectedWith(Error, "`.emit` expects only two arguments: the contract and the event name. Arguments should be asserted with the `.withArgs` helper.");
            });
        });
        it("Should detect events without arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(contract.emitWithoutArgs()).to.emit(contract, "WithoutArgs");
            });
        });
        it("Should fail when expecting an event that wasn't emitted", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(contract.doNotEmit()).to.emit(contract, "WithoutArgs")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithoutArgs" to be emitted, but it wasn\'t');
            });
        });
        it("Should fail when expecting a specific event NOT to be emitted but it WAS", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitWithoutArgs()).to.not.emit(contract, "WithoutArgs")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithoutArgs" NOT to be emitted, but it was');
            });
        });
        describe(".withArgs", function () {
            it("Should fail when used with .not.", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(contract.emitUint(1))
                        .not.to.emit(contract, "WithUintArg")
                        .withArgs(1)).to.throw(Error, "Do not combine .not. with .withArgs()");
                });
            });
            it("Should fail when used with .not, subject is a rejected promise", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertsWithoutReason())
                        .not.to.emit(contract, "WithUintArg")
                        .withArgs(1)).to.throw(Error, "Do not combine .not. with .withArgs()");
                });
            });
            it("should fail if withArgs is called on its own", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(contract.emitUint(1))
                        // @ts-expect-error
                        .withArgs(1)).to.throw(Error, "withArgs can only be used in combination with a previous .emit or .revertedWithCustomError assertion");
                });
            });
            it("Should verify zero arguments", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(contract.emitWithoutArgs())
                        .to.emit(contract, "WithoutArgs")
                        .withArgs();
                });
            });
            describe("with a uint argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitUint(1))
                            .to.emit(contract, "WithUintArg")
                            .withArgs(1);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUint(1))
                            .to.emit(contract, "WithUintArg")
                            .withArgs(2)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArg" event: Error in the 1st argument assertion: expected 1 to equal 2.');
                    });
                });
                it("Should fail when too many arguments are given", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUint(1))
                            .to.emit(contract, "WithUintArg")
                            .withArgs(1, 3)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArg" event: Expected arguments array to have length 2, but it has 1');
                    });
                });
            });
            describe("with an address argument", function () {
                const addressable = ethers_1.ethers.Wallet.createRandom();
                const { address } = addressable;
                const otherAddressable = ethers_1.ethers.Wallet.createRandom();
                const { address: otherAddress } = otherAddressable;
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitAddress(addressable))
                            .to.emit(contract, "WithAddressArg")
                            .withArgs(address);
                    });
                });
                it("Should match addressable arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitAddress(addressable))
                            .to.emit(contract, "WithAddressArg")
                            .withArgs(addressable);
                    });
                });
                it("Should fail when the input argument doesn't match the addressable event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitAddress(addressable))
                            .to.emit(contract, "WithAddressArg")
                            .withArgs(otherAddressable)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithAddressArg" event: Error in the 1st argument assertion: expected '${address}' to equal '${otherAddress}'`);
                    });
                });
                it("Should fail when the input argument doesn't match the address event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitAddress(addressable))
                            .to.emit(contract, "WithAddressArg")
                            .withArgs(otherAddress)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithAddressArg" event: Error in the 1st argument assertion: expected '${address}' to equal '${otherAddress}'`);
                    });
                });
                it("Should fail when too many arguments are given", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitAddress(addressable))
                            .to.emit(contract, "WithAddressArg")
                            .withArgs(address, otherAddress)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithAddressArg" event: Expected arguments array to have length 2, but it has 1');
                    });
                });
            });
            // for abbreviating long strings in diff views like chai does:
            function abbrev(longString) {
                return `${longString.substring(0, 37)}…`;
            }
            function formatHash(str, hashFn = ethers_1.ethers.id) {
                const hash = hashFn(str);
                return {
                    str,
                    hash,
                    abbrev: abbrev(hash),
                };
            }
            function formatBytes(str) {
                const bytes = ethers_1.ethers.hexlify(ethers_1.ethers.toUtf8Bytes(str));
                const bytes32 = ethers_1.ethers.zeroPadValue(bytes, 32);
                return Object.assign(Object.assign({}, formatHash(str)), { bytes,
                    bytes32, abbrev32: abbrev(ethers_1.ethers.hexlify(bytes32)) });
            }
            const str1 = formatBytes("string1");
            const str2 = formatBytes("string2");
            describe("with a string argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitString("string"))
                            .to.emit(contract, "WithStringArg")
                            .withArgs("string");
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitString(str1.str))
                            .to.emit(contract, "WithStringArg")
                            .withArgs(str2.str)).to.be.eventually.rejectedWith(chai_1.AssertionError, `expected '${str1.str}' to equal '${str2.str}'`);
                    });
                });
            });
            describe("with an indexed string argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitIndexedString(str1.str))
                            .to.emit(contract, "WithIndexedStringArg")
                            .withArgs(str1.str);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedString(str1.str))
                            .to.emit(contract, "WithIndexedStringArg")
                            .withArgs(str2.str)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithIndexedStringArg" event: Error in the 1st argument assertion: The actual value was an indexed and hashed value of the event argument. The expected value provided to the assertion was hashed to produce ${str2.hash}. The actual hash and the expected hash ${str1.hash} did not match: expected '${str1.abbrev}' to equal '${str2.abbrev}'`);
                    });
                });
                it("Should fail if expected argument is the hash not the pre-image", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedString(str1.str))
                            .to.emit(contract, "WithIndexedStringArg")
                            .withArgs(str1.hash)).to.be.eventually.rejectedWith(chai_1.AssertionError, "The actual value was an indexed and hashed value of the event argument. The expected value provided to the assertion should be the actual event argument (the pre-image of the hash). You provided the hash itself. Please supply the actual event argument (the pre-image of the hash) instead");
                    });
                });
                it("Should fail when trying to match the event argument with an incorrect hash value", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const incorrect = formatHash(str2.hash, ethers_1.ethers.keccak256);
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedString(str1.str))
                            .to.emit(contract, "WithIndexedStringArg")
                            .withArgs(incorrect.str)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithIndexedStringArg" event: Error in the 1st argument assertion: The actual value was an indexed and hashed value of the event argument. The expected value provided to the assertion was hashed to produce ${incorrect.hash}. The actual hash and the expected hash ${str1.hash} did not match: expected '${str1.abbrev}' to equal '${incorrect.abbrev}`);
                    });
                });
            });
            describe("with a bytes argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitBytes(str1.bytes))
                            .to.emit(contract, "WithBytesArg")
                            .withArgs(str1.bytes);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitBytes(str2.bytes))
                            .to.emit(contract, "WithBytesArg")
                            .withArgs(str1.str)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithBytesArg" event: Error in the 1st argument assertion: expected '${str2.bytes}' to equal '${str1.str}'`);
                    });
                });
            });
            describe("with an indexed bytes argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitIndexedBytes(str1.bytes))
                            .to.emit(contract, "WithIndexedBytesArg")
                            .withArgs(str1.str);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedBytes(str2.bytes))
                            .to.emit(contract, "WithIndexedBytesArg")
                            .withArgs(str1.str)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithIndexedBytesArg" event: Error in the 1st argument assertion: The actual value was an indexed and hashed value of the event argument. The expected value provided to the assertion was hashed to produce ${str1.hash}. The actual hash and the expected hash ${str2.hash} did not match: expected '${str2.abbrev}' to equal '${str1.abbrev}'`);
                    });
                });
                it("Should fail the passed argument is the hash, not the pre-image", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedBytes(str1.bytes))
                            .to.emit(contract, "WithIndexedBytesArg")
                            .withArgs(str1.hash)).to.be.eventually.rejectedWith(chai_1.AssertionError, "The actual value was an indexed and hashed value of the event argument. The expected value provided to the assertion should be the actual event argument (the pre-image of the hash). You provided the hash itself. Please supply the actual event argument (the pre-image of the hash) instead.");
                    });
                });
            });
            describe("with a bytes32 argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitBytes32(str1.bytes32))
                            .to.emit(contract, "WithBytes32Arg")
                            .withArgs(str1.bytes32);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitBytes32(str2.bytes32))
                            .to.emit(contract, "WithBytes32Arg")
                            .withArgs(str1.bytes32)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithBytes32Arg" event: Error in the 1st argument assertion: expected '${str2.abbrev32}' to equal '${str1.abbrev32}'`);
                    });
                });
            });
            describe("with an indexed bytes32 argument", function () {
                it("Should match the argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitIndexedBytes32(str1.bytes32))
                            .to.emit(contract, "WithIndexedBytes32Arg")
                            .withArgs(str1.bytes32);
                    });
                });
                it("Should fail when the input argument doesn't match the event argument", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitIndexedBytes32(str2.bytes32))
                            .to.emit(contract, "WithIndexedBytes32Arg")
                            .withArgs(str1.bytes32)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithIndexedBytes32Arg" event: Error in the 1st argument assertion: expected '${str2.abbrev32}' to equal '${str1.abbrev32}'`);
                    });
                });
            });
            describe("with a uint array argument", function () {
                it("Should succeed when expectations are met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitUintArray(1, 2))
                            .to.emit(contract, "WithUintArray")
                            .withArgs([1, 2]);
                    });
                });
                it("Should fail when expectations are not met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintArray(1, 2))
                            .to.emit(contract, "WithUintArray")
                            .withArgs([3, 4])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithUintArray" event: Error in the 1st argument assertion: Error in the 1st argument assertion: expected 1 to equal 3.`);
                    });
                });
                describe("nested predicate", function () {
                    it("Should succeed when predicate passes", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitUintArray(1, 2))
                                .to.emit(contract, "WithUintArray")
                                .withArgs([withArgs_1.anyValue, 2]);
                        });
                    });
                    it("Should fail when predicate returns false", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintArray(1, 2))
                                .to.emit(contract, "WithUintArray")
                                .withArgs([() => false, 4])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithUintArray" event: Error in the 1st argument assertion: Error in the 1st argument assertion: The predicate did not return true`);
                        });
                    });
                    it("Should fail when predicate reverts", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintArray(1, 2))
                                .to.emit(contract, "WithUintArray")
                                .withArgs([
                                () => {
                                    throw new Error("user error");
                                },
                                4,
                            ])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithUintArray" event: Error in the 1st argument assertion: Error in the 1st argument assertion: The predicate threw when called: user error`);
                        });
                    });
                });
                describe("arrays different length", function () {
                    it("Should fail when the array is shorter", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintArray(1, 2))
                                .to.emit(contract, "WithUintArray")
                                .withArgs([1])).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArray" event: Error in the 1st argument assertion: Expected arguments array to have length 1, but it has 2');
                        });
                    });
                    it("Should fail when the array is longer", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintArray(1, 2))
                                .to.emit(contract, "WithUintArray")
                                .withArgs([1, 2, 3])).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArray" event: Error in the 1st argument assertion: Expected arguments array to have length 3, but it has 2');
                        });
                    });
                });
            });
            describe("with a bytes32 array argument", function () {
                const aa = `0x${"aa".repeat(32)}`;
                const bb = `0x${"bb".repeat(32)}`;
                const cc = `0x${"cc".repeat(32)}`;
                const dd = `0x${"dd".repeat(32)}`;
                it("Should succeed when expectations are met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitBytes32Array(aa, bb))
                            .to.emit(contract, "WithBytes32Array")
                            .withArgs([aa, bb]);
                    });
                });
                it("Should fail when expectations are not met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitBytes32Array(aa, bb))
                            .to.emit(contract, "WithBytes32Array")
                            .withArgs([cc, dd])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Error in "WithBytes32Array" event: Error in the 1st argument assertion: Error in the 1st argument assertion: expected '${abbrev(aa)}' to equal '${abbrev(cc)}'`);
                    });
                });
            });
            describe("with a struct argument", function () {
                it("Should succeed when expectations are met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitStruct(1, 2))
                            .to.emit(contract, "WithStructArg")
                            .withArgs([1, 2]);
                    });
                });
                it("Should fail when expectations are not met", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitStruct(1, 2))
                            .to.emit(contract, "WithStructArg")
                            .withArgs([3, 4])).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithStructArg" event: Error in the 1st argument assertion: Error in the 1st argument assertion: expected 1 to equal 3.');
                    });
                });
            });
            describe("with multiple arguments", function () {
                it("Should successfully match the arguments", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitTwoUints(1, 2))
                            .to.emit(contract, "WithTwoUintArgs")
                            .withArgs(1, 2);
                    });
                });
                it("Should fail when the first argument isn't matched", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                            .to.emit(contract, "WithTwoUintArgs")
                            .withArgs(2, 2)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Error in the 1st argument assertion: expected 1 to equal 2');
                    });
                });
                it("Should fail when the second argument isn't matched", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                            .to.emit(contract, "WithTwoUintArgs")
                            .withArgs(1, 1)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Error in the 2nd argument assertion: expected 2 to equal 1.');
                    });
                });
                it("Should fail when too many arguments are supplied", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                            .to.emit(contract, "WithTwoUintArgs")
                            .withArgs(1, 2, 3, 4)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Expected arguments array to have length 4, but it has 2');
                    });
                });
                it("Should fail when too few arguments are supplied", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                            .to.emit(contract, "WithTwoUintArgs")
                            .withArgs(1)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Expected arguments array to have length 1, but it has 2');
                    });
                });
                describe("Should handle argument predicates", function () {
                    it("Should pass when a predicate argument returns true", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitTwoUints(1, 2))
                                .to.emit(contract, "WithTwoUintArgs")
                                .withArgs(withArgs_1.anyValue, withArgs_1.anyUint);
                        });
                    });
                    it("Should fail when a predicate argument returns false", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                                .to.emit(contract, "WithTwoUintArgs")
                                .withArgs(1, () => false)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Error in the 2nd argument assertion: The predicate did not return true');
                        });
                    });
                    it("Should fail when a predicate argument throws an error", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUints(1, 2))
                                .to.emit(contract, "WithTwoUintArgs")
                                .withArgs(() => {
                                throw new Error("user-defined error");
                            }, "foo")).to.be.rejectedWith(Error, 'Error in "WithTwoUintArgs" event: Error in the 1st argument assertion: The predicate threw when called: user-defined error');
                        });
                    });
                    describe("with predicate anyUint", function () {
                        it("Should fail when the event argument is a string", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitString("a string"))
                                    .to.emit(contract, "WithStringArg")
                                    .withArgs(withArgs_1.anyUint)).to.be.rejectedWith(chai_1.AssertionError, "Error in \"WithStringArg\" event: Error in the 1st argument assertion: The predicate threw when called: anyUint expected its argument to be an integer, but its type was 'string'");
                            });
                        });
                        it("Should fail when the event argument is negative", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitInt(-1))
                                    .to.emit(contract, "WithIntArg")
                                    .withArgs(withArgs_1.anyUint)).to.be.rejectedWith(chai_1.AssertionError, 'Error in "WithIntArg" event: Error in the 1st argument assertion: The predicate threw when called: anyUint expected its argument to be an unsigned integer, but it was negative, with value -1');
                            });
                        });
                    });
                });
            });
        });
        describe("With one call that emits two separate events", function () {
            it("Should successfully catch each event independently", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string")).to.emit(contract, "WithUintArg");
                    yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string")).to.emit(contract, "WithStringArg");
                });
            });
            describe("When detecting two events from one call (chaining)", function () {
                it("Should succeed when both expected events are indeed emitted", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                            .to.emit(contract, "WithUintArg")
                            .and.to.emit(contract, "WithStringArg");
                    });
                });
                it("Should succeed when the expected event is emitted and the unexpected event is not", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitWithoutArgs())
                            .to.emit(contract, "WithoutArgs")
                            .and.not.to.emit(otherContract, "WithUintArg");
                    });
                });
                describe("When one of the expected events is emitted and the other is not", function () {
                    it("Should fail when the first expected event is emitted but the second is not", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUint(1))
                                .to.emit(contract, "WithUintArg")
                                .and.to.emit(contract, "WithStringArg")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithStringArg" to be emitted, but it wasn\'t');
                        });
                    });
                    it("Should fail when the second expected event is emitted but the first is not", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUint(1))
                                .to.emit(contract, "WithStringArg")
                                .and.to.emit(contract, "WithUintArg")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithStringArg" to be emitted, but it wasn\'t');
                        });
                    });
                });
                describe("When specifying .withArgs()", function () {
                    it("Should pass when expecting the correct args from the first event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(1)
                                .and.to.emit(contract, "WithStringArg");
                        });
                    });
                    it("Should pass when expecting the correct args from the second event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .and.to.emit(contract, "WithStringArg")
                                .withArgs("a string");
                        });
                    });
                    it("Should pass when expecting the correct args from both events", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(1)
                                .and.to.emit(contract, "WithStringArg")
                                .withArgs("a string");
                        });
                    });
                    it("Should fail when expecting the wrong argument value for the first event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(2)
                                .and.to.emit(contract, "WithStringArg")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArg" event: Error in the 1st argument assertion: expected 1 to equal 2.');
                        });
                    });
                    it("Should fail when expecting the wrong argument value for the second event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .and.to.emit(contract, "WithStringArg")
                                .withArgs("a different string")).to.be.eventually.rejectedWith(chai_1.AssertionError, "Error in \"WithStringArg\" event: Error in the 1st argument assertion: expected 'a string' to equal 'a different string'");
                        });
                    });
                    it("Should fail when expecting too many arguments from the first event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(1, 2)
                                .and.to.emit(contract, "WithStringArg")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithUintArg" event: Expected arguments array to have length 2, but it has 1');
                        });
                    });
                    it("Should fail when expecting too many arguments from the second event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintAndString(1, "a string"))
                                .to.emit(contract, "WithUintArg")
                                .and.to.emit(contract, "WithStringArg")
                                .withArgs("a different string", "yet another string")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithStringArg" event: Expected arguments array to have length 2, but it has 1');
                        });
                    });
                    it("Should fail when expecting too few arguments from the first event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUintsAndTwoStrings(1, 2, "a string", "another string"))
                                .to.emit(contract, "WithTwoUintArgs")
                                .withArgs(1)
                                .and.to.emit(contract, "WithTwoStringArgs")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoUintArgs" event: Expected arguments array to have length 1, but it has 2');
                        });
                    });
                    it("Should fail when expecting too few arguments from the second event", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitTwoUintsAndTwoStrings(1, 2, "a string", "another string"))
                                .to.emit(contract, "WithTwoUintArgs")
                                .and.to.emit(contract, "WithTwoStringArgs")
                                .withArgs("a string")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Error in "WithTwoStringArgs" event: Expected arguments array to have length 1, but it has 2');
                        });
                    });
                });
                describe("With a contract that emits the same event twice but with different arguments", function () {
                    it("Should pass when expectations are met", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)(contract.emitUintTwice(1, 2))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(1)
                                .and.to.emit(contract, "WithUintArg")
                                .withArgs(2);
                        });
                    });
                    it("Should fail when the first event's argument is not matched", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintTwice(1, 2))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(3)
                                .and.to.emit(contract, "WithUintArg")
                                .withArgs(2)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'The specified arguments ([ 3 ]) were not included in any of the 2 emitted "WithUintArg" events');
                        });
                    });
                    it("Should fail when the second event's argument is not matched", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintTwice(1, 2))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(1)
                                .and.to.emit(contract, "WithUintArg")
                                .withArgs(3)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'The specified arguments ([ 3 ]) were not included in any of the 2 emitted "WithUintArg" events');
                        });
                    });
                    it("Should fail when none of the emitted events match the given argument", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitUintTwice(1, 2))
                                .to.emit(contract, "WithUintArg")
                                .withArgs(3)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'The specified arguments ([ 3 ]) were not included in any of the 2 emitted "WithUintArg" events');
                        });
                    });
                });
            });
        });
        describe("When nested events are emitted", function () {
            describe("With the nested event emitted from the same contract", function () {
                it("Should pass when the expected event is emitted", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitNestedUintFromSameContract(1))
                            .to.emit(contract, "WithUintArg")
                            .withArgs(1);
                    });
                });
                it("Should fail when the expected event is not emitted", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitNestedUintFromSameContract(1)).to.emit(contract, "WithStringArg")).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithStringArg" to be emitted, but it wasn\'t');
                    });
                });
            });
            describe("With the nested event emitted from a different contract", function () {
                it("Should pass when the expected event is emitted", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)(contract.emitNestedUintFromAnotherContract(1))
                            .to.emit(otherContract, "WithUintArg")
                            .withArgs(1);
                    });
                });
                it("Should fail when the expected event is emitted but not by the contract that was passed", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(contract.emitNestedUintFromAnotherContract(1))
                            .to.emit(contract, "WithUintArg")
                            .withArgs(1)).to.be.eventually.rejectedWith(chai_1.AssertionError, 'Expected event "WithUintArg" to be emitted, but it wasn\'t');
                    });
                });
            });
        });
        it("With executed transaction", () => __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.emitWithoutArgs();
            yield (0, chai_1.expect)(tx).to.emit(contract, "WithoutArgs");
        }));
        it("With transaction hash", () => __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.emitWithoutArgs();
            yield (0, chai_1.expect)(tx.hash).to.emit(contract, "WithoutArgs");
        }));
        describe("When event is overloaded", () => {
            it("Should fail when the event name is ambiguous", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(overrideEventContract.emitSimpleEventWithUintArg(1n)).to.emit(overrideEventContract, "simpleEvent")).to.be.eventually.rejectedWith(chai_1.AssertionError, `ambiguous event description (i.e. matches "simpleEvent(uint256)", "simpleEvent()")`);
                });
            });
            it("Should pass when the event name is not ambiguous", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(overrideEventContract.emitSimpleEventWithUintArg(1n))
                        .to.emit(overrideEventContract, "simpleEvent(uint256)")
                        .withArgs(1);
                    yield (0, chai_1.expect)(overrideEventContract.emitSimpleEventWithoutArg()).to.emit(overrideEventContract, "simpleEvent()");
                });
            });
        });
    }
});
