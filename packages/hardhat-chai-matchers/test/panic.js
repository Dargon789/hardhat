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
const ethers_1 = require("ethers");
const panic_1 = require("../src/internal/reverted/panic");
describe("panic codes", function () {
    it("all exported panic codes should have a description", function () {
        return __awaiter(this, void 0, void 0, function* () {
            for (const [key, code] of Object.entries(panic_1.PANIC_CODES)) {
                const description = (0, panic_1.panicErrorCodeToReason)((0, ethers_1.toBigInt)(code));
                chai_1.assert.isDefined(description, `No description for panic code ${key}`);
            }
        });
    });
});
