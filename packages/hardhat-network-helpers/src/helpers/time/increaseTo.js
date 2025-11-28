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
exports.increaseTo = void 0;
const utils_1 = require("../../utils");
const mine_1 = require("../mine");
const duration_1 = require("./duration");
/**
 * Mines a new block whose timestamp is `timestamp`
 *
 * @param timestamp Can be `Date` or Epoch seconds. Must be bigger than the latest block's timestamp
 */
function increaseTo(timestamp) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        const normalizedTimestamp = (0, utils_1.toBigInt)(timestamp instanceof Date ? (0, duration_1.millis)(timestamp.valueOf()) : timestamp);
        yield provider.request({
            method: "evm_setNextBlockTimestamp",
            params: [(0, utils_1.toRpcQuantity)(normalizedTimestamp)],
        });
        yield (0, mine_1.mine)();
    });
}
exports.increaseTo = increaseTo;
