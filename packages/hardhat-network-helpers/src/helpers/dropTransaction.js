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
exports.dropTransaction = void 0;
const utils_1 = require("../utils");
/**
 * Removes the given transaction from the mempool, if it exists.
 *
 * @param txHash Transaction hash to be removed from the mempool.
 * @returns `true` if successful, otherwise `false`.
 * @throws if the transaction was already mined.
 */
function dropTransaction(txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        (0, utils_1.assertTxHash)(txHash);
        return (yield provider.request({
            method: "hardhat_dropTransaction",
            params: [txHash],
        }));
    });
}
exports.dropTransaction = dropTransaction;
