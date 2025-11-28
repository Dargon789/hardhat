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
const hh = __importStar(require("../../../src"));
const test_utils_1 = require("../../test-utils");
describe("time#setNextBlockTimestamp", function () {
    describe("simple project", function () {
        (0, test_utils_1.useEnvironment)("simple");
        it("should not mine a new block", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                yield hh.time.setNextBlockTimestamp((yield hh.time.latest()) + 1);
                const endHeight = yield hh.time.latestBlock();
                chai_1.assert.equal(initialHeight, endHeight);
            });
        });
        it("should set the next block to the given timestamp [epoch seconds]", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                const newTimestamp = (yield hh.time.latest()) + 10000;
                yield hh.time.setNextBlockTimestamp(newTimestamp);
                yield hh.mine();
                const endHeight = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(initialHeight + 1, endHeight);
                chai_1.assert.equal(newTimestamp, endTimestamp);
            });
        });
        it("should set the next block to the given timestamp [Date]", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialHeight = yield hh.time.latestBlock();
                const newTimestamp = (yield hh.time.latest()) + 10000;
                // multiply by 1000 because Date accepts Epoch millis
                yield hh.time.setNextBlockTimestamp(new Date(newTimestamp * 1000));
                yield hh.mine();
                const endHeight = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(initialHeight + 1, endHeight);
                chai_1.assert.equal(newTimestamp, endTimestamp);
            });
        });
        it("should throw if given a timestamp that is equal to the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.setNextBlockTimestamp(initialTimestamp));
            });
        });
        it("should throw if given a timestamp that is less than the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.setNextBlockTimestamp(initialTimestamp - 1));
            });
        });
    });
    describe("blocks with same timestamp", function () {
        (0, test_utils_1.useEnvironment)("allow-blocks-same-timestamp");
        it("should not throw if given a timestamp that is equal to the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialTimestamp = yield hh.time.latest();
                yield hh.time.setNextBlockTimestamp(initialTimestamp);
            });
        });
        it("should throw if given a timestamp that is less than the current block timestamp", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const initialBlockNumber = yield hh.time.latestBlock();
                const initialTimestamp = yield hh.time.latest();
                yield chai_1.assert.isRejected(hh.time.setNextBlockTimestamp(initialTimestamp - 1));
                yield hh.time.setNextBlockTimestamp(initialTimestamp);
                yield hh.mine();
                const endBlockNumber = yield hh.time.latestBlock();
                const endTimestamp = yield hh.time.latest();
                chai_1.assert.equal(endBlockNumber, initialBlockNumber + 1);
                chai_1.assert.equal(endTimestamp, initialTimestamp);
            });
        });
    });
});
