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
exports.tryUntil = exports.sleep = exports.assertIsSigner = exports.assertIsNotNull = exports.assertWithin = void 0;
const chai_1 = require("chai");
function assertWithin(value, min, max) {
    if (value < min || value > max) {
        chai_1.assert.fail(`Expected ${value} to be between ${min} and ${max}`);
    }
}
exports.assertWithin = assertWithin;
function assertIsNotNull(value) {
    chai_1.assert.isNotNull(value);
}
exports.assertIsNotNull = assertIsNotNull;
function assertIsSigner(value) {
    assertIsNotNull(value);
    chai_1.assert.isTrue("getAddress" in value);
    chai_1.assert.isTrue("signTransaction" in value);
}
exports.assertIsSigner = assertIsSigner;
const sleep = (timeout) => new Promise((resolve) => setTimeout(resolve, timeout));
exports.sleep = sleep;
function tryUntil(f) {
    return __awaiter(this, void 0, void 0, function* () {
        const maxTries = 20;
        let tries = 0;
        while (tries < maxTries) {
            try {
                yield f();
                return;
            }
            catch (_a) { }
            yield (0, exports.sleep)(50);
            tries++;
        }
        f();
    });
}
exports.tryUntil = tryUntil;
