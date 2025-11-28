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
const utils_1 = require("../../src/utils");
const test_utils_1 = require("../test-utils");
describe("setStorageAt", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const account = "0x000000000000000000000000000000000000bEEF";
    const code = "0x000000000000000000000000000000000000000000000000000000000000beef";
    const getStorageAt = (address, index, block = "latest") => __awaiter(this, void 0, void 0, function* () {
        const hexIndex = (0, utils_1.toPaddedRpcQuantity)(index, 32);
        const data = yield this.ctx.hre.network.provider.send("eth_getStorageAt", [
            address,
            hexIndex,
            block,
        ]);
        return data;
    });
    it("should allow setting the data at a specific storage index of a given address", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield hh.setStorageAt(account, "0x1", code);
            chai_1.assert.equal(yield getStorageAt(account, "0x1"), code);
        });
    });
    describe("accepted parameter types for index", function () {
        const indexExamples = [
            ["number", 1, 1],
            ["bigint", BigInt(1), 1],
            ["hex encoded", "0x1", 1],
            ["hex encoded with leading zeros", "0x01", 1],
            ["hex encoded with several leading zeros", "0x001", 1],
            ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(1), 1],
            ["bn.js instances", new ethereumjs_util_1.BN(1), 1],
        ];
        for (const [type, value, expectedIndex] of indexExamples) {
            it(`should accept index of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield hh.setStorageAt(account, value, code);
                    chai_1.assert.equal(yield getStorageAt(account, expectedIndex), code);
                });
            });
        }
        it("should accept data that is not 64 bytes long", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield hh.setStorageAt(account, "0x1", "0xbeef");
                chai_1.assert.equal(yield getStorageAt(account, "0x1"), code);
            });
        });
    });
});
