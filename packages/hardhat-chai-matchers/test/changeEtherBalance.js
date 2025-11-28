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
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
require("../src/internal/add-chai-matchers");
const helpers_1 = require("./helpers");
describe("INTEGRATION: changeEtherBalance matcher", function () {
    describe("with the in-process hardhat network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        runTests();
    });
    // TODO re-enable this when
    // https://github.com/ethers-io/ethers.js/issues/4014 is fixed
    describe.skip("connected to a hardhat node", function () {
        (0, helpers_1.useEnvironmentWithNode)("hardhat-project");
        runTests();
    });
    function runTests() {
        let sender;
        let receiver;
        let contract;
        let txGasFees;
        let mockToken;
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const wallets = yield this.hre.ethers.getSigners();
                sender = wallets[0];
                receiver = wallets[1];
                contract = yield (yield this.hre.ethers.getContractFactory("ChangeEtherBalance")).deploy();
                txGasFees = 1 * 21000;
                yield this.hre.network.provider.send("hardhat_setNextBlockBaseFeePerGas", ["0x0"]);
                const MockToken = yield this.hre.ethers.getContractFactory("MockToken");
                mockToken = yield MockToken.deploy();
            });
        });
        describe("Transaction Callback (legacy tx)", () => {
            describe("Change balance, one account", () => {
                it("Should pass when expected balance change is passed as string and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-200");
                }));
                it("Should fail when block contains more than one transaction", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        // we set a gas limit to avoid using the whole block gas limit
                        yield sender.sendTransaction({
                            to: receiver.address,
                            value: 200,
                            gasLimit: 30000,
                        });
                        yield this.hre.network.provider.send("evm_setAutomine", [true]);
                        yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                            to: receiver.address,
                            value: 200,
                            gasLimit: 30000,
                        })).to.changeEtherBalance(sender, -200, { includeFee: true })).to.be.eventually.rejectedWith(Error, "Multiple transactions found in block");
                    });
                });
                it("Should pass when given an address as a string", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender.address, "-200");
                }));
                it("Should pass when given a native bigint", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200n);
                }));
                it("Should pass when given a predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, (diff) => diff === -200n);
                }));
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200);
                }));
                it("Should take into account transaction fee", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -(txGasFees + 200), {
                        includeFee: true,
                    });
                }));
                it("Should take into account transaction fee when given a predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, (diff) => diff === -(BigInt(txGasFees) + 200n), {
                        includeFee: true,
                    });
                }));
                it("Should ignore fee if receiver's wallet is being checked and includeFee was set", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200, { includeFee: true });
                }));
                it("Should take into account transaction fee by default", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200);
                }));
                it("Should pass on negative case when expected balance does not satisfy the predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalance(receiver, (diff) => diff === 300n);
                }));
                it("Should throw when fee was not calculated correctly", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200, { includeFee: true })).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -200 wei, but it changed by -${txGasFees + 200} wei`);
                }));
                it("Should throw when expected balance change value was different from an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-500")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -500 wei, but it changed by -200 wei`);
                }));
                it("Should throw when actual balance change value does not satisfy the predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, (diff) => diff === -500n)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance change of "${sender.address}" to satisfy the predicate, but it didn't (balance change: -200 wei)`);
                }));
                it("Should throw in negative case when expected balance change value was equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalance(sender, "-200")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" NOT to change by -200 wei, but it did`);
                }));
                it("Should throw in negative case when expected balance change value satisfies the predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalance(sender, (diff) => diff === -200n)).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance change of "${sender.address}" to NOT satisfy the predicate, but it did (balance change: -200 wei)`);
                }));
                it("Should pass when given zero value tx", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address, value: 0 })).to.changeEtherBalance(sender, 0);
                }));
                it("shouldn't run the transaction twice", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const receiverBalanceBefore = yield this.hre.ethers.provider.getBalance(receiver);
                        yield (0, chai_1.expect)(() => sender.sendTransaction({
                            to: receiver.address,
                            value: 200,
                        })).to.changeEtherBalance(sender, -200);
                        const receiverBalanceAfter = yield this.hre.ethers.provider.getBalance(receiver);
                        const receiverBalanceChange = receiverBalanceAfter - receiverBalanceBefore;
                        (0, chai_1.expect)(receiverBalanceChange).to.equal(200n);
                    });
                });
            });
            describe("Change balance, one contract", () => {
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => __awaiter(this, void 0, void 0, function* () {
                        return sender.sendTransaction({
                            to: contract,
                            value: 200,
                        });
                    })).to.changeEtherBalance(contract, 200);
                }));
                it("should pass when calling function that returns half the sent ether", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => __awaiter(this, void 0, void 0, function* () { return contract.returnHalf({ value: 200 }); })).to.changeEtherBalance(sender, -100);
                }));
            });
        });
        describe("Transaction Callback (1559 tx)", () => {
            describe("Change balance, one account", () => {
                it("Should pass when expected balance change is passed as string and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-200");
                }));
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200);
                }));
                it("Should take into account transaction fee", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -(txGasFees + 200), {
                        includeFee: true,
                    });
                }));
                it("Should ignore fee if receiver's wallet is being checked and includeFee was set", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200, { includeFee: true });
                }));
                it("Should take into account transaction fee by default", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200);
                }));
                it("Should throw when fee was not calculated correctly", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200, { includeFee: true })).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -200 wei, but it changed by -${txGasFees + 200} wei`);
                }));
                it("Should throw when expected balance change value was different from an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-500")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -500 wei, but it changed by -200 wei`);
                }));
                it("Should throw in negative case when expected balance change value was equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.not.changeEtherBalance(sender, "-200")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" NOT to change by -200 wei, but it did`);
                }));
            });
            describe("Change balance, one contract", () => {
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => __awaiter(this, void 0, void 0, function* () {
                        return sender.sendTransaction({
                            to: contract,
                            maxFeePerGas: 2,
                            maxPriorityFeePerGas: 1,
                            value: 200,
                        });
                    })).to.changeEtherBalance(contract, 200);
                }));
                it("Should take into account transaction fee", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const tx = {
                            to: contract,
                            maxFeePerGas: 2,
                            maxPriorityFeePerGas: 1,
                            value: 200,
                        };
                        const gas = yield this.hre.ethers.provider.estimateGas(tx);
                        yield (0, chai_1.expect)(() => sender.sendTransaction(tx)).to.changeEtherBalance(sender, -(gas + 200n), {
                            includeFee: true,
                        });
                    });
                });
                it("should pass when calling function that returns half the sent ether", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => __awaiter(this, void 0, void 0, function* () {
                        return contract.returnHalf({
                            value: 200,
                            maxFeePerGas: 2,
                            maxPriorityFeePerGas: 1,
                        });
                    })).to.changeEtherBalance(sender, -100);
                }));
            });
            it("shouldn't run the transaction twice", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const receiverBalanceBefore = yield this.hre.ethers.provider.getBalance(receiver);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 2,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalance(sender, -200);
                    const receiverBalanceAfter = yield this.hre.ethers.provider.getBalance(receiver);
                    const receiverBalanceChange = receiverBalanceAfter - receiverBalanceBefore;
                    (0, chai_1.expect)(receiverBalanceChange).to.equal(200n);
                });
            });
        });
        describe("Transaction Response", () => {
            describe("Change balance, one account", () => {
                it("Should pass when expected balance change is passed as string and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-200");
                }));
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200);
                }));
                it("Should throw when expected balance change value was different from an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-500")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -500 wei, but it changed by -200 wei`);
                }));
                it("Should throw in negative case when expected balance change value was equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalance(sender, "-200")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" NOT to change by -200 wei, but it did`);
                }));
            });
            describe("Change balance, one contract", () => {
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: contract,
                        value: 200,
                    })).to.changeEtherBalance(contract, 200);
                }));
            });
        });
        describe("Transaction Promise", () => {
            describe("Change balance, one account", () => {
                it("Should pass when expected balance change is passed as string and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-200");
                }));
                it("Should pass when expected balance change is passed as int and is equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(receiver, 200);
                }));
                it("Should throw when expected balance change value was different from an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalance(sender, "-500")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" to change by -500 wei, but it changed by -200 wei`);
                }));
                it("Should throw in negative case when expected balance change value was equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalance(sender, "-200")).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of "${sender.address}" NOT to change by -200 wei, but it did`);
                }));
                it("Should throw if chained to another non-chainable method", () => {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    }))
                        .to.changeTokenBalance(mockToken, receiver, 50)
                        .and.to.changeEtherBalance(sender, "-200")).to.throw(/The matcher 'changeEtherBalance' cannot be chained after 'changeTokenBalance'./);
                });
            });
        });
        describe("stack traces", function () {
            // smoke test for stack traces
            it("includes test file", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, chai_1.expect)(() => sender.sendTransaction({
                            to: receiver.address,
                            value: 200,
                        })).to.changeEtherBalance(sender, -100);
                    }
                    catch (e) {
                        (0, chai_1.expect)(util_1.default.inspect(e)).to.include(path_1.default.join("test", "changeEtherBalance.ts"));
                        return;
                    }
                    chai_1.expect.fail("Expected an exception but none was thrown");
                });
            });
        });
    }
});
