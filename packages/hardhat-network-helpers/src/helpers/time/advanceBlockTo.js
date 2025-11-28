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
exports.advanceBlockTo = void 0;
const mineUpTo_1 = require("../mineUpTo");
/**
 * Mines new blocks until the latest block number is `blockNumber`
 *
 * @param blockNumber Must be greater than the latest block's number
 * @deprecated Use `helpers.mineUpTo` instead.
 */
function advanceBlockTo(blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        return (0, mineUpTo_1.mineUpTo)(blockNumber);
    });
}
exports.advanceBlockTo = advanceBlockTo;
