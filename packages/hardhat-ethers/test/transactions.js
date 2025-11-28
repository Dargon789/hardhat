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
const helpers_1 = require("./helpers");
(0, chai_1.use)(chai_as_promised_1.default);
describe("transactions", function () {
    (0, environment_1.usePersistentEnvironment)("minimal-project");
    it("should wait until a transaction is mined", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [signer] = yield this.env.ethers.getSigners();
            // send a transaction with automining disabled
            yield this.env.network.provider.send("evm_setAutomine", [false]);
            const tx = yield signer.sendTransaction({ to: signer });
            let transactionIsMined = false;
            const transactionMinedPromise = tx.wait().then(() => {
                transactionIsMined = true;
            });
            // .wait() shouldn't resolve if the transaction wasn't mined
            yield Promise.race([transactionMinedPromise, (0, helpers_1.sleep)(250)]);
            chai_1.assert.isFalse(transactionIsMined);
            // mine a new block
            yield this.env.network.provider.send("hardhat_mine", []);
            yield transactionMinedPromise;
            chai_1.assert.isTrue(transactionIsMined);
            // restore automining
            yield this.env.network.provider.send("evm_setAutomine", [true]);
        });
    });
    it("should wait until a transaction has the given number of confirmations", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [signer] = yield this.env.ethers.getSigners();
            // send a transaction with automining disabled
            yield this.env.network.provider.send("evm_setAutomine", [false]);
            const tx = yield signer.sendTransaction({ to: signer });
            let transactionIsMined = false;
            const transactionMinedPromise = tx.wait(10).then(() => {
                transactionIsMined = true;
            });
            // .wait() shouldn't resolve if the transaction wasn't mined
            yield Promise.race([transactionMinedPromise, (0, helpers_1.sleep)(250)]);
            chai_1.assert.isFalse(transactionIsMined);
            // mine a new block
            yield this.env.network.provider.send("hardhat_mine", []);
            // the promise shouldn't be resolved with just one confirmation
            yield Promise.race([transactionMinedPromise, (0, helpers_1.sleep)(250)]);
            chai_1.assert.isFalse(transactionIsMined);
            // mine 9 blocks more
            yield this.env.network.provider.send("hardhat_mine", ["0x9"]);
            yield transactionMinedPromise;
            chai_1.assert.isTrue(transactionIsMined);
            // restore automining
            yield this.env.network.provider.send("evm_setAutomine", [true]);
        });
    });
});
