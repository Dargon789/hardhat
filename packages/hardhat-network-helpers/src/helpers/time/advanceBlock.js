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
exports.advanceBlock = void 0;
const mine_1 = require("../mine");
const latestBlock_1 = require("./latestBlock");
/**
 * Mines `numberOfBlocks` new blocks.
 *
 * @param numberOfBlocks Must be greater than 0
 * @returns number of the latest block mined
 *
 * @deprecated Use `helpers.mine` instead.
 */
function advanceBlock(numberOfBlocks = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, mine_1.mine)(numberOfBlocks);
        return (0, latestBlock_1.latestBlock)();
    });
}
exports.advanceBlock = advanceBlock;
