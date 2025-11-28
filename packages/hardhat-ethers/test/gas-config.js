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
function generateCombinations() {
    const result = [];
    const hardhatGasLimitValues = ["default", "auto", 1000000];
    const localhostGasLimitValues = [
        "default",
        "auto",
        1000000,
    ];
    const connectedNetworkValues = ["hardhat", "localhost"];
    for (const hardhatGasLimit of hardhatGasLimitValues) {
        for (const localhostGasLimit of localhostGasLimitValues) {
            for (const connectedNetwork of connectedNetworkValues) {
                result.push({
                    hardhatGasLimit,
                    localhostGasLimit,
                    connectedNetwork,
                });
            }
        }
    }
    return result;
}
describe("gas config behavior", function () {
    for (const { hardhatGasLimit, localhostGasLimit, connectedNetwork, } of generateCombinations()) {
        describe(`hardhat gas limit: ${hardhatGasLimit} | localhostGasLimit: ${localhostGasLimit} | connectedNetwork: ${connectedNetwork}`, function () {
            (0, environment_1.useGeneratedEnvironment)(hardhatGasLimit, localhostGasLimit, connectedNetwork);
            // for some combinations there will be a default gas limit that is used
            // when no explicit gas limit is set by the user; in those cases, we
            // assert that the tx indeed uses that gas limit; if not, then
            // the result of an estimateGas call should be used
            let defaultGasLimit;
            if ((connectedNetwork === "hardhat" && hardhatGasLimit === 1000000) ||
                (connectedNetwork === "localhost" && localhostGasLimit === 1000000)) {
                defaultGasLimit = 1000000n;
            }
            else if ((connectedNetwork === "hardhat" && hardhatGasLimit === "default") ||
                (connectedNetwork === "localhost" && localhostGasLimit === "default")) {
                // expect the block gas limit to be used as the default gas limit
                defaultGasLimit = 30000000n;
            }
            it("plain transaction, default gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const expectedGasLimit = defaultGasLimit !== null && defaultGasLimit !== void 0 ? defaultGasLimit : 21001n;
                    const [signer] = yield this.env.ethers.getSigners();
                    const tx = yield signer.sendTransaction({
                        to: signer,
                    });
                    chai_1.assert.strictEqual(tx.gasLimit, expectedGasLimit);
                });
            });
            it("plain transaction, explicit gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [signer] = yield this.env.ethers.getSigners();
                    const tx = yield signer.sendTransaction({
                        to: signer,
                        gasLimit: 500000,
                    });
                    chai_1.assert.strictEqual(tx.gasLimit, 500000n);
                });
            });
            it("contract deployment, default gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const expectedGasLimit = defaultGasLimit !== null && defaultGasLimit !== void 0 ? defaultGasLimit : 76985n;
                    yield this.env.run("compile", { quiet: true });
                    const example = yield this.env.ethers.deployContract("Example");
                    const deploymentTx = yield example.deploymentTransaction();
                    chai_1.assert.strictEqual(deploymentTx.gasLimit, expectedGasLimit);
                });
            });
            it("contract deployment, explicit gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run("compile", { quiet: true });
                    const Example = yield this.env.ethers.getContractFactory("Example");
                    const example = yield Example.deploy({
                        gasLimit: 500000,
                    });
                    const deploymentTx = yield example.deploymentTransaction();
                    chai_1.assert.strictEqual(deploymentTx.gasLimit, 500000n);
                });
            });
            it("contract call, default gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const expectedGasLimit = defaultGasLimit !== null && defaultGasLimit !== void 0 ? defaultGasLimit : 21186n;
                    yield this.env.run("compile", { quiet: true });
                    const example = yield this.env.ethers.deployContract("Example");
                    const tx = yield example.f();
                    chai_1.assert.strictEqual(tx.gasLimit, expectedGasLimit);
                });
            });
            it("contract call, explicit gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run("compile", { quiet: true });
                    const example = yield this.env.ethers.deployContract("Example");
                    const tx = yield example.f({
                        gasLimit: 500000,
                    });
                    chai_1.assert.strictEqual(tx.gasLimit, 500000n);
                });
            });
        });
    }
});
