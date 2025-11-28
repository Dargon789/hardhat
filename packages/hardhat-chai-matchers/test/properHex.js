"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
require("../src/internal/add-chai-matchers");
describe("properHex", function () {
    it("should handle a successful positive case", function () {
        (0, chai_1.expect)("0xAB").to.be.properHex(2);
    });
    it("should handle a successful negative case", function () {
        (0, chai_1.expect)("0xab").to.not.be.properHex(3);
    });
    it("should handle a positive case failing because of an invalid length", function () {
        const input = "0xABCDEF";
        const length = 99;
        (0, chai_1.expect)(() => (0, chai_1.expect)(input).to.be.properHex(length)).to.throw(chai_1.AssertionError, `Expected "${input}" to be a hex string of length ${length + 2} (the provided ${length} plus 2 more for the "0x" prefix), but its length is ${input.length}`);
    });
    it("should handle a positive case failing because of an invalid hex value", function () {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0xABCDEFG").to.be.properHex(8)).to.throw(chai_1.AssertionError, 'Expected "0xABCDEFG" to be a proper hex string, but it contains invalid (non-hex) characters');
    });
    it("should handle a negative case failing because of a valid length", function () {
        const input = "0xab";
        const length = 2;
        (0, chai_1.expect)(() => (0, chai_1.expect)(input).to.not.be.properHex(length)).to.throw(chai_1.AssertionError, `Expected "${input}" NOT to be a hex string of length ${length + 2} (the provided ${length} plus 2 more for the "0x" prefix), but its length is ${input.length}`);
    });
    it("should handle a negative case failing because of an invalid hex value", function () {
        const input = "0xabcdefg";
        (0, chai_1.expect)(() => (0, chai_1.expect)(input).to.not.be.properHex(8)).to.throw(chai_1.AssertionError, `Expected "${input}" NOT to be a proper hex string, but it contains only valid hex characters`);
    });
});
