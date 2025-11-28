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
describe("setCode", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const recipient = "0x000000000000000000000000000000000000bEEF";
    const getCode = (address, block = "latest") => __awaiter(this, void 0, void 0, function* () {
        const code = yield this.ctx.hre.network.provider.send("eth_getCode", [
            address,
            block,
        ]);
        return code;
    });
    it("should allow setting the code of a given address", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield hh.setCode(recipient, "0xa1a2a3");
            chai_1.assert.equal(yield getCode(recipient), "0xa1a2a3");
        });
    });
    describe("accepted parameter types for code", function () {
        it("should not accept strings that are not 0x-prefixed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.setCode(recipient, "a1a2a3"));
            });
        });
        it("should not accept non-hex strings", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(hh.setCode(recipient, "g1g2g3"));
            });
        });
    });
});
