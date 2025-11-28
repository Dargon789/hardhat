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
describe("time#increaseTo", function () {
    describe("simple project", function () {
        (0, test_utils_1.useEnvironment)("simple");
        it("should mine a new block with the given timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialBlockNumber = yield hh.time.latestBlock();
                const initialTimestamp = yield hh.time.latest();
                const newTimestamp = initialTimestamp + 10000;
                yield hh.time.increaseTo(newTimestamp);
                const endBlockNumber = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(endBlockNumber, initialBlockNumber + 1);
                chai_1.assert.equal(newTimestamp, endTimestamp);
                (0, chai_1.assert)(endTimestamp - initialTimestamp === 10000);
            });
        });
        it("should throw if given a timestamp that is equal to the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.increaseTo(initialTimestamp));
            });
        });
        it("should throw if given a timestamp that is less than the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.increaseTo(initialTimestamp - 1));
            });
        });
        describe("accepted parameter types for timestamp", function () {
            it(`should accept an argument of type bigint`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const initialTimestamp = yield hh.time.latest();
                    const newTimestamp = initialTimestamp + 3600;
                    yield hh.time.increaseTo(BigInt(newTimestamp));
                    const endTimestamp = yield hh.time.latest();
                    chai_1.assert.equal(newTimestamp, endTimestamp);
                    (0, chai_1.assert)(endTimestamp - initialTimestamp === 3600);
                });
            });
            it(`should accept an argument of type ethers's bignumber`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const initialTimestamp = yield hh.time.latest();
                    const newTimestamp = initialTimestamp + 3600;
                    yield hh.time.increaseTo(ethers_v5_1.ethers.BigNumber.from(newTimestamp));
                    const endTimestamp = yield hh.time.latest();
                    chai_1.assert.equal(newTimestamp, endTimestamp);
                    (0, chai_1.assert)(endTimestamp - initialTimestamp === 3600);
                });
            });
            it(`should accept an argument of type hex string`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const initialTimestamp = yield hh.time.latest();
                    const newTimestamp = initialTimestamp + 3600;
                    yield hh.time.increaseTo(ethers_v5_1.ethers.BigNumber.from(newTimestamp).toHexString());
                    const endTimestamp = yield hh.time.latest();
                    chai_1.assert.equal(newTimestamp, endTimestamp);
                    (0, chai_1.assert)(endTimestamp - initialTimestamp === 3600);
                });
            });
            it(`should accept an argument of type bn.js`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const initialTimestamp = yield hh.time.latest();
                    const newTimestamp = initialTimestamp + 3600;
                    yield hh.time.increaseTo(new ethereumjs_util_1.BN(newTimestamp));
                    const endTimestamp = yield hh.time.latest();
                    chai_1.assert.equal(newTimestamp, endTimestamp);
                    (0, chai_1.assert)(endTimestamp - initialTimestamp === 3600);
                });
            });
            it(`should accept an argument of type [Date]`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const initialTimestamp = yield hh.time.latest();
                    const newTimestamp = initialTimestamp + 3600;
                    // multiply by 1000 because Date accepts Epoch millis
                    yield hh.time.increaseTo(new Date(newTimestamp * 1000));
                    const endTimestamp = yield hh.time.latest();
                    chai_1.assert.equal(newTimestamp, endTimestamp);
                    (0, chai_1.assert)(endTimestamp - initialTimestamp === 3600);
                });
            });
        });
    });
    describe("blocks with same timestamp", function () {
        (0, test_utils_1.useEnvironment)("allow-blocks-same-timestamp");
        it("should not throw if given a timestamp that is equal to the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialBlockNumber = yield hh.time.latestBlock();
                const initialTimestamp = yield hh.time.latest();
                yield hh.time.increaseTo(initialTimestamp);
                const endBlockNumber = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(endBlockNumber, initialBlockNumber + 1);
                chai_1.assert.equal(endTimestamp, initialTimestamp);
            });
        });
        it("should throw if given a timestamp that is less than the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.increaseTo(initialTimestamp - 1));
            });
        });
    });
});
