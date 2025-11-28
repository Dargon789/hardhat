"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const hh = __importStar(require("../../src"));
const test_utils_1 = require("../test-utils");
describe("dropTransaction", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const account = "0x000000000000000000000000000000000000bEEF";
    const recipient = "0x000000000000000000000000000000000000BEEe";
    it("should drop a given transaction from the mempool", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.network.provider.send("evm_setAutomine", [false]);
            yield hh.setBalance(account, "0xaaaaaaaaaaaaaaaaaaaaaa");
            yield hh.impersonateAccount(account);
            const txHash = yield this.hre.network.provider.send("eth_sendTransaction", [
                {
                    from: account,
                    to: recipient,
                    value: "0x1",
                },
            ]);
            let pendingTxs = yield this.hre.network.provider.send("eth_pendingTransactions");
            // ensure tx is in mempool
            chai_1.assert.equal(pendingTxs[0].hash, txHash);
            yield hh.dropTransaction(txHash);
            pendingTxs = yield this.hre.network.provider.send("eth_pendingTransactions");
            chai_1.assert.equal(pendingTxs.length, 0);
        });
    });
    describe("invalid parameters for txHash", function () {
        const txHashExamples = [
            ["non-prefixed hex string", "beef"],
            ["hex string of incorrect length", "0xbeef"],
            ["non-hex string", "test"],
        ];
        for (const [type, value] of txHashExamples) {
            it(`should not accept txHash of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield chai_1.assert.isRejected(hh.dropTransaction(value));
                });
            });
        }
    });
});
