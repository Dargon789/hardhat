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
const hh = __importStar(require("../../../src"));
const test_utils_1 = require("../../test-utils");
describe("time#increase", function () {
    describe("simple project", function () {
        (0, test_utils_1.useEnvironment)("simple");
        it("should mine a new block with the timestamp increased by a given number of seconds", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialBlockNumber = yield hh.time.latestBlock();
                const initialTimestamp = yield hh.time.latest();
                const newTimestamp = initialTimestamp + 10000;
                const returnedTimestamp = yield hh.time.increase(10000);
                const endBlockNumber = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(endBlockNumber, initialBlockNumber + 1);
                chai_1.assert.equal(newTimestamp, endTimestamp);
                chai_1.assert.equal(returnedTimestamp, endTimestamp);
                (0, chai_1.assert)(endTimestamp - initialTimestamp === 10000);
            });
        });
        it("should throw if given zero number of seconds", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.time.increase(0));
            });
        });
        it("should throw if given a negative number of seconds", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.time.increase(-1));
            });
        });
        describe("accepted parameter types for number of seconds", function () {
            const nonceExamples = [
                ["number", 100],
                ["bigint", BigInt(100)],
                ["hex encoded", "0x64"],
                ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(100)],
                ["bn.js instances", new ethereumjs_util_1.BN(100)],
            ];
            for (const [type, value] of nonceExamples) {
                it(`should accept an argument of type ${type}`, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const initialTimestamp = yield hh.time.latest();
                        yield hh.time.increase(value);
                        const endTimestamp = yield hh.time.latest();
                        (0, chai_1.assert)(endTimestamp - initialTimestamp === 100);
                    });
                });
            }
        });
    });
    describe("blocks with same timestamp", function () {
        (0, test_utils_1.useEnvironment)("allow-blocks-same-timestamp");
        it("should not throw if given zero number of seconds", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialBlockNumber = yield hh.time.latestBlock();
                const initialTimestamp = yield hh.time.latest();
                const returnedTimestamp = yield hh.time.increase(0);
                const endBlockNumber = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(endBlockNumber, initialBlockNumber + 1);
                chai_1.assert.equal(returnedTimestamp, endTimestamp);
                chai_1.assert.equal(endTimestamp, initialTimestamp);
            });
        });
        it("should throw if given a negative number of seconds", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.time.increase(-1));
            });
        });
    });
});
