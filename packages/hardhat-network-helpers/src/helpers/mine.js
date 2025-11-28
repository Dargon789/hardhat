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
exports.mine = void 0;
const utils_1 = require("../utils");
/**
 * Mines a specified number of blocks at a given interval
 *
 * @param blocks Number of blocks to mine
 * @param options.interval Configures the interval (in seconds) between the timestamps of each mined block. Defaults to 1.
 */
function mine(blocks = 1, options = {}) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        const interval = (_a = options.interval) !== null && _a !== void 0 ? _a : 1;
        const blocksHex = (0, utils_1.toRpcQuantity)(blocks);
        const intervalHex = (0, utils_1.toRpcQuantity)(interval);
        yield provider.request({
            method: "hardhat_mine",
            params: [blocksHex, intervalHex],
        });
    });
}
exports.mine = mine;
