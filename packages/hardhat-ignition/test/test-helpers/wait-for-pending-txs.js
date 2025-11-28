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
exports.waitForPendingTxs = void 0;
const sleep = (timeout) => new Promise((res) => setTimeout(res, timeout));
/**
 * Wait until there are at least `expectedCount` transactions in the mempool
 */
function waitForPendingTxs(hre, expectedCount, finished) {
    return __awaiter(this, void 0, void 0, function* () {
        let stopWaiting = false;
        finished.finally(() => {
            stopWaiting = true;
        });
        while (true) {
            if (stopWaiting) {
                return;
            }
            const pendingBlock = yield hre.network.provider.send("eth_getBlockByNumber", ["pending", false]);
            if (pendingBlock.transactions.length >= expectedCount) {
                return;
            }
            yield sleep(50);
        }
    });
}
exports.waitForPendingTxs = waitForPendingTxs;
