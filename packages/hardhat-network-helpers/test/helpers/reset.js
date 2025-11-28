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
const hh = __importStar(require("../../src"));
const setup_1 = require("../setup");
const test_utils_1 = require("../test-utils");
describe("resetWithoutFork", function () {
    (0, test_utils_1.useEnvironment)("simple");
    it("should reset the non-forked network", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(yield hh.time.latestBlock(), 0);
            yield hh.mine();
            chai_1.assert.equal(yield hh.time.latestBlock(), 1);
            yield hh.reset();
            chai_1.assert.equal(yield hh.time.latestBlock(), 0);
        });
    });
    it("should reset with a url", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (setup_1.INFURA_URL === undefined) {
                this.skip();
            }
            this.timeout(60000);
            // fork mainnet
            yield hh.reset(setup_1.INFURA_URL);
            const mainnetBlockNumber = yield hh.time.latestBlock();
            // fork sepolia
            yield hh.reset(setup_1.INFURA_URL.replace("mainnet", "sepolia"));
            const sepoliaBlockNumber = yield hh.time.latestBlock();
            const blockNumberDelta = Math.abs(mainnetBlockNumber - sepoliaBlockNumber);
            // check that there is a significative difference between the latest
            // block numbers of each chain
            chai_1.assert.isAbove(blockNumberDelta, 100);
        });
    });
    it("should reset with a url and block number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            if (setup_1.INFURA_URL === undefined) {
                this.skip();
            }
            this.timeout(60000);
            // fork mainnet
            yield hh.reset(setup_1.INFURA_URL);
            const mainnetBlockNumber = yield hh.time.latestBlock();
            chai_1.assert.isAbove(mainnetBlockNumber, 1000000);
            // fork an older block number
            yield hh.reset(setup_1.INFURA_URL, mainnetBlockNumber - 1000);
            const olderMainnetBlockNumber = yield hh.time.latestBlock();
            chai_1.assert.equal(olderMainnetBlockNumber, mainnetBlockNumber - 1000);
        });
    });
});
describe("should clear snapshot upon reset", function () {
    (0, test_utils_1.useEnvironment)("simple");
    it("checks if the snapshot is cleared upon hardhat_reset", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshotBeforeReset = yield hh.takeSnapshot();
            yield hh.reset();
            const snapshotAfterReset = yield hh.takeSnapshot();
            chai_1.assert.equal(snapshotBeforeReset.snapshotId, snapshotAfterReset.snapshotId);
        });
    });
});
