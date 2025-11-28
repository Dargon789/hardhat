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
exports.clearPendingTransactionsFromMemoryPool = void 0;
const chai_1 = require("chai");
function clearPendingTransactionsFromMemoryPool(hre) {
    return __awaiter(this, void 0, void 0, function* () {
        const pendingBlockBefore = yield hre.network.provider.send("eth_getBlockByNumber", ["pending", false]);
        (0, chai_1.assert)(pendingBlockBefore.transactions.length > 0, "Clearing an empty mempool");
        for (const hash of pendingBlockBefore.transactions) {
            yield hre.network.provider.request({
                method: "hardhat_dropTransaction",
                params: [hash],
            });
        }
        const pendingBlockAfter = yield hre.network.provider.send("eth_getBlockByNumber", ["pending", false]);
        (0, chai_1.assert)(pendingBlockAfter.transactions.length === 0, "All blocks should be cleared");
    });
}
exports.clearPendingTransactionsFromMemoryPool = clearPendingTransactionsFromMemoryPool;
