"use strict";
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
require("../src/internal/add-chai-matchers");
describe("UNIT: hexEqual", () => {
    it("0xAB equals 0xab", () => {
        (0, chai_1.expect)("0xAB").to.hexEqual("0xab");
    });
    it("0xAB does not equal 0xabc", () => {
        (0, chai_1.expect)("0xAB").to.not.hexEqual("0xabc");
    });
    it("0x0010ab equals 0x000010ab", () => {
        (0, chai_1.expect)("0x0010ab").to.hexEqual("0x000010ab");
    });
    it("0x0000010AB does not equal 0x0010abc", () => {
        (0, chai_1.expect)("0x0000010AB").to.not.hexEqual("0x0010abc");
    });
    it("0x edge case", () => {
        (0, chai_1.expect)("0x").to.hexEqual("0x000000");
    });
    it("abc is not a hex string", () => {
        (0, chai_1.expect)(() => (0, chai_1.expect)("abc").to.hexEqual("0xabc")).to.throw(chai_1.AssertionError, 'Expected "abc" to be a hex string equal to "0xabc", but "abc" is not a valid hex string');
        (0, chai_1.expect)(() => (0, chai_1.expect)("0xabc").to.hexEqual("abc")).to.throw(chai_1.AssertionError, 'Expected "0xabc" to be a hex string equal to "abc", but "abc" is not a valid hex string');
        (0, chai_1.expect)(() => (0, chai_1.expect)("abc").to.not.hexEqual("0xabc")).to.throw(chai_1.AssertionError, 'Expected "abc" not to be a hex string equal to "0xabc", but "abc" is not a valid hex string');
        (0, chai_1.expect)(() => (0, chai_1.expect)("0xabc").to.not.hexEqual("abc")).to.throw(chai_1.AssertionError, 'Expected "0xabc" not to be a hex string equal to "abc", but "abc" is not a valid hex string');
    });
    it("xyz is not a hex string", () => {
        (0, chai_1.expect)(() => (0, chai_1.expect)("xyz").to.hexEqual("0x1A4")).to.throw(chai_1.AssertionError, 'Expected "xyz" to be a hex string equal to "0x1A4", but "xyz" is not a valid hex string');
    });
    it("0xyz is not a hex string", () => {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0xyz").to.hexEqual("0x1A4")).to.throw(chai_1.AssertionError, 'Expected "0xyz" to be a hex string equal to "0x1A4", but "0xyz" is not a valid hex string');
    });
    it("empty string is not a hex string", () => {
        (0, chai_1.expect)(() => (0, chai_1.expect)("").to.hexEqual("0x0")).to.throw(chai_1.AssertionError, 'Expected "" to be a hex string equal to "0x0", but "" is not a valid hex string');
    });
    it("correct error when strings are not equal", function () {
        return __awaiter(this, void 0, void 0, function* () {
            (0, chai_1.expect)(() => (0, chai_1.expect)("0xa").to.hexEqual("0xb")).to.throw(chai_1.AssertionError, 'Expected "0xa" to be a hex string equal to "0xb"');
        });
    });
    it("correct error when strings are equal but expected not to", function () {
        return __awaiter(this, void 0, void 0, function* () {
            (0, chai_1.expect)(() => (0, chai_1.expect)("0xa").not.to.hexEqual("0xa")).to.throw(chai_1.AssertionError, 'Expected "0xa" NOT to be a hex string equal to "0xa", but it was');
        });
    });
});
