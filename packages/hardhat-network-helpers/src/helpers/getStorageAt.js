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
exports.getStorageAt = void 0;
const utils_1 = require("../utils");
/**
 * Retrieves the data located at the given address, index, and block number
 *
 * @param address The address to retrieve storage from
 * @param index The position in storage
 * @param block The block number, or one of `"latest"`, `"earliest"`, or `"pending"`. Defaults to `"latest"`.
 * @returns string containing the hexadecimal code retrieved
 */
function getStorageAt(address, index, block = "latest") {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        (0, utils_1.assertValidAddress)(address);
        const indexParam = (0, utils_1.toPaddedRpcQuantity)(index, 32);
        let blockParam;
        switch (block) {
            case "latest":
            case "earliest":
            case "pending":
                blockParam = block;
                break;
            default:
                blockParam = (0, utils_1.toRpcQuantity)(block);
        }
        const data = yield provider.request({
            method: "eth_getStorageAt",
            params: [address, indexParam, blockParam],
        });
        return data;
    });
}
exports.getStorageAt = getStorageAt;
