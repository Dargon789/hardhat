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
exports.setPrevRandao = void 0;
const utils_1 = require("../utils");
/**
 * Sets the PREVRANDAO value of the next block.
 *
 * @param prevRandao The new PREVRANDAO value to use.
 */
function setPrevRandao(prevRandao) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        const paddedPrevRandao = (0, utils_1.toPaddedRpcQuantity)(prevRandao, 32);
        yield provider.request({
            method: "hardhat_setPrevRandao",
            params: [paddedPrevRandao],
        });
    });
}
exports.setPrevRandao = setPrevRandao;
