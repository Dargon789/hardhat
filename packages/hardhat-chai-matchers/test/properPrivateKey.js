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
describe("Proper private key", () => {
    it("Expect to be proper private key", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)("0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c5")
            .to.be.properPrivateKey;
        (0, chai_1.expect)("0x03c909455dcef4e1e981a21ffb14c1c51214906ce19e8e7541921b758221b5ae")
            .to.be.properPrivateKey;
    }));
    it("Expect not to be proper private key", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)("0x28FAA621c3348823D6c6548981a19716bcDc740").to.not.be
            .properPrivateKey;
        (0, chai_1.expect)("0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7cw")
            .to.not.be.properPrivateKey;
        (0, chai_1.expect)("0x03c909455dcef4e1e981a21ffb14c1c51214906ce19e8e7541921b758221b5-e")
            .to.not.be.properPrivateKey;
    }));
    it("Expect to throw if invalid private key", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c").to.be.properPrivateKey).to.throw(chai_1.AssertionError, 'Expected "0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c" to be a proper private key');
    }));
    it("Expect to throw if negation with proper private key", () => __awaiter(void 0, void 0, void 0, function* () {
        (0, chai_1.expect)(() => (0, chai_1.expect)("0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c5").not.to.be.properPrivateKey).to.throw(chai_1.AssertionError, 'Expected "0x706618637b8ca922f6290ce1ecd4c31247e9ab75cf0530a0ac95c0332173d7c5" NOT to be a proper private key');
    }));
});
