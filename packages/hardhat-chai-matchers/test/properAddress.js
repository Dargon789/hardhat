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
/* eslint-disable @typescript-eslint/no-unused-expressions */
describe("Proper address", () => {
    it("Expect to be proper address", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)("0x28FAA621c3348823D6c6548981a19716bcDc740e").to.be.properAddress;
        (0, chai_1.expect)("0x846C66cf71C43f80403B51fE3906B3599D63336f").to.be.properAddress;
    }));
    it("Expect not to be proper address", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)("28FAA621c3348823D6c6548981a19716bcDc740e").not.to.be.properAddress;
        (0, chai_1.expect)("0x28FAA621c3348823D6c6548981a19716bcDc740").to.not.be.properAddress;
        (0, chai_1.expect)("0x846C66cf71C43f80403B51fE3906B3599D63336g").to.not.be
            .properAddress;
        (0, chai_1.expect)("0x846C66cf71C43f80403B51fE3906B3599D6333-f").to.not.be
            .properAddress;
    }));
    it("Expect to throw if invalid address", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0x28FAA621c3348823D6c6548981a19716bcDc740").to.be.properAddress).to.throw(chai_1.AssertionError, 'Expected "0x28FAA621c3348823D6c6548981a19716bcDc740" to be a proper address');
    }));
    it("Expect to throw if negation with proper address", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0x28FAA621c3348823D6c6548981a19716bcDc740e").not.to.be
            .properAddress).to.throw(chai_1.AssertionError, 'Expected "0x28FAA621c3348823D6c6548981a19716bcDc740e" NOT to be a proper address');
    }));
});
