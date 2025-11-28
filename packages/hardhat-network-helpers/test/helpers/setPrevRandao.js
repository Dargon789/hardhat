"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chai_1 = require("chai");
const ethereumjs_util_1 = require("ethereumjs-util");
const ethers_v5_1 = require("ethers-v5");
const hh = __importStar(require("../../src"));
const test_utils_1 = require("../test-utils");
describe("setPrevRandao", function () {
    (0, test_utils_1.useEnvironment)("merge");
    const getPrevRandao = () => __awaiter(this, void 0, void 0, function* () {
        const block = yield this.ctx.hre.network.provider.send("eth_getBlockByNumber", ["latest", false]);
        return BigInt(block.mixHash);
    });
    it("should allow setting the next block's prevRandao", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield hh.setPrevRandao(12345);
            yield hh.mine();
            chai_1.assert.equal(yield getPrevRandao(), 12345n);
        });
    });
    describe("accepted parameter types for next block's base fee per gas", function () {
        const prevRandaoExamples = [
            ["number", 2000001, 2000001n],
            ["bigint", BigInt(2000002), 2000002n],
            ["hex encoded", "0x1e8483", 2000003n],
            ["hex encoded with leading zeros", "0x01e240", 123456n],
            [
                "ethers's bignumber instances",
                ethers_v5_1.ethers.BigNumber.from(2000004),
                2000004n,
            ],
            ["bn.js instances", new ethereumjs_util_1.BN(2000005), 2000005n],
        ];
        for (const [type, value, expectedPrevRandao] of prevRandaoExamples) {
            it(`should accept blockGasLimit of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield hh.setPrevRandao(value);
                    yield hh.mine();
                    chai_1.assert.equal(yield getPrevRandao(), expectedPrevRandao);
                });
            });
        }
        it("should not accept strings that are not 0x-prefixed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.setPrevRandao("3"));
            });
        });
    });
});
