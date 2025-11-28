"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const utils_1 = require("../../src/internal/utils");
describe("toHex", () => {
    it("should append 0x to the supplied string value", () => {
        chai_1.assert.equal((0, utils_1.toHex)("123"), "0x123");
    });
    it("should not append 0x if the supplied string value already has it", () => {
        chai_1.assert.equal((0, utils_1.toHex)("0x123"), "0x123");
    });
    it("should return the 0x hex representation of the Buffer", () => {
        // "736f6d6520737472696e67".toString("hex") === "736f6d6520737472696e67"
        chai_1.assert.equal((0, utils_1.toHex)(Buffer.from("some string", "utf8")), "0x736f6d6520737472696e67");
    });
});
