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
describe("getStorageAt", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const account = "0x000000000000000000000000000000000000bEEF";
    const code = "0x000000000000000000000000000000000000000000000000000000000000beef";
    it("should get the storage of a given address", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield hh.setStorageAt(account, "0x1", code);
            chai_1.assert.equal(yield hh.getStorageAt(account, "0x1"), code);
        });
    });
    describe("accepted parameter types for index", function () {
        const indexExamples = [
            ["number", 1, 1],
            ["bigint", BigInt(1), 1],
            ["hex encoded", "0x1", 1],
            ["hex encoded with leading zeros", "0x01", 1],
            ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(1), 1],
            ["bn.js instances", new ethereumjs_util_1.BN(1), 1],
        ];
        for (const [type, value, expectedIndex] of indexExamples) {
            it(`should accept index of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield hh.setStorageAt(account, value, code);
                    chai_1.assert.equal(yield hh.getStorageAt(account, expectedIndex), code);
                });
            });
        }
    });
    describe("accepted parameter types for block", function () {
        const blockExamples = [
            ["number", 1],
            ["bigint", BigInt(1)],
            ["hex encoded", "0x1"],
            ["hex encoded with leading zeros", "0x01"],
            ["ethers's bignumber instances", ethers_v5_1.ethers.BigNumber.from(1)],
            ["bn.js instances", new ethereumjs_util_1.BN(1)],
            ["block tag latest", "latest"],
            ["block tag earliest", "earliest"],
            ["block tag pending", "pending"],
        ];
        for (const [type, value] of blockExamples) {
            it(`should accept block of type ${type}`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield hh.setStorageAt(account, 1, code);
                    yield hh.mine();
                    yield chai_1.assert.isFulfilled(hh.getStorageAt(account, 1, value));
                });
            });
        }
    });
});
