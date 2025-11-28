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
describe("mine", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const getBlockNumber = () => __awaiter(this, void 0, void 0, function* () {
        const blockNumber = yield this.ctx.hre.network.provider.send("eth_blockNumber");
        return (0, test_utils_1.rpcQuantityToNumber)(blockNumber);
    });
    const getBlockTimestamp = (blockNumber = "latest") => __awaiter(this, void 0, void 0, function* () {
        const block = yield this.ctx.hre.network.provider.send("eth_getBlockByNumber", [blockNumber, false]);
        return (0, test_utils_1.rpcQuantityToNumber)(block.timestamp);
    });
    it("should mine a single block by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberBefore = yield getBlockNumber();
            yield hh.mine();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 1);
        });
    });
    it("should mine the given number of blocks", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberBefore = yield getBlockNumber();
            yield hh.mine(100);
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 100);
        });
    });
    it("should accept an interval", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberBefore = yield getBlockNumber();
            const blockTimestampBefore = yield getBlockTimestamp();
            yield hh.mine(100, {
                interval: 600,
            });
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 100);
            chai_1.assert.equal(yield getBlockTimestamp(), blockTimestampBefore + 1 + 99 * 600);
        });
    });
    describe("accepted parameter types for blocks", function () {
        const blocksExamples = [
            ["number", 100, 100],
            ["bigint", BigInt(100), 100],
            ["hex encoded", "0x64", 100],
            ["hex encoded with leading zeros", "0x0A", 10],
            ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(100), 100],
            ["bn.js instances", new ethereumjs_util_1.BN(100), 100],
        ];
        for (const [type, value, expectedMinedBlocks] of blocksExamples) {
            it(`should accept blocks of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const blockNumberBefore = yield getBlockNumber();
                    yield hh.mine(value);
                    chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + expectedMinedBlocks);
                });
            });
        }
        it("should not accept strings that are not 0x-prefixed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.mine("3"));
            });
        });
    });
    describe("accepted parameter types for interval", function () {
        const intervalExamples = [
            ["number", 60, 60],
            ["bigint", BigInt(60), 60],
            ["hex encoded", "0x3c", 60],
            ["hex encoded with leading zeros", "0x0A", 10],
            ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(60), 60],
            ["bn.js instances", new ethereumjs_util_1.BN(60), 60],
        ];
        for (const [type, value, expectedInterval] of intervalExamples) {
            it(`should accept intervals of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const blockTimestampBefore = yield getBlockTimestamp();
                    yield hh.mine(100, {
                        interval: value,
                    });
                    chai_1.assert.equal(yield getBlockTimestamp(), blockTimestampBefore + 1 + 99 * expectedInterval);
                });
            });
        }
        it("should not accept strings that are not 0x-prefixed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.mine(100, {
                    interval: "3",
                }));
            });
        });
    });
});
