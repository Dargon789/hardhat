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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const environment_1 = require("./environment");
(0, chai_1.use)(chai_as_promised_1.default);
describe("error messages", function () {
    describe("in-process hardhat network", function () {
        (0, environment_1.useEnvironment)("error-messages", "hardhat");
        runTests();
    });
    describe("hardhat node", function () {
        (0, environment_1.useEnvironment)("error-messages", "localhost");
        runTests();
    });
});
function runTests() {
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.env.run("compile", {
                quiet: true,
            });
        });
    });
    it("should return the right error message for a transaction that reverts with a reason string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield this.env.ethers.deployContract("Contract");
            yield chai_1.assert.isRejected(contract.revertsWithReasonString(), "reverted with reason string 'some reason'");
        });
    });
    it("should return the right error message for a transaction that reverts without a reason string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield this.env.ethers.deployContract("Contract");
            yield chai_1.assert.isRejected(contract.revertsWithoutReasonString(), "reverted without a reason string");
        });
    });
    it("should return the right error message for a transaction that reverts with an OOO", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = yield this.env.ethers.deployContract("Contract");
            yield chai_1.assert.isRejected(contract.succeeds({
                gasLimit: 21064,
            }), "ran out of gas");
        });
    });
}
