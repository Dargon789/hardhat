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
const test_utils_1 = require("../test-utils");
describe("takeSnapshot", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const getBlockNumber = () => __awaiter(this, void 0, void 0, function* () {
        const blockNumber = yield this.ctx.hre.network.provider.send("eth_blockNumber");
        return (0, test_utils_1.rpcQuantityToNumber)(blockNumber);
    });
    it("should take a snapshot", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberBefore = yield getBlockNumber();
            const snapshot = yield hh.takeSnapshot();
            yield hh.mine();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 1);
            yield snapshot.restore();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore);
        });
    });
    it("revert can be called more than once", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumberBefore = yield getBlockNumber();
            const snapshot = yield hh.takeSnapshot();
            yield hh.mine();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 1);
            yield snapshot.restore();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore);
            yield hh.mine();
            yield hh.mine();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 2);
            yield snapshot.restore();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore);
        });
    });
    it("should throw if an invalid snapshot is restored", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const snapshot1 = yield hh.takeSnapshot();
            const snapshot2 = yield hh.takeSnapshot();
            yield snapshot1.restore();
            yield chai_1.assert.isRejected(snapshot2.restore());
        });
    });
});
