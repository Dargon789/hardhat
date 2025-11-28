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
const environment_1 = require("./environment");
const example_contracts_1 = require("./example-contracts");
const helpers_1 = require("./helpers");
describe("hardhat ethers signer", function () {
    describe("minimal project", function () {
        (0, environment_1.usePersistentEnvironment)("minimal-project");
        it("has an address field that matches the address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                chai_1.assert.isString(signer.address);
                chai_1.assert.strictEqual(signer.address, yield signer.getAddress());
            });
        });
        it("can be connected to a provider", function () {
            return __awaiter(this, void 0, void 0, function* () {
                if (process.env.INFURA_URL === undefined ||
                    process.env.INFURA_URL === "") {
                    this.skip();
                }
                const signerConnectedToHardhat = yield this.env.ethers.provider.getSigner(0);
                const nonceInHardhat = yield signerConnectedToHardhat.getNonce();
                const mainnetProvider = new this.env.ethers.JsonRpcProvider(process.env.INFURA_URL);
                const signerConnectedToMainnet = signerConnectedToHardhat.connect(mainnetProvider);
                const nonceInMainnet = yield signerConnectedToMainnet.getNonce();
                chai_1.assert.strictEqual(nonceInHardhat, 0);
                chai_1.assert.isAbove(nonceInMainnet, 0);
            });
        });
        it("can get the nonce of the signer", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                chai_1.assert.strictEqual(yield signer.getNonce(), 0);
                yield signer.sendTransaction({ to: signer });
                chai_1.assert.strictEqual(yield signer.getNonce(), 1);
            });
        });
        it("should populate a call/tx", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const populatedCall = yield signer.populateCall({
                    to: signer,
                });
                chai_1.assert.strictEqual(populatedCall.from, signer.address);
                // populateTransaction does exactly the same
                const populatedTx = yield signer.populateCall({
                    to: signer,
                });
                chai_1.assert.strictEqual(populatedTx.from, signer.address);
            });
        });
        describe("estimateGas", function () {
            it("should estimate gas for a value transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const gasEstimation = yield signer.estimateGas({
                        to: signer,
                    });
                    chai_1.assert.strictEqual(Number(gasEstimation), 21001);
                });
            });
            it("should estimate gas for a contract call", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                    const contract = yield factory.deploy();
                    const gasEstimation = yield signer.estimateGas({
                        to: contract,
                        data: "0x371303c0", // inc()
                    });
                    (0, helpers_1.assertWithin)(Number(gasEstimation), 65000, 70000);
                });
            });
        });
        describe("call", function () {
            it("should make a contract call", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                    const contract = yield factory.deploy();
                    yield contract.inc();
                    const result = yield signer.call({
                        to: contract,
                        data: "0x3fa4f245", // value()
                    });
                    chai_1.assert.strictEqual(result, "0x0000000000000000000000000000000000000000000000000000000000000001");
                });
            });
        });
        describe("sendTransaction", function () {
            it("should send a transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const sender = yield this.env.ethers.provider.getSigner(0);
                    const receiver = yield this.env.ethers.provider.getSigner(1);
                    const balanceBefore = yield this.env.ethers.provider.getBalance(receiver);
                    yield sender.sendTransaction({
                        to: receiver,
                        value: this.env.ethers.parseEther("1"),
                    });
                    const balanceAfter = yield this.env.ethers.provider.getBalance(receiver);
                    const balanceDifference = balanceAfter - balanceBefore;
                    chai_1.assert.strictEqual(balanceDifference, 10n ** 18n);
                });
            });
        });
        describe("signMessage", function () {
            it("should sign a message", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const signedMessage = yield signer.signMessage("hello");
                    chai_1.assert.strictEqual(signedMessage, "0xf16ea9a3478698f695fd1401bfe27e9e4a7e8e3da94aa72b021125e31fa899cc573c48ea3fe1d4ab61a9db10c19032026e3ed2dbccba5a178235ac27f94504311c");
                });
            });
        });
        describe("signTypedData", function () {
            const types = {
                Person: [
                    { name: "name", type: "string" },
                    { name: "wallet", type: "address" },
                ],
                Mail: [
                    { name: "from", type: "Person" },
                    { name: "to", type: "Person" },
                    { name: "contents", type: "string" },
                ],
            };
            const data = {
                from: {
                    name: "John",
                    wallet: "0x0000000000000000000000000000000000000001",
                },
                to: {
                    name: "Mark",
                    wallet: "0x0000000000000000000000000000000000000002",
                },
                contents: "something",
            };
            it("should sign data", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const signedData = yield signer.signTypedData({
                        chainId: 31337,
                    }, types, data);
                    chai_1.assert.strictEqual(signedData, "0xbea20009786d1f69327eea384d6b8082f2d35b41212d1acbbd490516f0ae776748e93d4603df49033f89ce6a97afba4523d753d35e962ea431cc706642ad713f1b");
                });
            });
            it("should use the chain id", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const signedData = yield signer.signTypedData({
                        chainId: 10101,
                    }, types, data);
                    // we get a different value from the different test because we changed the
                    // chainId
                    chai_1.assert.strictEqual(signedData, "0x8a6a6aeca0cf03dbffd6d7b15207c0dcf5c7daa432e510b5de1ebecff8de6cd457e2eaa9fe96c11474a7344584f4b128c773153836142647c426b5f2c3eb6c701b");
                });
            });
        });
        describe("default gas limit", function () {
            it("should use the block gas limit for the in-process hardhat network", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const tx = yield signer.sendTransaction({ to: signer });
                    if (!("blockGasLimit" in this.env.network.config)) {
                        chai_1.assert.fail("test should be run in the hardhat network");
                    }
                    const blockGasLimit = this.env.network.config.blockGasLimit;
                    chai_1.assert.strictEqual(Number(tx.gasLimit), blockGasLimit);
                });
            });
            it("should use custom gas limit, if provided", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    const tx = yield signer.sendTransaction({
                        to: signer,
                        gasLimit: 30000,
                    });
                    chai_1.assert.strictEqual(tx.gasLimit, 30000n);
                });
            });
        });
        describe("nonce management", function () {
            it("should send a second transaction with the right nonce if the first one wasn't mined", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signer = yield this.env.ethers.provider.getSigner(0);
                    yield this.env.ethers.provider.send("evm_setAutomine", [false]);
                    const tx1 = yield signer.sendTransaction({
                        to: signer,
                        gasLimit: 30000,
                    });
                    const tx2 = yield signer.sendTransaction({
                        to: signer,
                        gasLimit: 30000,
                    });
                    chai_1.assert.notEqual(tx1.nonce, tx2.nonce);
                    chai_1.assert.strictEqual(tx2.nonce, tx1.nonce + 1);
                    yield this.env.ethers.provider.send("hardhat_mine", []);
                    const latestBlock = yield this.env.ethers.provider.getBlock("latest");
                    (0, helpers_1.assertIsNotNull)(latestBlock);
                    chai_1.assert.lengthOf(latestBlock.transactions, 2);
                });
            });
        });
    });
    describe('project with gas set to "auto"', function () {
        (0, environment_1.usePersistentEnvironment)("hardhat-project-with-gas-auto");
        it("should estimate the gas of the transaction", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({ to: signer });
                chai_1.assert.strictEqual(tx.gasLimit, 21001n);
            });
        });
        it("should use custom gas limit, if provided", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({
                    to: signer,
                    gasLimit: 30000,
                });
                chai_1.assert.strictEqual(tx.gasLimit, 30000n);
            });
        });
    });
});
