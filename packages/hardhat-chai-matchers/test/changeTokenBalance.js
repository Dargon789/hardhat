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
const assert_1 = __importDefault(require("assert"));
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const util_1 = __importDefault(require("util"));
require("../src/internal/add-chai-matchers");
const changeTokenBalance_1 = require("../src/internal/changeTokenBalance");
const constants_1 = require("../src/internal/constants");
const helpers_1 = require("./helpers");
describe("INTEGRATION: changeTokenBalance and changeTokenBalances matchers", function () {
    describe("with the in-process hardhat network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        runTests();
    });
    describe("connected to a hardhat node", function () {
        (0, helpers_1.useEnvironmentWithNode)("hardhat-project");
        runTests();
    });
    afterEach(function () {
        (0, changeTokenBalance_1.clearTokenDescriptionsCache)();
    });
    function runTests() {
        let sender;
        let receiver;
        let mockToken;
        let matchers;
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const wallets = yield this.hre.ethers.getSigners();
                sender = wallets[0];
                receiver = wallets[1];
                const MockToken = yield this.hre.ethers.getContractFactory("MockToken");
                mockToken = yield MockToken.deploy();
                const Matchers = yield this.hre.ethers.getContractFactory("Matchers");
                matchers = yield Matchers.deploy();
            });
        });
        describe("transaction that doesn't move tokens", () => {
            it("with a promise of a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const transactionResponse = sender.sendTransaction({
                        to: receiver.address,
                    });
                    yield runAllAsserts(transactionResponse, mockToken, [sender, receiver], [0, 0]);
                });
            });
            it("with a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield runAllAsserts(yield sender.sendTransaction({
                        to: receiver.address,
                    }), mockToken, [sender, receiver], [0, 0]);
                });
            });
            it("with a function that returns a promise of a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield runAllAsserts(() => sender.sendTransaction({ to: receiver.address }), mockToken, [sender, receiver], [0, 0]);
                });
            });
            it("with a function that returns a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const txResponse = yield sender.sendTransaction({
                        to: receiver.address,
                    });
                    yield runAllAsserts(() => txResponse, mockToken, [sender, receiver], [0, 0]);
                });
            });
            it("accepts addresses", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalance(mockToken, sender.address, 0);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address })).to.changeTokenBalances(mockToken, [sender.address, receiver.address], [0, 0]);
                    // mixing signers and addresses
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address })).to.changeTokenBalances(mockToken, [sender.address, receiver], [0, 0]);
                });
            });
            it("negated", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalance(mockToken, sender, 1);
                    yield (0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalance(mockToken, sender, (diff) => diff > 0n);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalances(mockToken, [sender, receiver], [0, 1]);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalances(mockToken, [sender, receiver], [1, 0]);
                    yield (0, chai_1.expect)(() => sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalances(mockToken, [sender, receiver], [1, 1]);
                });
            });
            describe("assertion failures", function () {
                it("doesn't change balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalance(mockToken, sender, 1)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to change by 1, but it changed by 0/);
                    });
                });
                it("change balance doesn't satisfies the predicate", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalance(mockToken, sender, (diff) => diff > 0n)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to satisfy the predicate, but it didn't \(token balance change: 0 wei\)/);
                    });
                });
                it("changes balance in the way it was not expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalance(mockToken, sender, 0)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" NOT to change by 0, but it did/);
                    });
                });
                it("changes balance doesn't have to satisfy the predicate, but it did", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalance(mockToken, sender, (diff) => diff < 1n)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to NOT satisfy the predicate, but it did \(token balance change: 0 wei\)/);
                    });
                });
                it("the first account doesn't change its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalances(mockToken, [sender, receiver], [1, 0])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("the second account doesn't change its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalances(mockToken, [sender, receiver], [0, 1])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("neither account changes its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.changeTokenBalances(mockToken, [sender, receiver], [1, 1])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("accounts change their balance in the way it was not expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(sender.sendTransaction({ to: receiver.address })).to.not.changeTokenBalances(mockToken, [sender, receiver], [0, 0])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
            });
        });
        describe("Transaction Callback", function () {
            it("Should pass when given predicate", () => __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(() => mockToken.transfer(receiver.address, 75)).to.changeTokenBalances(mockToken, [sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -75n && receiverDiff === 75n);
            }));
            it("Should fail when the predicate returns false", () => __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 75)).to.changeTokenBalances(mockToken, [sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -74n && receiverDiff === 75n)).to.be.eventually.rejectedWith(chai_1.AssertionError, "Expected the balance changes of MCK to satisfy the predicate, but they didn't");
            }));
            it("Should fail when the predicate returns true and the assertion is negated", () => __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 75)).to.not.changeTokenBalances(mockToken, [sender, receiver], ([senderDiff, receiverDiff]) => senderDiff === -75n && receiverDiff === 75n)).to.be.eventually.rejectedWith(chai_1.AssertionError, "Expected the balance changes of MCK to NOT satisfy the predicate, but they did");
            }));
        });
        describe("transaction that transfers some tokens", function () {
            it("with a promise of a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield runAllAsserts(mockToken.transfer(receiver.address, 50), mockToken, [sender, receiver], [-50, 50]);
                    yield runAllAsserts(mockToken.transfer(receiver.address, 100), mockToken, [sender, receiver], [-100, 100]);
                });
            });
            it("with a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield runAllAsserts(yield mockToken.transfer(receiver.address, 150), mockToken, [sender, receiver], [-150, 150]);
                });
            });
            it("with a function that returns a promise of a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield runAllAsserts(() => mockToken.transfer(receiver.address, 200), mockToken, [sender, receiver], [-200, 200]);
                });
            });
            it("with a function that returns a TxResponse", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const txResponse = yield mockToken.transfer(receiver.address, 300);
                    yield runAllAsserts(() => txResponse, mockToken, [sender, receiver], [-300, 300]);
                });
            });
            it("changeTokenBalance shouldn't run the transaction twice", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const receiverBalanceBefore = yield mockToken.balanceOf(receiver.address);
                    yield (0, chai_1.expect)(() => mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(mockToken, receiver, 50);
                    const receiverBalanceChange = (yield mockToken.balanceOf(receiver.address)) - receiverBalanceBefore;
                    (0, chai_1.expect)(receiverBalanceChange).to.equal(50n);
                });
            });
            it("changeTokenBalances shouldn't run the transaction twice", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const receiverBalanceBefore = yield mockToken.balanceOf(receiver.address);
                    yield (0, chai_1.expect)(() => mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-50, 50]);
                    const receiverBalanceChange = (yield mockToken.balanceOf(receiver.address)) - receiverBalanceBefore;
                    (0, chai_1.expect)(receiverBalanceChange).to.equal(50n);
                });
            });
            it("negated", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalance(mockToken, sender, 0);
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalance(mockToken, sender, 1);
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalances(mockToken, [sender, receiver], [0, 0]);
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalances(mockToken, [sender, receiver], [-50, 0]);
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalances(mockToken, [sender, receiver], [0, 50]);
                });
            });
            describe("assertion failures", function () {
                it("doesn't change balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(mockToken, receiver, 500)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to change by 500, but it changed by 50/);
                    });
                });
                it("change balance doesn't satisfies the predicate", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(mockToken, receiver, (diff) => diff === 500n)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to satisfy the predicate, but it didn't \(token balance change: 50 wei\)/);
                    });
                });
                it("changes balance in the way it was not expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalance(mockToken, receiver, 50)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" NOT to change by 50, but it did/);
                    });
                });
                it("changes balance doesn't have to satisfy the predicate, but it did", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalance(mockToken, receiver, (diff) => diff === 50n)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MCK tokens for "0x\w{40}" to NOT satisfy the predicate, but it did \(token balance change: 50 wei\)/);
                    });
                });
                it("the first account doesn't change its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-100, 50])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("the second account doesn't change its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-50, 100])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("neither account changes its balance as expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [0, 0])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("accounts change their balance in the way it was not expected", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.not.changeTokenBalances(mockToken, [sender, receiver], [-50, 50])).to.be.rejectedWith(chai_1.AssertionError);
                    });
                });
                it("uses the token name if the contract doesn't have a symbol", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const TokenWithOnlyName = yield this.hre.ethers.getContractFactory("TokenWithOnlyName");
                        const tokenWithOnlyName = yield TokenWithOnlyName.deploy();
                        yield (0, chai_1.expect)((0, chai_1.expect)(tokenWithOnlyName.transfer(receiver.address, 50)).to.changeTokenBalance(tokenWithOnlyName, receiver, 500)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MockToken tokens for "0x\w{40}" to change by 500, but it changed by 50/);
                        yield (0, chai_1.expect)((0, chai_1.expect)(tokenWithOnlyName.transfer(receiver.address, 50)).to.not.changeTokenBalance(tokenWithOnlyName, receiver, 50)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of MockToken tokens for "0x\w{40}" NOT to change by 50, but it did/);
                    });
                });
                it("uses the contract address if the contract doesn't have name or symbol", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const TokenWithoutNameNorSymbol = yield this.hre.ethers.getContractFactory("TokenWithoutNameNorSymbol");
                        const tokenWithoutNameNorSymbol = yield TokenWithoutNameNorSymbol.deploy();
                        yield (0, chai_1.expect)((0, chai_1.expect)(tokenWithoutNameNorSymbol.transfer(receiver.address, 50)).to.changeTokenBalance(tokenWithoutNameNorSymbol, receiver, 500)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of <token at 0x\w{40}> tokens for "0x\w{40}" to change by 500, but it changed by 50/);
                        yield (0, chai_1.expect)((0, chai_1.expect)(tokenWithoutNameNorSymbol.transfer(receiver.address, 50)).to.not.changeTokenBalance(tokenWithoutNameNorSymbol, receiver, 50)).to.be.rejectedWith(chai_1.AssertionError, /Expected the balance of <token at 0x\w{40}> tokens for "0x\w{40}" NOT to change by 50, but it did/);
                    });
                });
                it("changeTokenBalance: Should throw if chained to another non-chainable method", () => {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50))
                        .to.emit(mockToken, "SomeEvent")
                        .and.to.changeTokenBalance(mockToken, receiver, 50)).to.throw(/The matcher 'changeTokenBalance' cannot be chained after 'emit'./);
                });
                it("changeTokenBalances: should throw if chained to another non-chainable method", () => {
                    (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.be.reverted.and.to.changeTokenBalances(mockToken, [sender, receiver], [-50, 100])).to.throw(/The matcher 'changeTokenBalances' cannot be chained after 'reverted'./);
                });
            });
        });
        describe("validation errors", function () {
            describe(constants_1.CHANGE_TOKEN_BALANCE_MATCHER, function () {
                it("token is not specified", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50))
                            .to // @ts-expect-error
                            .changeTokenBalance(receiver, 50)).to.throw(Error, "The first argument of changeTokenBalance must be the contract instance of the token");
                        // if an address is used
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50))
                            .to // @ts-expect-error
                            .changeTokenBalance(receiver.address, 50)).to.throw(Error, "The first argument of changeTokenBalance must be the contract instance of the token");
                    });
                });
                it("contract is not a token", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const NotAToken = yield this.hre.ethers.getContractFactory("NotAToken");
                        const notAToken = yield NotAToken.deploy();
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(notAToken, sender, -50)).to.throw(Error, "The given contract instance is not an ERC20 token");
                    });
                });
                it("tx is not the only one in the block", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        // we set a gas limit to avoid using the whole block gas limit
                        yield sender.sendTransaction({
                            to: receiver.address,
                            gasLimit: 30000,
                        });
                        yield this.hre.network.provider.send("evm_setAutomine", [true]);
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50, { gasLimit: 100000 })).to.changeTokenBalance(mockToken, sender, -50)).to.be.rejectedWith(Error, "Multiple transactions found in block");
                    });
                });
                it("tx reverts", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 0)).to.changeTokenBalance(mockToken, sender, -50)).to.be.rejectedWith(Error, 
                        // check that the error message includes the revert reason
                        "Transferred value is zero");
                    });
                });
            });
            describe(constants_1.CHANGE_TOKEN_BALANCES_MATCHER, function () {
                it("token is not specified", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50))
                            .to // @ts-expect-error
                            .changeTokenBalances([sender, receiver], [-50, 50])).to.throw(Error, "The first argument of changeTokenBalances must be the contract instance of the token");
                    });
                });
                it("contract is not a token", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const NotAToken = yield this.hre.ethers.getContractFactory("NotAToken");
                        const notAToken = yield NotAToken.deploy();
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(notAToken, [sender, receiver], [-50, 50])).to.throw(Error, "The given contract instance is not an ERC20 token");
                    });
                });
                it("arrays have different length", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender], [-50, 50])).to.throw(Error, "The number of accounts (1) is different than the number of expected balance changes (2)");
                        (0, chai_1.expect)(() => (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-50])).to.throw(Error, "The number of accounts (2) is different than the number of expected balance changes (1)");
                    });
                });
                it("arrays have different length, subject is a rejected promise", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(matchers.revertsWithoutReason()).to.changeTokenBalances(mockToken, [sender], [-50, 50])).to.throw(Error, "The number of accounts (1) is different than the number of expected balance changes (2)");
                    });
                });
                it("tx is not the only one in the block", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        // we set a gas limit to avoid using the whole block gas limit
                        yield sender.sendTransaction({
                            to: receiver.address,
                            gasLimit: 30000,
                        });
                        yield this.hre.network.provider.send("evm_setAutomine", [true]);
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 50, { gasLimit: 100000 })).to.changeTokenBalances(mockToken, [sender, receiver], [-50, 50])).to.be.rejectedWith(Error, "Multiple transactions found in block");
                    });
                });
                it("tx reverts", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield (0, chai_1.expect)((0, chai_1.expect)(mockToken.transfer(receiver.address, 0)).to.changeTokenBalances(mockToken, [sender, receiver], [-50, 50])).to.be.rejectedWith(Error, 
                        // check that the error message includes the revert reason
                        "Transferred value is zero");
                    });
                });
            });
        });
        describe("accepted number types", function () {
            it("native bigints are accepted", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(mockToken, sender, -50n);
                    yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-50n, 50n]);
                });
            });
        });
        // smoke tests for stack traces
        describe("stack traces", function () {
            describe(constants_1.CHANGE_TOKEN_BALANCE_MATCHER, function () {
                it("includes test file", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        let hasProperStackTrace = false;
                        try {
                            yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalance(mockToken, sender, -100);
                        }
                        catch (e) {
                            hasProperStackTrace = util_1.default
                                .inspect(e)
                                .includes(path_1.default.join("test", "changeTokenBalance.ts"));
                        }
                        (0, chai_1.expect)(hasProperStackTrace).to.equal(true);
                    });
                });
            });
            describe(constants_1.CHANGE_TOKEN_BALANCES_MATCHER, function () {
                it("includes test file", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        try {
                            yield (0, chai_1.expect)(mockToken.transfer(receiver.address, 50)).to.changeTokenBalances(mockToken, [sender, receiver], [-100, 100]);
                        }
                        catch (e) {
                            (0, chai_1.expect)(util_1.default.inspect(e)).to.include(path_1.default.join("test", "changeTokenBalance.ts"));
                            return;
                        }
                        chai_1.expect.fail("Expected an exception but none was thrown");
                    });
                });
            });
        });
    }
});
function zip(a, b) {
    (0, assert_1.default)(a.length === b.length);
    return a.map((x, i) => [x, b[i]]);
}
/**
 * Given an expression `expr`, a token, and a pair of arrays, check that
 * `changeTokenBalance` and `changeTokenBalances` behave correctly in different
 * scenarios.
 */
function runAllAsserts(expr, token, accounts, balances) {
    return __awaiter(this, void 0, void 0, function* () {
        // changeTokenBalances works for the given arrays
        yield (0, chai_1.expect)(expr).to.changeTokenBalances(token, accounts, balances);
        // changeTokenBalances works for empty arrays
        yield (0, chai_1.expect)(expr).to.changeTokenBalances(token, [], []);
        // for each given pair of account and balance, check that changeTokenBalance
        // works correctly
        for (const [account, balance] of zip(accounts, balances)) {
            yield (0, chai_1.expect)(expr).to.changeTokenBalance(token, account, balance);
        }
    });
}
