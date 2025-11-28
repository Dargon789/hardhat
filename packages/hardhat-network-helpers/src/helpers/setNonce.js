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
exports.setNonce = void 0;
const utils_1 = require("../utils");
/**
 * Modifies an account's nonce by overwriting it
 *
 * @param address The address whose nonce is to be changed
 * @param nonce The new nonce
 */
function setNonce(address, nonce) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        (0, utils_1.assertValidAddress)(address);
        const nonceHex = (0, utils_1.toRpcQuantity)(nonce);
        yield provider.request({
            method: "hardhat_setNonce",
            params: [address, nonceHex],
        });
    });
}
exports.setNonce = setNonce;
