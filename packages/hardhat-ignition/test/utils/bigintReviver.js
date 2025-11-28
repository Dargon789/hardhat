"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const bigintReviver_1 = require("../../src/utils/bigintReviver");
describe("bigintReviver", function () {
    it('should convert number strings ending with "n" to BigInt', function () {
        chai_1.assert.deepEqual(JSON.parse('{"a":"1n"}', bigintReviver_1.bigintReviver), { a: BigInt(1) });
    });
    it("should throw if a number is bigger than Number.MAX_SAFE_INTEGER", function () {
        chai_1.assert.throws(() => {
            JSON.parse('{"a":9007199254740992}', bigintReviver_1.bigintReviver);
        }, `Parameter "a" exceeds maximum safe integer size. Encode the value as a string using bigint notation: \`$\{value\}n\``);
    });
    it("should not convert regular numbers", function () {
        chai_1.assert.deepEqual(JSON.parse('{"a":1}', bigintReviver_1.bigintReviver), { a: 1 });
    });
});
