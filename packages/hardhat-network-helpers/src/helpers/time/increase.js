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
exports.increase = void 0;
const utils_1 = require("../../utils");
const mine_1 = require("../mine");
const latest_1 = require("./latest");
/**
 * Mines a new block whose timestamp is `amountInSeconds` after the latest block's timestamp
 *
 * @param amountInSeconds number of seconds to increase the next block's timestamp by
 * @returns the timestamp of the mined block
 */
function increase(amountInSeconds) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        const normalizedAmount = (0, utils_1.toBigInt)(amountInSeconds);
        (0, utils_1.assertNonNegativeNumber)(normalizedAmount);
        const latestTimestamp = BigInt(yield (0, latest_1.latest)());
        const targetTimestamp = latestTimestamp + normalizedAmount;
        yield provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [(0, utils_1.toRpcQuantity)(targetTimestamp)],
        });
        yield (0, mine_1.mine)();
        return (0, latest_1.latest)();
    });
}
exports.increase = increase;
