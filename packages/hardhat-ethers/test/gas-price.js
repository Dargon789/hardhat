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
const environment_1 = require("./environment");
(0, chai_1.use)(chai_as_promised_1.default);
describe("gas price overrides", function () {
    describe("in-process hardhat network", function () {
        (0, environment_1.useEnvironment)("hardhat-project", "hardhat");
        runTests();
    });
    describe("hardhat node", function () {
        (0, environment_1.useEnvironment)("hardhat-project", "localhost");
        runTests();
    });
});
function runTests() {
    describe("plain transactions", function () {
        it("should use the given gas price if specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                const tx = yield signer.sendTransaction({
                    to: signer,
                    gasPrice: this.env.ethers.parseUnits("10", "gwei"),
                });
                const receipt = yield tx.wait();
                chai_1.assert.strictEqual(tx.gasPrice, 10n * 10n ** 9n);
                chai_1.assert.strictEqual(receipt === null || receipt === void 0 ? void 0 : receipt.gasPrice, 10n * 10n ** 9n);
            });
        });
        it("should use EIP-1559 values if maxFeePerGas and maxPriorityFeePerGas are specified, maxFeePerGas = baseFeePerGas", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                const baseFeePerGas = this.env.ethers.parseUnits("10", "gwei");
                const maxFeePerGas = baseFeePerGas;
                const maxPriorityFeePerGas = this.env.ethers.parseUnits("1", "gwei");
                yield this.env.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [`0x${baseFeePerGas.toString(16)}`]);
                const tx = yield signer.sendTransaction({
                    to: signer,
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                });
                const receipt = yield tx.wait();
                chai_1.assert.strictEqual(tx.maxFeePerGas, maxFeePerGas);
                chai_1.assert.strictEqual(tx.maxPriorityFeePerGas, maxPriorityFeePerGas);
                chai_1.assert.strictEqual(receipt === null || receipt === void 0 ? void 0 : receipt.gasPrice, maxFeePerGas);
            });
        });
        it("should use EIP-1559 values if maxFeePerGas and maxPriorityFeePerGas are specified, maxFeePerGas > baseFeePerGas", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                const baseFeePerGas = this.env.ethers.parseUnits("5", "gwei");
                const maxFeePerGas = this.env.ethers.parseUnits("10", "gwei");
                const maxPriorityFeePerGas = this.env.ethers.parseUnits("1", "gwei");
                yield this.env.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [`0x${baseFeePerGas.toString(16)}`]);
                const tx = yield signer.sendTransaction({
                    to: signer,
                    maxFeePerGas,
                    maxPriorityFeePerGas,
                });
                const receipt = yield tx.wait();
                chai_1.assert.strictEqual(tx.maxFeePerGas, maxFeePerGas);
                chai_1.assert.strictEqual(tx.maxPriorityFeePerGas, maxPriorityFeePerGas);
                chai_1.assert.strictEqual(receipt === null || receipt === void 0 ? void 0 : receipt.gasPrice, baseFeePerGas + maxPriorityFeePerGas);
            });
        });
        it("should use a default gas price if no value is specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                // we don't run any assertions here because the strategy
                // used to set the default gas prices might change; we
                // just check that the transaction is mined correctly
                const tx = yield signer.sendTransaction({
                    to: signer,
                });
                yield tx.wait();
            });
        });
        it("should use a default value for maxPriorityFeePerGas if maxFeePerGas is the only value specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                const baseFeePerGas = this.env.ethers.parseUnits("5", "gwei");
                const maxFeePerGas = this.env.ethers.parseUnits("10", "gwei");
                // make sure that the max fee is enough
                yield this.env.network.provider.send("hardhat_setNextBlockBaseFeePerGas", [`0x${baseFeePerGas.toString(16)}`]);
                const tx = yield signer.sendTransaction({
                    to: signer,
                    maxFeePerGas,
                });
                // we just check that the EIP-1559 values are set, because the
                // strategy to select a default priority fee might change
                chai_1.assert.exists(tx.maxFeePerGas);
                chai_1.assert.exists(tx.maxPriorityFeePerGas);
            });
        });
        it("should use a default maxFeePerGas if only maxPriorityFeePerGas is specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                const maxPriorityFeePerGas = this.env.ethers.parseUnits("1", "gwei");
                const tx = yield signer.sendTransaction({
                    to: signer,
                    maxPriorityFeePerGas,
                });
                // we just check that the max fee is set, because the
                // strategy to select its value might change
                chai_1.assert.exists(tx.maxFeePerGas);
                chai_1.assert.strictEqual(tx.maxPriorityFeePerGas, maxPriorityFeePerGas);
            });
        });
        it("should throw if both gasPrice and maxFeePerGas are specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                yield chai_1.assert.isRejected(signer.sendTransaction({
                    to: signer,
                    gasPrice: this.env.ethers.parseUnits("10", "gwei"),
                    maxFeePerGas: this.env.ethers.parseUnits("10", "gwei"),
                }), "Cannot send both gasPrice and maxFeePerGas params");
            });
        });
        it("should throw if both gasPrice and maxPriorityFeePerGas are specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                yield chai_1.assert.isRejected(signer.sendTransaction({
                    to: signer,
                    gasPrice: this.env.ethers.parseUnits("10", "gwei"),
                    maxPriorityFeePerGas: this.env.ethers.parseUnits("10", "gwei"),
                }), "Cannot send both gasPrice and maxPriorityFeePerGas");
            });
        });
        it("should throw if gasPrice, maxFeePerGas and maxPriorityFeePerGas are specified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [signer] = yield this.env.ethers.getSigners();
                yield chai_1.assert.isRejected(signer.sendTransaction({
                    to: signer,
                    gasPrice: this.env.ethers.parseUnits("10", "gwei"),
                    maxFeePerGas: this.env.ethers.parseUnits("10", "gwei"),
                    maxPriorityFeePerGas: this.env.ethers.parseUnits("10", "gwei"),
                }), "Cannot send both gasPrice and maxFeePerGas");
            });
        });
    });
}
