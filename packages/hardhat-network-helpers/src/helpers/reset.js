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
exports.reset = void 0;
const loadFixture_1 = require("../loadFixture");
const utils_1 = require("../utils");
function reset(url, blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const provider = yield (0, utils_1.getHardhatProvider)();
        yield (0, loadFixture_1.clearSnapshots)();
        if (url === undefined) {
            yield provider.request({
                method: "hardhat_reset",
                params: [],
            });
        }
        else if (blockNumber === undefined) {
            yield provider.request({
                method: "hardhat_reset",
                params: [
                    {
                        forking: {
                            jsonRpcUrl: url,
                        },
                    },
                ],
            });
        }
        else {
            yield provider.request({
                method: "hardhat_reset",
                params: [
                    {
                        forking: {
                            jsonRpcUrl: url,
                            blockNumber: (0, utils_1.toNumber)(blockNumber),
                        },
                    },
                ],
            });
        }
    });
}
exports.reset = reset;
