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
exports.setStorageAt = void 0;
const utils_1 = require("../utils");
/**
 * Writes a single position of an account's storage
 *
 * @param address The address where the code should be stored
 * @param index The index in storage
 * @param value The value to store
 */
function setStorageAt(address, index, value) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        (0, utils_1.assertValidAddress)(address);
        const indexParam = (0, utils_1.toRpcQuantity)(index);
        const codeParam = (0, utils_1.toPaddedRpcQuantity)(value, 32);
        yield provider.request({
            method: "hardhat_setStorageAt",
            params: [address, indexParam, codeParam],
        });
    });
}
exports.setStorageAt = setStorageAt;
