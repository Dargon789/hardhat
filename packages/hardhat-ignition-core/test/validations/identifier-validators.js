"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const identifier_validators_1 = require("../../src/internal/utils/identifier-validators");
describe("isValidFunctionOrEventName", () => {
    it("should return true for valid solidity function names", () => {
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("a"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("aa"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("a1"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction()"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction123()"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256)"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256)"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256,bool)"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256[])"));
        chai_1.assert.isTrue((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256[],bool)"));
    });
    it("should return false for invalid solidity function names", () => {
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("1"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("11"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("123myFunction"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction("));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint)256"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("myFunction(uint256"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("myFunctionuint256)"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("(uint256)"));
        chai_1.assert.isFalse((0, identifier_validators_1.isValidFunctionOrEventName)("123(uint256)"));
    });
});
