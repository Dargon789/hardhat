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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const task_names_2 = require("../../src/internal/task-names");
const helpers_1 = require("../helpers");
const etherscan_1 = require("./mocks/etherscan");
const sourcify_1 = require("./mocks/sourcify");
require("../../src/internal/type-extensions");
describe("verify task integration tests", () => {
    (0, helpers_1.useEnvironment)("hardhat-project");
    (0, etherscan_1.mockEnvironment)();
    // suppress sourcify info message
    let consoleInfoStub;
    before(() => {
        consoleInfoStub = sinon_1.default.stub(console, "info");
    });
    // suppress warnings
    after(() => {
        consoleInfoStub.restore();
    });
    it("should return after printing the supported networks", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const logStub = sinon_1.default.stub(console, "log");
            const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY, {
                listNetworks: true,
            });
            (0, chai_1.expect)(logStub).to.be.calledOnceWith(sinon_1.default.match(/Networks supported by hardhat-verify/));
            logStub.restore();
            chai_1.assert.isUndefined(taskResponse);
        });
    });
    it("should throw if the chain is hardhat", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const address = (0, helpers_1.getRandomAddress)(this.hre);
            // cleanup the etherscan config since we have hardhat defined as custom chain
            const originalConfig = this.hre.config.etherscan;
            this.hre.config.etherscan = {
                enabled: true,
                apiKey: "",
                customChains: [],
            };
            yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                address,
                constructorArgsParams: [],
            })).to.be.rejectedWith(/The selected network is "hardhat", which is not supported for contract verification./);
            this.hre.config.etherscan = originalConfig;
        });
    });
    describe("with a verified contract", () => {
        beforeEach(() => {
            (0, etherscan_1.interceptIsVerified)({ message: "OK", result: [{ SourceCode: "code" }] });
        });
        it("should return if the contract is already verified", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const logStub = sinon_1.default.stub(console, "log");
                const address = (0, helpers_1.getRandomAddress)(this.hre);
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address,
                    constructorArgsParams: [],
                });
                (0, chai_1.expect)(logStub).to.be.calledOnceWith(`The contract ${address} has already been verified on the block explorer. If you're trying to verify a partially verified contract, please use the --force flag.
https://hardhat.etherscan.io/address/${address}#code
`);
                logStub.restore();
                chai_1.assert.isUndefined(taskResponse);
            });
        });
    });
    describe("with a non-verified contract", () => {
        let simpleContractAddress;
        let duplicatedContractAddress;
        let normalLibAddress;
        let constructorLibAddress;
        let onlyNormalLibContractAddress;
        let bothLibsContractAddress;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_COMPILE, { force: true, quiet: true });
                simpleContractAddress = yield (0, helpers_1.deployContract)("SimpleContract", [], this.hre);
                duplicatedContractAddress = yield (0, helpers_1.deployContract)("contracts/DuplicatedContract.sol:DuplicatedContract", [], this.hre);
                normalLibAddress = yield (0, helpers_1.deployContract)("NormalLib", [], this.hre);
                constructorLibAddress = yield (0, helpers_1.deployContract)("ConstructorLib", [], this.hre);
                onlyNormalLibContractAddress = yield (0, helpers_1.deployContract)("OnlyNormalLib", [], this.hre, undefined, { libraries: { NormalLib: normalLibAddress } });
                bothLibsContractAddress = yield (0, helpers_1.deployContract)("BothLibs", [50], this.hre, undefined, {
                    libraries: {
                        NormalLib: normalLibAddress,
                        ConstructorLib: constructorLibAddress,
                    },
                });
            });
        });
        beforeEach(() => {
            (0, etherscan_1.interceptIsVerified)({ message: "NOTOK", result: "" });
        });
        it("should throw if there is no contract deployed at address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const address = (0, helpers_1.getRandomAddress)(this.hre);
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(new RegExp(`The address ${address} has no bytecode.`));
            });
        });
        describe("with overriden config", () => {
            let originalCompilers;
            it("should throw if the deployed contract version does not match the configured version", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    originalCompilers = this.hre.config.solidity.compilers;
                    this.hre.config.solidity.compilers = [
                        { version: "0.8.19", settings: {} },
                    ];
                    yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                        address: simpleContractAddress,
                        constructorArgsParams: [],
                    })).to.be.rejectedWith(/The contract you want to verify was compiled with solidity 0.7.5, but your configured compiler version is: 0.8.19./);
                });
            });
            afterEach(function () {
                this.hre.config.solidity.compilers = originalCompilers;
            });
        });
        describe("with deleted artifacts", () => {
            it("should throw if the artifacts are missing", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.hre.run(task_names_1.TASK_CLEAN);
                    // task will fail since we deleted all the artifacts
                    yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                        address: simpleContractAddress,
                        constructorArgsParams: [],
                    })).to.be.rejectedWith(/The address provided as argument contains a contract, but its bytecode doesn't match any of your local contracts./);
                    chai_1.assert.isFalse(fs_1.default.existsSync(path_1.default.join("artifacts", "contracts")));
                    chai_1.assert.isFalse(fs_1.default.existsSync(path_1.default.join("artifacts", "build-info")));
                });
            });
            after(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.hre.run(task_names_1.TASK_COMPILE, { force: true, quiet: true });
                });
            });
        });
        it("should throw if the deployed bytecode matches more than one contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: duplicatedContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/More than one contract was found to match the deployed bytecode./);
            });
        });
        it("should throw if the provided contract FQN does not match any contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFQN = "contracts/SimpleContract.sol:NotFound";
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    contract: contractFQN,
                })).to.be.rejectedWith(new RegExp(`The contract ${contractFQN} is not present in your project.`));
            });
        });
        it("should throw if there is an invalid address in the libraries parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    libraries: "invalid-libraries.js",
                })).to.be.rejectedWith("You gave a link for the contract SimpleContract with the library SomeLibrary, but provided this invalid address: notAnAddress");
            });
        });
        it("should throw if the specified library is not used by the contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: bothLibsContractAddress,
                    constructorArgsParams: [],
                    libraries: "not-used-libraries.js",
                })).to.be.rejectedWith(/You gave an address for the library SomeLibrary in the libraries dictionary, which is not one of the libraries of contract BothLibs./);
            });
        });
        it("should throw if the specified library is listed more than once in the libraries parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: onlyNormalLibContractAddress,
                    constructorArgsParams: [],
                    libraries: "duplicated-libraries.js",
                })).to.be.rejectedWith(/The library names NormalLib and contracts\/WithLibs.sol:NormalLib refer to the same library/);
            });
        });
        it("should throw if deployed library address does not match the address defined in the libraries parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: onlyNormalLibContractAddress,
                    constructorArgsParams: [],
                    libraries: "mismatched-address-libraries.js",
                })).to.be.rejectedWith(new RegExp(`NormalLib\ngiven address: 0x4B0d52f889e9a18506ee9412cd659abF48F8FEad\ndetected address: ${normalLibAddress.toLowerCase()}`));
            });
        });
        it("should throw if there are undetectable libraries not specified by the libraries parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: bothLibsContractAddress,
                    constructorArgsParams: [],
                    libraries: "missing-undetectable-libraries.js",
                })).to.be
                    .rejectedWith(`The contract contracts/WithLibs.sol:BothLibs has one or more library addresses that cannot be detected from deployed bytecode.
This can occur if the library is only called in the contract constructor. The missing libraries are:
  * contracts/WithLibs.sol:ConstructorLib
`);
            });
        });
        it("should throw if the verification request fails", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // do not intercept the verifysourcecode request so it throws an error
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/A network request failed\. This is an error from the block explorer, not Hardhat\. Error: getaddrinfo ENOTFOUND api-hardhat\.etherscan\.io/);
            });
        });
        it("should throw if the verification response has a non-OK status code", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({ error: "error verifying contract" }, 500);
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/Failed to send contract verification request\.\nEndpoint URL: https:\/\/api-hardhat\.etherscan\.io\/api\n/s);
            });
        });
        it("should throw if the etherscan api can't find the bytecode at the contract address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 0,
                    result: "Unable to locate ContractCode at 0x...",
                });
                try {
                    yield this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                        address: simpleContractAddress,
                        constructorArgsParams: [],
                    });
                    chai_1.assert.fail("Expected error was not thrown");
                }
                catch (e) {
                    chai_1.assert.match(e.message, new RegExp(`The Etherscan API responded that the address ${simpleContractAddress} does not have bytecode.`));
                }
            });
        });
        it("should throw if the verification response status is not ok", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 0,
                    result: "Failed to verify the contract...",
                });
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith("Failed to verify the contract...");
            });
        });
        it("should throw if the get verification status request fails", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                // do not intercept the checkverifystatus request so it throws an error
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/A network request failed\. This is an error from the block explorer, not Hardhat\. Error: getaddrinfo ENOTFOUND api-hardhat\.etherscan\.io/);
                (0, chai_1.expect)(logStub).to.be
                    .calledOnceWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
            });
        });
        it("should throw if the get verification status response has a non-OK status code", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)({ error: "error checking verification status" }, 500);
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(`The HTTP server response is not ok. Status code: 500 Response text: {"error":"error checking verification status"}`);
                (0, chai_1.expect)(logStub).to.be
                    .calledOnceWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
            });
        });
        it("should throw if the get verification status response status is not ok", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)({
                    status: 0,
                    result: "Failed to check verification status...",
                });
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/The Etherscan API responded with a failure status.\nThe verification may still succeed but should be checked manually./);
                (0, chai_1.expect)(logStub).to.be
                    .calledOnceWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
            });
        });
        it("should throw if the etherscan API response changes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)({
                    status: 1,
                    result: "a new API response",
                });
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                })).to.be.rejectedWith(/The API responded with an unexpected message./);
                (0, chai_1.expect)(logStub).to.be
                    .calledOnceWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
            });
        });
        it("should validate a contract using the minimal input", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)(() => {
                    return {
                        status: 1,
                        result: "Pass - Verified",
                    };
                });
                const logStub = sinon_1.default.stub(console, "log");
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                });
                chai_1.assert.equal(logStub.callCount, 2);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(1)).to.be
                    .calledWith(`Successfully verified contract SimpleContract on the block explorer.
https://hardhat.etherscan.io/address/${simpleContractAddress}#code\n`);
                logStub.restore();
                chai_1.assert.isUndefined(taskResponse);
            });
        });
        it("should validate a contract using the full build", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let verifyCallCount = 0;
                (0, etherscan_1.interceptVerify)(() => {
                    verifyCallCount++;
                    return {
                        status: 1,
                        result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                    };
                }).times(2);
                let getStatusCallCount = 0;
                (0, etherscan_1.interceptGetStatus)(() => {
                    getStatusCallCount++;
                    return {
                        status: getStatusCallCount > 1 ? 1 : 0,
                        result: getStatusCallCount > 1
                            ? "Pass - Verified"
                            : "Fail - Unable to verify",
                    };
                }).times(2);
                const logStub = sinon_1.default.stub(console, "log");
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                });
                chai_1.assert.equal(logStub.callCount, 4);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(1)).to.be
                    .calledWith(`We tried verifying your contract SimpleContract without including any unrelated one, but it failed.
Trying again with the full solc input used to compile and deploy it.
This means that unrelated contracts may be displayed on Etherscan...
`);
                (0, chai_1.expect)(logStub.getCall(2)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(3)).to.be
                    .calledWith(`Successfully verified contract SimpleContract on the block explorer.
https://hardhat.etherscan.io/address/${simpleContractAddress}#code\n`);
                logStub.restore();
                chai_1.assert.equal(verifyCallCount, 2);
                chai_1.assert.equal(getStatusCallCount, 2);
                chai_1.assert.isUndefined(taskResponse);
            });
        });
        it("should fail if it can't validate the contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let verifyCallCount = 0;
                (0, etherscan_1.interceptVerify)(() => {
                    verifyCallCount++;
                    return {
                        status: 1,
                        result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                    };
                }).times(2);
                let getStatusCallCount = 0;
                (0, etherscan_1.interceptGetStatus)(() => {
                    getStatusCallCount++;
                    return {
                        status: getStatusCallCount > 1 ? 1 : 0,
                        result: "Fail - Unable to verify",
                    };
                }).times(2);
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: bothLibsContractAddress,
                    constructorArgsParams: ["50"],
                    libraries: "libraries.js",
                })).to.be.rejectedWith(/The contract verification failed./);
                chai_1.assert.equal(logStub.callCount, 3);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/WithLibs.sol:BothLibs at ${bothLibsContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(1)).to.be
                    .calledWith(`We tried verifying your contract BothLibs without including any unrelated one, but it failed.
Trying again with the full solc input used to compile and deploy it.
This means that unrelated contracts may be displayed on Etherscan...
`);
                (0, chai_1.expect)(logStub.getCall(2)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/WithLibs.sol:BothLibs at ${bothLibsContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
                chai_1.assert.equal(verifyCallCount, 2);
                chai_1.assert.equal(getStatusCallCount, 2);
            });
        });
        it("should validate a contract using the verify:verify subtask", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)({
                    status: 1,
                    result: "Pass - Verified",
                });
                const logStub = sinon_1.default.stub(console, "log");
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY_VERIFY, {
                    address: bothLibsContractAddress,
                    constructorArguments: ["50"],
                    libraries: {
                        NormalLib: normalLibAddress,
                        ConstructorLib: constructorLibAddress,
                    },
                });
                chai_1.assert.equal(logStub.callCount, 2);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/WithLibs.sol:BothLibs at ${bothLibsContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(1)).to.be
                    .calledWith(`Successfully verified contract BothLibs on the block explorer.
https://hardhat.etherscan.io/address/${bothLibsContractAddress}#code\n`);
                logStub.restore();
                chai_1.assert.isUndefined(taskResponse);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_CLEAN);
            });
        });
    });
    describe("with a verified contract and '--force' flag", () => {
        let simpleContractAddress;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_COMPILE, { force: true, quiet: true });
                simpleContractAddress = yield (0, helpers_1.deployContract)("SimpleContract", [], this.hre);
            });
        });
        beforeEach(() => {
            (0, etherscan_1.interceptIsVerified)({ message: "OK", result: [{ SourceCode: "code" }] });
        });
        it("should validate a partially verified contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)(() => {
                    return {
                        status: 1,
                        result: "Pass - Verified",
                    };
                });
                const logStub = sinon_1.default.stub(console, "log");
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    force: true,
                });
                chai_1.assert.equal(logStub.callCount, 2);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                (0, chai_1.expect)(logStub.getCall(1)).to.be
                    .calledWith(`Successfully verified contract SimpleContract on the block explorer.
https://hardhat.etherscan.io/address/${simpleContractAddress}#code\n`);
                logStub.restore();
                chai_1.assert.isUndefined(taskResponse);
            });
        });
        it("should throw if the verification response status is 'already verified' (blockscout full matched)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 0,
                    result: "Smart-contract already verified.",
                });
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    force: true,
                })).to.be.rejectedWith(new RegExp(`The block explorer's API responded that the contract contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress} is already verified.`));
            });
        });
        // If contract was actually verified, Etherscan returns an error on the verification request.
        it("should throw if the verification response status is 'already verified' (etherscan manually verified)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 0,
                    result: "Contract source code already verified",
                });
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    force: true,
                })).to.be.rejectedWith(new RegExp(`The block explorer's API responded that the contract contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress} is already verified.`));
            });
        });
        // If contract was verified via matching a deployed bytecode of another contract,
        // Etherscan returns an error only on ve get verification status response.
        it("should throw if the get verification status is 'already verified' (etherscan automatically verified)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, etherscan_1.interceptVerify)({
                    status: 1,
                    result: "ezq878u486pzijkvvmerl6a9mzwhv6sefgvqi5tkwceejc7tvn",
                });
                (0, etherscan_1.interceptGetStatus)(() => {
                    return {
                        status: 0,
                        result: "Already Verified",
                    };
                });
                const logStub = sinon_1.default.stub(console, "log");
                yield (0, chai_1.expect)(this.hre.run(task_names_2.TASK_VERIFY_ETHERSCAN, {
                    address: simpleContractAddress,
                    constructorArgsParams: [],
                    force: true,
                })).to.be.rejectedWith(new RegExp(`The block explorer's API responded that the contract contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress} is already verified.`));
                (0, chai_1.expect)(logStub).to.be
                    .calledOnceWith(`Successfully submitted source code for contract
contracts/SimpleContract.sol:SimpleContract at ${simpleContractAddress}
for verification on the block explorer. Waiting for verification result...
`);
                logStub.restore();
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_CLEAN);
            });
        });
    });
});
describe("verify task Sourcify's integration tests", () => {
    (0, helpers_1.useEnvironment)("hardhat-project");
    (0, sourcify_1.mockEnvironmentSourcify)();
    describe("with a non-verified contract", () => {
        let simpleContractAddress;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_COMPILE, { force: true, quiet: true });
                simpleContractAddress = yield (0, helpers_1.deployContract)("SimpleContract", [], this.hre);
            });
        });
        it("should verify a contract on Sourcify", function () {
            return __awaiter(this, void 0, void 0, function* () {
                (0, sourcify_1.interceptSourcifyIsVerified)([
                    { address: simpleContractAddress, status: "false" },
                ]);
                (0, sourcify_1.interceptSourcifyVerify)({
                    result: [
                        {
                            address: simpleContractAddress,
                            status: "perfect",
                        },
                    ],
                });
                const logStub = sinon_1.default.stub(console, "log");
                // set network name to localhost to avoid the "hardhat is not supported" error
                this.hre.network.name = "localhost";
                const taskResponse = yield this.hre.run(task_names_2.TASK_VERIFY_SOURCIFY, {
                    address: simpleContractAddress,
                    contract: "contracts/SimpleContract.sol:SimpleContract",
                });
                chai_1.assert.equal(logStub.callCount, 1);
                (0, chai_1.expect)(logStub.getCall(0)).to.be
                    .calledWith(`Successfully verified contract SimpleContract on Sourcify.
https://repo.sourcify.dev/contracts/full_match/31337/${simpleContractAddress}/
`);
                logStub.restore();
                chai_1.assert.isUndefined(taskResponse);
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_CLEAN);
            });
        });
    });
});
