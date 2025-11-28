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
const helpers_1 = require("./helpers");
describe("hardhat-toolbox-viem", function () {
    describe("only-toolbox", function () {
        (0, helpers_1.useEnvironment)("only-toolbox");
        it("has all the expected things in the HRE", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run("run", {
                    noCompile: true,
                    script: "script.js",
                });
                chai_1.assert.equal(process.exitCode, 0);
            });
        });
    });
    describe("hardhat-gas-reporter-config", function () {
        (0, helpers_1.useEnvironment)("with-gas-reporter-config");
        it("Should not crash while loading the HRE", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.isDefined(this.env, "The environment should be loaded");
            });
        });
    });
});
