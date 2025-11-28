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
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const build_module_1 = require("../src/build-module");
describe("buildModule", () => {
    describe("error handling", () => {
        it("should error on passing async callback", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("AsyncModule", (() => __awaiter(this, void 0, void 0, function* () { }))), /The callback passed to 'buildModule' for AsyncModule returns a Promise; async callbacks are not allowed in 'buildModule'./);
            });
        });
        it("should error on module throwing an exception", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.throws(() => (0, build_module_1.buildModule)("AsyncModule", () => {
                    throw new Error("User thrown error");
                }), /User thrown error/);
            });
        });
    });
});
