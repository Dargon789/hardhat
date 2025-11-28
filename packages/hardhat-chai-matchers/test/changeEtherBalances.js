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
describe("INTEGRATION: changeEtherBalances matcher", function () {
    describe("with the in-process hardhat network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        runTests();
    });
    describe("connected to a hardhat node", function () {
        process.env.CHAIN_ID = "12345";
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
        describe("Transaction Callback", () => {
            describe("Change balances, one account, one contract", () => {
                it("Should pass when all expected balance changes are equal to actual values", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: contract,
                        value: 200,
                    })).to.changeEtherBalances([sender, contract], [-200, 200]);
                }));
            });
            describe("Change balances, contract forwards ether sent", () => {
                it("Should pass when contract function forwards all tx ether", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => contract.transferTo(receiver.address, { value: 200 })).to.changeEtherBalances([sender, contract, receiver], [-200, 0, 200]);
                }));
            });
            describe("Change balance, multiple accounts", () => {
                it("Should pass when all expected balance changes are equal to actual values", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], ["-200", 200]);
                }));
                it("Should pass when given addresses as strings", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender.address, receiver.address], ["-200", 200]);
                }));
                it("Should pass when given native BigInt", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-200n, 200n]);
                }));
                it("Should pass when given a predicate", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -200n && receiverDiff === 200n);
                }));
                it("Should fail when the predicate returns false", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -201n && receiverDiff === 200n)).to.be.eventually.rejectedWith(chai_1.AssertionError, "Expected the balance changes of the accounts to satisfy the predicate, but they didn't");
                }));
                it("Should fail when the predicate returns true and the assertion is negated", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -200n && receiverDiff === 200n)).to.be.eventually.rejectedWith(chai_1.AssertionError, "Expected the balance changes of the accounts to NOT satisfy the predicate, but they did");
                }));
                it("Should take into account transaction fee (legacy tx)", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver, contract], [-(txGasFees + 200), 200, 0], { includeFee: true });
                }));
                it("Should take into account transaction fee (1559 tx)", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        maxFeePerGas: 1,
                        maxPriorityFeePerGas: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver, contract], [-(txGasFees + 200), 200, 0], { includeFee: true });
                }));
                it("Should pass when given a single address", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address, value: 200 })).to.changeEtherBalances([sender], [-200]);
                }));
                it("Should pass when negated and numbers don't match", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-(txGasFees + 201), 200]);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-200, 201], {
                        includeFee: true,
                    });
                }));
                it("Should throw when expected balance change value was different from an actual for any wallet", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-200, 201])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${receiver.address} (the 2nd address in the list) to change by 201 wei, but it changed by 200 wei`);
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-201, 200])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${sender.address} (the 1st address in the list) to change by -201 wei, but it changed by -200 wei`);
                }));
                it("Should throw in negative case when expected balance changes value were equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-200, 200])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${sender.address} (the 1st address in the list) NOT to change by -200 wei`);
                }));
                it("arrays have different length", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(sender.sendTransaction({
                            to: receiver.address,
                            gasPrice: 1,
                            value: 200,
                        })).to.changeEtherBalances([sender], ["-200", 200])).to.throw(Error, "The number of accounts (1) is different than the number of expected balance changes (2)");
                        (0, chai_1.expect)(() => (0, chai_1.expect)(sender.sendTransaction({
                            to: receiver.address,
                            gasPrice: 1,
                            value: 200,
                        })).to.changeEtherBalances([sender, receiver], ["-200"])).to.throw(Error, "The number of accounts (2) is different than the number of expected balance changes (1)");
                    });
                });
            });
            it("shouldn't run the transaction twice", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const receiverBalanceBefore = yield this.hre.ethers.provider.getBalance(receiver);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-200, 200]);
                    const receiverBalanceAfter = yield this.hre.ethers.provider.getBalance(receiver);
                    const receiverBalanceChange = receiverBalanceAfter - receiverBalanceBefore;
                    (0, chai_1.expect)(receiverBalanceChange).to.equal(200n);
                });
            });
        });
        describe("Transaction Response", () => {
            describe("Change balances, one account, one contract", () => {
                it("Should pass when all expected balance changes are equal to actual values", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: contract,
                        value: 200,
                    })).to.changeEtherBalances([sender, contract], [-200, 200]);
                }));
            });
            it("Should throw if chained to another non-chainable method", () => {
                (0, chai_1.expect)(() => (0, chai_1.expect)(sender.sendTransaction({
                    to: contract,
                    value: 200,
                }))
                    .to.changeTokenBalances(mockToken, [sender, receiver], [-50, 100])
                    .and.to.changeEtherBalances([sender, contract], [-200, 200])).to.throw(/The matcher 'changeEtherBalances' cannot be chained after 'changeTokenBalances'./);
            });
            describe("Change balance, multiple accounts", () => {
                it("Should pass when all expected balance changes are equal to actual values", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [(-(txGasFees + 200)).toString(), 200], { includeFee: true });
                }));
                it("Should take into account transaction fee", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver, contract], [-(txGasFees + 200), 200, 0], { includeFee: true });
                }));
                it("Should pass when negated and numbers don't match", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-201, 200]);
                    yield (0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-200, 201]);
                }));
                it("Should throw when fee was not calculated correctly", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        gasPrice: 1,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-200, 200], {
                        includeFee: true,
                    })).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${sender.address} (the 1st address in the list) to change by -200 wei, but it changed by -${txGasFees + 200} wei`);
                }));
                it("Should throw when expected balance change value was different from an actual for any wallet", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-200, 201])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${receiver.address} (the 2nd address in the list) to change by 201 wei, but it changed by 200 wei`);
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.changeEtherBalances([sender, receiver], [-201, 200])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${sender.address} (the 1st address in the list) to change by -201 wei, but it changed by -200 wei`);
                }));
                it("Should throw in negative case when expected balance changes value were equal to an actual", () => __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)((0, chai_1.expect)(yield sender.sendTransaction({
                        to: receiver.address,
                        value: 200,
                    })).to.not.changeEtherBalances([sender, receiver], [-200, 200])).to.be.eventually.rejectedWith(chai_1.AssertionError, `Expected the ether balance of ${sender.address} (the 1st address in the list) NOT to change by -200`);
                }));
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
                        })).to.changeEtherBalances([sender, receiver], [-100, 100]);
                    }
                    catch (e) {
                        (0, chai_1.expect)(util_1.default.inspect(e)).to.include(path_1.default.join("test", "changeEtherBalances.ts"));
                        return;
                    }
                    chai_1.expect.fail("Expected an exception but none was thrown");
                });
            });
        });
    }
});
