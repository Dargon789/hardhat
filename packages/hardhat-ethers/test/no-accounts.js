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
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const signers_1 = require("../src/signers");
const environment_1 = require("./environment");
describe("hardhat-ethers plugin", function () {
    describe("hardhat network with no accounts", function () {
        (0, environment_1.useEnvironment)("hardhat-project-no-accounts", "hardhat");
        describe("fixture setup", function () {
            it("should not have accounts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const signers = yield this.env.ethers.getSigners();
                    chai_1.assert.isEmpty(signers);
                });
            });
        });
        describe("getContractAt", function () {
            const signerAddress = "0x1010101010101010101010101010101010101010";
            beforeEach(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.network.provider.send("hardhat_setBalance", [
                        signerAddress,
                        "0x1000000000000000000",
                    ]);
                    yield this.env.run(task_names_1.TASK_COMPILE, { quiet: true });
                });
            });
            describe("with the name and address", function () {
                it("Should return an instance of a contract with a read-only provider", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const receipt = yield deployGreeter(this.env, signerAddress);
                        if (receipt === null) {
                            chai_1.assert.fail("receipt shoudn't be null");
                        }
                        if (receipt.contractAddress === null) {
                            chai_1.assert.fail("receipt.contractAddress shoudn't be null");
                        }
                        const contract = yield this.env.ethers.getContractAt("Greeter", receipt.contractAddress);
                        chai_1.assert.isDefined(contract.runner);
                        chai_1.assert.isNotNull(contract.runner);
                        const greeting = yield contract.greet();
                        chai_1.assert.strictEqual(greeting, "Hi");
                    });
                });
            });
            describe("with the abi and address", function () {
                it("Should return an instance of a contract with a read-only provider", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const receipt = yield deployGreeter(this.env, signerAddress);
                        if (receipt === null) {
                            chai_1.assert.fail("receipt shoudn't be null");
                        }
                        if (receipt.contractAddress === null) {
                            chai_1.assert.fail("receipt.contractAddress shoudn't be null");
                        }
                        const signers = yield this.env.ethers.getSigners();
                        chai_1.assert.isEmpty(signers);
                        const greeterArtifact = yield this.env.artifacts.readArtifact("Greeter");
                        const contract = yield this.env.ethers.getContractAt(greeterArtifact.abi, receipt.contractAddress);
                        chai_1.assert.isDefined(contract.runner);
                        chai_1.assert.isNotNull(contract.runner);
                        const greeting = yield contract.greet();
                        chai_1.assert.strictEqual(greeting, "Hi");
                    });
                });
            });
        });
        describe("getSigner", function () {
            it("should return a valid signer for an arbitrary account", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const address = "0x5dA8b30645FAc04eCBC25987A2DFDFa49575945b";
                    const signers = yield this.env.ethers.getSigners();
                    chai_1.assert.isTrue(signers.every((aSigner) => aSigner.address !== address));
                    const signer = yield this.env.ethers.getSigner(address);
                    // We need an as any here because the type of instanceOf expects a public constructor
                    chai_1.assert.instanceOf(signer, signers_1.HardhatEthersSigner);
                    chai_1.assert.strictEqual(signer.address, address);
                });
            });
        });
    });
});
function deployGreeter(hre, signerAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const Greeter = yield hre.ethers.getContractFactory("Greeter");
        const tx = yield Greeter.getDeployTransaction();
        tx.from = signerAddress;
        yield hre.network.provider.request({
            method: "hardhat_impersonateAccount",
            params: [signerAddress],
        });
        const txHash = (yield hre.network.provider.request({
            method: "eth_sendTransaction",
            params: [tx],
        }));
        yield hre.network.provider.request({
            method: "hardhat_stopImpersonatingAccount",
            params: [signerAddress],
        });
        chai_1.assert.isDefined(hre.ethers.provider);
        const receipt = yield hre.ethers.provider.getTransactionReceipt(txHash);
        if (receipt === null) {
            chai_1.assert.fail("receipt shoudn't be null");
        }
        chai_1.assert.strictEqual(receipt.status, 1, "The deployment transaction failed.");
        return receipt;
    });
}
