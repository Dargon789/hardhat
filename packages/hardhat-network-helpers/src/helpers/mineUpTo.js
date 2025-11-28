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
exports.mineUpTo = void 0;
const utils_1 = require("../utils");
const latestBlock_1 = require("./time/latestBlock");
/**
 * Mines new blocks until the latest block number is `blockNumber`
 *
 * @param blockNumber Must be greater than the latest block's number
 */
function mineUpTo(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        const normalizedBlockNumber = (0, utils_1.toBigInt)(blockNumber);
        const latestHeight = BigInt(yield (0, latestBlock_1.latestBlock)());
        (0, utils_1.assertLargerThan)(normalizedBlockNumber, latestHeight, "block number");
        const blockParam = normalizedBlockNumber - latestHeight;
        yield provider.request({
            method: "hardhat_mine",
            params: [(0, utils_1.toRpcQuantity)(blockParam)],
        });
    });
}
exports.mineUpTo = mineUpTo;
