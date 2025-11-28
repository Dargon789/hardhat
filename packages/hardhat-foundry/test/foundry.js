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
const foundry_1 = require("../src/foundry");
describe("foundry module", function () {
    describe("parseRemappings", function () {
        it("should parse simple remappings", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const remappings = (0, foundry_1.parseRemappings)("a=b\nb=c\nc=d");
                (0, chai_1.expect)(remappings).to.deep.equal({
                    a: "b",
                    b: "c",
                    c: "d",
                });
            });
        });
        it("should throw if a remapping has a context", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, chai_1.expect)(() => (0, foundry_1.parseRemappings)("a:b=c")).to.throw("Invalid remapping 'a:b=c', remapping contexts are not allowed");
            });
        });
        it("should throw if a remapping doesn't have a target", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, chai_1.expect)(() => (0, foundry_1.parseRemappings)("a")).to.throw("Invalid remapping 'a', remappings without a target are not allowed");
            });
        });
        it("should use the first remapping if more than one has the same prefix", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const remappings = (0, foundry_1.parseRemappings)("a=b\na=c");
                (0, chai_1.expect)(remappings).to.deep.equal({
                    a: "b",
                });
            });
        });
        it("should ignore empty lines", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const remappings = (0, foundry_1.parseRemappings)("a=b\n\nb=c");
                (0, chai_1.expect)(remappings).to.deep.equal({
                    a: "b",
                    b: "c",
                });
            });
        });
    });
});
