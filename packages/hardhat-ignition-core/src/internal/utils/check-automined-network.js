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
exports.checkAutominedNetwork = void 0;
function checkAutominedNetwork(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const isHardhat = Boolean(yield provider.request({ method: "hardhat_getAutomine" }));
            if (isHardhat) {
                return true;
            }
        }
        catch (_a) {
            // If this method failed we aren't using Hardhat Network nor Anvil, so we
            // just continue with the next check.
        }
        try {
            const isGanache = /ganache/i.test((yield provider.request({ method: "web3_clientVersion" })));
            if (isGanache) {
                return true;
            }
        }
        catch (_b) {
            // If this method failed we aren't using Ganache
        }
        return false;
    });
}
exports.checkAutominedNetwork = checkAutominedNetwork;
