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
describe("mineUpTo", function () {
    (0, test_utils_1.useEnvironment)("simple");
    it("should increase the block height to the given block number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const initialHeight = yield hh.time.latestBlock();
            yield hh.mineUpTo(initialHeight + 3);
            const endHeight = yield hh.time.latestBlock();
            chai_1.assert.equal(initialHeight + 3, endHeight);
        });
    });
    it("should throw if given a number equal to the current height", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const initialHeight = yield hh.time.latestBlock();
            yield chai_1.assert.isRejected(hh.mineUpTo(initialHeight));
        });
    });
    it("should throw if given a number lower than the current height", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const initialHeight = yield hh.time.latestBlock();
            yield chai_1.assert.isRejected(hh.mineUpTo(initialHeight - 1));
        });
    });
    describe("accepted parameter types for block number", function () {
        it(`should accept an argument of type bigint`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                yield hh.mineUpTo(BigInt(initialHeight) + BigInt(3));
                const endHeight = yield hh.time.latestBlock();
                chai_1.assert.equal(initialHeight + 3, endHeight);
            });
        });
        it(`should accept an argument of type ethers's bignumber`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                yield hh.mineUpTo(ethers_v5_1.ethers.BigNumber.from(initialHeight).add(3));
                const endHeight = yield hh.time.latestBlock();
                chai_1.assert.equal(initialHeight + 3, endHeight);
            });
        });
        it(`should accept an argument of type hex string`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                const targetHeight = ethers_v5_1.ethers.BigNumber.from(initialHeight).add(3);
                yield hh.mineUpTo(targetHeight.toHexString());
                const endHeight = yield hh.time.latestBlock();
                chai_1.assert.equal(initialHeight + 3, endHeight);
            });
        });
        it(`should accept an argument of type bn.js`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                yield hh.mineUpTo(new ethereumjs_util_1.BN(initialHeight).addn(3));
                const endHeight = yield hh.time.latestBlock();
                chai_1.assert.equal(initialHeight + 3, endHeight);
            });
        });
    });
});
