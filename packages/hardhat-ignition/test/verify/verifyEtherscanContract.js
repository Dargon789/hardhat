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
const verifyEtherscanContract_1 = require("../../src/utils/verifyEtherscanContract");
describe("verifyEtherscanContract", function () {
    let etherscanInstance;
    const contractInfo = {
        address: "0x123",
        compilerVersion: "v0.8.0",
        sourceCode: "sourceCode",
        name: "name",
        args: "args",
    };
    beforeEach(function () {
        etherscanInstance = {
            verify: () => __awaiter(this, void 0, void 0, function* () { return ({ message: "guid" }); }),
            getVerificationStatus: () => __awaiter(this, void 0, void 0, function* () {
                return ({
                    isSuccess: () => true,
                    message: "message",
                });
            }),
            getContractUrl: () => "url",
        };
    });
    it("should return a success object when verification succeeds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield (0, verifyEtherscanContract_1.verifyEtherscanContract)(etherscanInstance, contractInfo);
            chai_1.assert.deepEqual(result, {
                type: "success",
                contractURL: "url",
            });
        });
    });
    it("should return a failure object when verification is not successful", function () {
        return __awaiter(this, void 0, void 0, function* () {
            etherscanInstance.getVerificationStatus = () => __awaiter(this, void 0, void 0, function* () {
                return ({
                    isSuccess: () => false,
                    message: "message",
                });
            });
            const result = yield (0, verifyEtherscanContract_1.verifyEtherscanContract)(etherscanInstance, contractInfo);
            chai_1.assert.deepEqual(result, {
                type: "failure",
                reason: new Error("message"),
            });
        });
    });
});
