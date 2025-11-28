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
exports.setCoinbase = void 0;
const utils_1 = require("../utils");
/**
 * Sets the coinbase address to be used in new blocks
 *
 * @param address The new coinbase address
 */
function setCoinbase(address) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        (0, utils_1.assertValidAddress)(address);
        yield provider.request({
            method: "hardhat_setCoinbase",
            params: [address],
        });
    });
}
exports.setCoinbase = setCoinbase;
