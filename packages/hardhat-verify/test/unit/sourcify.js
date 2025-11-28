"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sourcify_1 = require("../../src/sourcify");
const sourcify_types_1 = require("../../src/internal/sourcify.types");
describe("Sourcify", () => {
    const chainId = 100;
    describe("getContractUrl", () => {
        it("should return the contract url", () => {
            const expectedContractAddress = "https://repo.sourcify.dev/contracts/full_match/100/0xC4c622862a8F548997699bE24EA4bc504e5cA865/";
            const sourcify = new sourcify_1.Sourcify(chainId, "https://sourcify.dev/server", "https://repo.sourcify.dev");
            const contractUrl = sourcify.getContractUrl("0xC4c622862a8F548997699bE24EA4bc504e5cA865", sourcify_types_1.ContractStatus.PERFECT);
            chai_1.assert.equal(contractUrl, expectedContractAddress);
        });
    });
});
