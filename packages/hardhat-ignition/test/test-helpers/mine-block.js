"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mineBlock = void 0;
function mineBlock(hre) {
    return hre.network.provider.send("evm_mine");
}
exports.mineBlock = mineBlock;
