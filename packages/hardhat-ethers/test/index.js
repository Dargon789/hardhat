"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chai_1 = __importStar(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const ethers_1 = require("ethers");
const plugins_1 = require("hardhat/plugins");
const environment_1 = require("./environment");
const helpers_1 = require("./helpers");
chai_1.default.use(chai_as_promised_1.default);
describe("Ethers plugin", function () {
    describe("hardhat node", function () {
        (0, environment_1.useEnvironment)("hardhat-project", "localhost");
        describe("HRE extensions", function () {
            it("should extend hardhat runtime environment", function () {
                chai_1.assert.isDefined(this.env.ethers);
                chai_1.assert.containsAllKeys(this.env.ethers, [
                    "provider",
                    "getSigners",
                    "getImpersonatedSigner",
                    "getContractFactory",
                    "getContractAt",
                    ...Object.keys(ethers_1.ethers),
                ]);
            });
        });
        describe("Provider", function () {
            it("the provider should handle requests", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const accounts = yield this.env.ethers.provider.send("eth_accounts", []);
                    chai_1.assert.strictEqual(accounts[0], "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
                });
            });
        });
        describe("Signers and contracts helpers", function () {
            let signers;
            let greeterArtifact;
            let iGreeterArtifact;
            beforeEach(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    signers = yield this.env.ethers.getSigners();
                    yield this.env.run("compile", { quiet: true });
                    greeterArtifact = yield this.env.artifacts.readArtifact("Greeter");
                    iGreeterArtifact = yield this.env.artifacts.readArtifact("IGreeter");
                });
            });
            describe("getSigners", function () {
                it("should return the signers", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const sigs = yield this.env.ethers.getSigners();
                        chai_1.assert.strictEqual(yield sigs[0].getAddress(), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                    });
                });
                it("should expose the address synchronously", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const sigs = yield this.env.ethers.getSigners();
                        chai_1.assert.strictEqual(sigs[0].address, "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                    });
                });
                it("should return an empty array of signers if `eth_accounts` is deprecated", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const originalSend = this.env.ethers.provider.send;
                        this.env.ethers.provider.send = function (method, params) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (method === "eth_accounts") {
                                    throw new Error("the method has been deprecated: eth_accounts");
                                }
                                return originalSend.call(this, method, params);
                            });
                        };
                        const sigs = yield this.env.ethers.getSigners();
                        chai_1.assert.deepStrictEqual(sigs, []);
                    });
                });
            });
            describe("getImpersonatedSigner", function () {
                it("should return the working impersonated signer", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [signer] = yield this.env.ethers.getSigners();
                        const randomAddress = `0xe7d45f52130a5634f19346a3e5d32994ad821750`;
                        const impersonatedSigner = yield this.env.ethers.getImpersonatedSigner(randomAddress);
                        chai_1.assert.strictEqual(impersonatedSigner.address.toLowerCase(), randomAddress);
                        // fund impersonated account
                        yield signer.sendTransaction({
                            to: impersonatedSigner,
                            value: 10n ** 18n,
                        });
                        // send a tx from impersonated account
                        yield impersonatedSigner.sendTransaction({
                            to: this.env.ethers.ZeroAddress,
                            value: 10n ** 17n,
                        });
                    });
                });
            });
            describe("signer", function () {
                it("should sign a message", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const result = yield sig.signMessage("hello");
                        chai_1.assert.strictEqual(result, "0xf16ea9a3478698f695fd1401bfe27e9e4a7e8e3da94aa72b021125e31fa899cc573c48ea3fe1d4ab61a9db10c19032026e3ed2dbccba5a178235ac27f94504311c");
                    });
                });
                it("should throw when sign a transaction", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        const tx = yield Greeter.getDeployTransaction();
                        yield chai_1.assert.isRejected(sig.signTransaction(tx));
                    });
                });
                // `signer.getBalance` is not present in ethers v6; we should re-enable
                // this test when/if it's added back
                it.skip("should return the balance of the account", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        chai_1.assert.strictEqual(
                        // @ts-expect-error
                        (yield sig.getBalance()).toString(), "100000000000000000000");
                    });
                });
                it("should return the balance of the account", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        // we use the second signer because the first one is used in previous tests
                        const [, secondSigner] = yield this.env.ethers.getSigners();
                        chai_1.assert.strictEqual(yield this.env.ethers.provider.getBalance(secondSigner), 10000n * 10n ** 18n);
                    });
                });
                it("should return the transaction count of the account", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        // we use the second signer because the first one is used in previous tests
                        const [, secondSigner] = yield this.env.ethers.getSigners();
                        chai_1.assert.strictEqual(yield this.env.ethers.provider.getTransactionCount(secondSigner), 0);
                    });
                });
                it("should allow to use the estimateGas method", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        const tx = yield Greeter.getDeployTransaction();
                        const result = yield sig.estimateGas(tx);
                        chai_1.assert.isTrue(result > 0n);
                    });
                });
                it("should allow to use the call method", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        const tx = yield Greeter.getDeployTransaction();
                        const result = yield sig.call(tx);
                        chai_1.assert.isString(result);
                    });
                });
                it("should send a transaction", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        const tx = yield Greeter.getDeployTransaction();
                        const response = yield sig.sendTransaction(tx);
                        const receipt = yield response.wait();
                        if (receipt === null) {
                            chai_1.assert.fail("receipt shoudn't be null");
                        }
                        chai_1.assert.strictEqual(receipt.status, 1);
                    });
                });
                it("should get the chainId", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { chainId } = yield this.env.ethers.provider.getNetwork();
                        chai_1.assert.strictEqual(chainId, 31337n);
                    });
                });
                it("should get the gas price", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const feeData = yield this.env.ethers.provider.getFeeData();
                        (0, helpers_1.assertIsNotNull)(feeData.gasPrice);
                        chai_1.assert.isTrue(feeData.gasPrice > 0);
                    });
                });
                it("should populate a transaction", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const [sig] = yield this.env.ethers.getSigners();
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        const tx = yield Greeter.getDeployTransaction();
                        const populatedTransaction = yield sig.populateTransaction(tx);
                        chai_1.assert.strictEqual(populatedTransaction.from, sig.address);
                    });
                });
            });
            describe("getContractFactory", function () {
                describe("By name", function () {
                    it("should return a contract factory", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            // It's already compiled in artifacts/
                            const contract = yield this.env.ethers.getContractFactory("Greeter");
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                            // non-existent functions should be null
                            chai_1.assert.isNull(contract.interface.getFunction("doesntExist"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("should fail to return a contract factory for an interface", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield this.env.ethers.getContractFactory("IGreeter");
                            }
                            catch (reason) {
                                chai_1.assert.instanceOf(reason, plugins_1.NomicLabsHardhatPluginError, "getContractFactory should fail with a hardhat plugin error");
                                chai_1.assert.isTrue(reason.message.includes("is abstract and can't be deployed"), "getContractFactory should report the abstract contract as the cause");
                                return;
                            }
                            // The test shouldn't reach this point.
                            chai_1.assert.fail("getContractFactory should fail with an abstract contract");
                        });
                    });
                    it("should link a library", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("TestLibrary");
                            const library = yield libraryFactory.deploy();
                            const contractFactory = yield this.env.ethers.getContractFactory("TestContractLib", {
                                libraries: { TestLibrary: library.target },
                            });
                            (0, helpers_1.assertIsSigner)(contractFactory.runner);
                            chai_1.assert.strictEqual(yield contractFactory.runner.getAddress(), yield signers[0].getAddress());
                            const numberPrinter = yield contractFactory.deploy();
                            const someNumber = 50n;
                            chai_1.assert.strictEqual(yield numberPrinter.printNumber.staticCall(someNumber), someNumber * 2n);
                        });
                    });
                    it("should fail to link when passing in an ambiguous library link", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("contracts/TestContractLib.sol:TestLibrary");
                            const library = yield libraryFactory.deploy();
                            try {
                                yield this.env.ethers.getContractFactory("TestContractLib", {
                                    libraries: {
                                        TestLibrary: yield library.getAddress(),
                                        "contracts/TestContractLib.sol:TestLibrary": yield library.getAddress(),
                                    },
                                });
                            }
                            catch (reason) {
                                chai_1.assert.instanceOf(reason, plugins_1.NomicLabsHardhatPluginError, "getContractFactory should fail with a hardhat plugin error");
                                chai_1.assert.isTrue(reason.message.includes("refer to the same library and were given as two separate library links"), "getContractFactory should report the ambiguous link as the cause");
                                chai_1.assert.isTrue(reason.message.includes("TestLibrary and contracts/TestContractLib.sol:TestLibrary"), "getContractFactory should display the ambiguous library links");
                                return;
                            }
                            // The test shouldn't reach this point
                            chai_1.assert.fail("getContractFactory should fail when the link for one library is ambiguous");
                        });
                    });
                    it("should link a library even if there's an identically named library in the project", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("contracts/TestNonUniqueLib.sol:NonUniqueLibrary");
                            const library = yield libraryFactory.deploy();
                            const contractFactory = yield this.env.ethers.getContractFactory("TestNonUniqueLib", { libraries: { NonUniqueLibrary: yield library.getAddress() } });
                            (0, helpers_1.assertIsSigner)(contractFactory.runner);
                            chai_1.assert.strictEqual(yield contractFactory.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("should fail to link an ambiguous library", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("contracts/AmbiguousLibrary.sol:AmbiguousLibrary");
                            const library = yield libraryFactory.deploy();
                            const library2Factory = yield this.env.ethers.getContractFactory("contracts/AmbiguousLibrary2.sol:AmbiguousLibrary");
                            const library2 = yield library2Factory.deploy();
                            try {
                                yield this.env.ethers.getContractFactory("TestAmbiguousLib", {
                                    libraries: {
                                        AmbiguousLibrary: yield library.getAddress(),
                                        "contracts/AmbiguousLibrary2.sol:AmbiguousLibrary": yield library2.getAddress(),
                                    },
                                });
                            }
                            catch (reason) {
                                if (!(reason instanceof plugins_1.NomicLabsHardhatPluginError)) {
                                    chai_1.assert.fail("getContractFactory should fail with a hardhat plugin error");
                                }
                                chai_1.assert.isTrue(reason.message.includes("is ambiguous for the contract"), "getContractFactory should report the ambiguous name resolution as the cause");
                                chai_1.assert.isTrue(reason.message.includes("AmbiguousLibrary.sol:AmbiguousLibrary") &&
                                    reason.message.includes("AmbiguousLibrary2.sol:AmbiguousLibrary"), "getContractFactory should enumerate both available library name candidates");
                                return;
                            }
                            // The test shouldn't reach this point
                            chai_1.assert.fail("getContractFactory should fail to retrieve an ambiguous library name");
                        });
                    });
                    it("should fail to create a contract factory with missing libraries", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            try {
                                yield this.env.ethers.getContractFactory("TestContractLib");
                            }
                            catch (reason) {
                                chai_1.assert.instanceOf(reason, plugins_1.NomicLabsHardhatPluginError, "getContractFactory should fail with a hardhat plugin error");
                                chai_1.assert.isTrue(reason.message.includes("missing links for the following libraries"), "getContractFactory should report the missing libraries as the cause");
                                chai_1.assert.isTrue(reason.message.includes("TestContractLib.sol:TestLibrary"), "getContractFactory should enumerate missing library names");
                                return;
                            }
                            // The test shouldn't reach this point
                            chai_1.assert.fail("getContractFactory should fail to create a contract factory if there are missing libraries");
                        });
                    });
                    it("should fail to create a contract factory with an invalid address", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const notAnAddress = "definitely not an address";
                            try {
                                yield this.env.ethers.getContractFactory("TestContractLib", {
                                    libraries: { TestLibrary: notAnAddress },
                                });
                            }
                            catch (reason) {
                                chai_1.assert.instanceOf(reason, plugins_1.NomicLabsHardhatPluginError, "getContractFactory should fail with a hardhat plugin error");
                                chai_1.assert.isTrue(reason.message.includes("invalid address"), "getContractFactory should report the invalid address as the cause");
                                chai_1.assert.isTrue(reason.message.includes(notAnAddress), "getContractFactory should display the invalid address");
                                return;
                            }
                            // The test shouldn't reach this point
                            chai_1.assert.fail("getContractFactory should fail to create a contract factory if there is an invalid address");
                        });
                    });
                    it("should contract instances as libraries", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("TestLibrary");
                            const library = yield libraryFactory.deploy();
                            yield this.env.ethers.getContractFactory("TestContractLib", {
                                libraries: { TestLibrary: library },
                            });
                        });
                    });
                    it("Should be able to send txs and make calls", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                            const greeter = yield Greeter.deploy();
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                            yield greeter.setGreeting("Hola");
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                        });
                    });
                    describe("with hardhat's signer", function () {
                        it("should return a contract factory connected to the hardhat's signer", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                // It's already compiled in artifacts/
                                const contract = yield this.env.ethers.getContractFactory("Greeter", signers[1]);
                                chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                                chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                                (0, helpers_1.assertIsSigner)(contract.runner);
                                chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                            });
                        });
                    });
                });
                describe("by abi and bytecode", function () {
                    it("should return a contract factory", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            // It's already compiled in artifacts/
                            const contract = yield this.env.ethers.getContractFactory(greeterArtifact.abi, greeterArtifact.bytecode);
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("should return a contract factory for an interface", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractFactory(iGreeterArtifact.abi, iGreeterArtifact.bytecode);
                            chai_1.assert.strictEqual(contract.bytecode, "0x");
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should be able to send txs and make calls", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const Greeter = yield this.env.ethers.getContractFactory(greeterArtifact.abi, greeterArtifact.bytecode);
                            const greeter = yield Greeter.deploy();
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                            yield greeter.setGreeting("Hola");
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                        });
                    });
                    describe("with hardhat's signer", function () {
                        it("should return a contract factory connected to the hardhat's signer", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                // It's already compiled in artifacts/
                                const contract = yield this.env.ethers.getContractFactory(greeterArtifact.abi, greeterArtifact.bytecode, signers[1]);
                                chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                                chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                                (0, helpers_1.assertIsSigner)(contract.runner);
                                chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                            });
                        });
                    });
                });
            });
            describe("getContractFactoryFromArtifact", function () {
                it("should return a contract factory", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.getContractFactoryFromArtifact(greeterArtifact);
                        chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                        chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                        (0, helpers_1.assertIsSigner)(contract.runner);
                        chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                    });
                });
                it("should link a library", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const libraryFactory = yield this.env.ethers.getContractFactory("TestLibrary");
                        const library = yield libraryFactory.deploy();
                        const testContractLibArtifact = yield this.env.artifacts.readArtifact("TestContractLib");
                        const contractFactory = yield this.env.ethers.getContractFactoryFromArtifact(testContractLibArtifact, {
                            libraries: { TestLibrary: yield library.getAddress() },
                        });
                        (0, helpers_1.assertIsSigner)(contractFactory.runner);
                        chai_1.assert.strictEqual(yield contractFactory.runner.getAddress(), yield signers[0].getAddress());
                        const numberPrinter = yield contractFactory.deploy();
                        const someNumber = 50n;
                        chai_1.assert.strictEqual(yield numberPrinter.printNumber.staticCall(someNumber), someNumber * 2n);
                    });
                });
                it("Should be able to send txs and make calls", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const Greeter = yield this.env.ethers.getContractFactoryFromArtifact(greeterArtifact);
                        const greeter = yield Greeter.deploy();
                        chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                        yield greeter.setGreeting("Hola");
                        chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                    });
                });
                describe("with hardhat's signer", function () {
                    it("should return a contract factory connected to the hardhat's signer", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractFactoryFromArtifact(greeterArtifact, signers[1]);
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                        });
                    });
                });
            });
            describe("getContractAt", function () {
                let deployedGreeter;
                beforeEach(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        deployedGreeter = yield Greeter.deploy();
                    });
                });
                describe("by name and address", function () {
                    it("Should not throw if address does not belong to a contract", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const address = yield signers[0].getAddress();
                            // shouldn't throw
                            yield this.env.ethers.getContractAt("Greeter", address);
                        });
                    });
                    it("Should return an instance of a contract", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractAt("Greeter", deployedGreeter.target);
                            chai_1.assert.exists(contract.setGreeting);
                            chai_1.assert.exists(contract.greet);
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should return an instance of an interface", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractAt("IGreeter", deployedGreeter.target);
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should be able to send txs and make calls", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const greeter = yield this.env.ethers.getContractAt("Greeter", deployedGreeter.target);
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                            yield greeter.setGreeting("Hola");
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                        });
                    });
                    describe("with hardhat's signer", function () {
                        it("Should return an instance of a contract associated to a hardhat's signer", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                const contract = yield this.env.ethers.getContractAt("Greeter", deployedGreeter.target, signers[1]);
                                (0, helpers_1.assertIsSigner)(contract.runner);
                                chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                            });
                        });
                    });
                });
                describe("by abi and address", function () {
                    it("Should return an instance of a contract", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractAt(greeterArtifact.abi, deployedGreeter.target);
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should return an instance of an interface", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractAt(iGreeterArtifact.abi, deployedGreeter.target);
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should be able to send txs and make calls", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const greeter = yield this.env.ethers.getContractAt(greeterArtifact.abi, deployedGreeter.target);
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                            yield greeter.setGreeting("Hola");
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                        });
                    });
                    // TODO re-enable when we make .on("event") work
                    // it("Should be able to detect events", async function () {
                    //   const greeter = await this.env.ethers.getContractAt(
                    //     greeterArtifact.abi,
                    //     deployedGreeter.target
                    //   );
                    //
                    //   // at the time of this writing, ethers' default polling interval is
                    //   // 4000 ms. here we turn it down in order to speed up this test.
                    //   // see also
                    //   // https://github.com/ethers-io/ethers.js/issues/615#issuecomment-848991047
                    //   // const provider = greeter.provider as any;
                    //   // provider.pollingInterval = 100;
                    //
                    //   let eventEmitted = false;
                    //   await greeter.on("GreetingUpdated", () => {
                    //     eventEmitted = true;
                    //   });
                    //
                    //   await greeter.setGreeting("Hola");
                    //
                    //   // wait for 1.5 polling intervals for the event to fire
                    //   await new Promise((resolve) => setTimeout(resolve, 10_000));
                    //
                    //   assert.strictEqual(eventEmitted, true);
                    // });
                    describe("with hardhat's signer", function () {
                        it("Should return an instance of a contract associated to a hardhat's signer", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                const contract = yield this.env.ethers.getContractAt(greeterArtifact.abi, deployedGreeter.target, signers[1]);
                                (0, helpers_1.assertIsSigner)(contract.runner);
                                chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                            });
                        });
                    });
                    it("should work with linked contracts", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const libraryFactory = yield this.env.ethers.getContractFactory("TestLibrary");
                            const library = yield libraryFactory.deploy();
                            const contractFactory = yield this.env.ethers.getContractFactory("TestContractLib", {
                                libraries: { TestLibrary: library.target },
                            });
                            const numberPrinter = yield contractFactory.deploy();
                            const numberPrinterAtAddress = yield this.env.ethers.getContractAt("TestContractLib", numberPrinter.target);
                            const someNumber = 50n;
                            chai_1.assert.strictEqual(yield numberPrinterAtAddress.printNumber.staticCall(someNumber), someNumber * 2n);
                        });
                    });
                });
            });
            describe("getContractAtFromArtifact", function () {
                let deployedGreeter;
                beforeEach(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                        deployedGreeter = yield Greeter.deploy();
                    });
                });
                describe("by artifact and address", function () {
                    it("Should return an instance of a contract", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const contract = yield this.env.ethers.getContractAtFromArtifact(greeterArtifact, yield deployedGreeter.getAddress());
                            chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                            chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                            (0, helpers_1.assertIsSigner)(contract.runner);
                            chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[0].getAddress());
                        });
                    });
                    it("Should be able to send txs and make calls", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const greeter = yield this.env.ethers.getContractAtFromArtifact(greeterArtifact, yield deployedGreeter.getAddress());
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hi");
                            yield greeter.setGreeting("Hola");
                            chai_1.assert.strictEqual(yield greeter.greet(), "Hola");
                        });
                    });
                    describe("with hardhat's signer", function () {
                        it("Should return an instance of a contract associated to a hardhat's signer", function () {
                            return __awaiter(this, void 0, void 0, function* () {
                                const contract = yield this.env.ethers.getContractAtFromArtifact(greeterArtifact, yield deployedGreeter.getAddress(), signers[1]);
                                (0, helpers_1.assertIsSigner)(contract.runner);
                                chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signers[1].getAddress());
                            });
                        });
                    });
                });
            });
            describe("deployContract", function () {
                it("should deploy and return a contract with default signer", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("Greeter");
                        yield assertContract(contract, signers[0]);
                    });
                });
                it("should deploy and return a contract with hardhat's signer passed directly", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("Greeter", signers[1]);
                        yield assertContract(contract, signers[1]);
                    });
                });
                it("should deploy and return a contract with hardhat's signer passed as an option", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("Greeter", {
                            signer: signers[1],
                        });
                        yield assertContract(contract, signers[1]);
                    });
                });
                it("should deploy with args and return a contract", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("GreeterWithConstructorArg", ["Hello"]);
                        yield assertContract(contract, signers[0]);
                        (0, chai_1.assert)(yield contract.greet(), "Hello");
                    });
                });
                it("should deploy with args and return a contract with hardhat's signer", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("GreeterWithConstructorArg", ["Hello"], signers[1]);
                        yield assertContract(contract, signers[1]);
                        (0, chai_1.assert)(yield contract.greet(), "Hello");
                    });
                });
                it("should deploy with args and return a contract with hardhat's signer as an option", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("GreeterWithConstructorArg", ["Hello"], { signer: signers[1] });
                        yield assertContract(contract, signers[1]);
                        (0, chai_1.assert)(yield contract.greet(), "Hello");
                    });
                });
                it("should accept overrides for the deployment transaction", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("Greeter", {
                            gasLimit: 1000000,
                        });
                        yield assertContract(contract, signers[0]);
                        const deploymentTx = contract.deploymentTransaction();
                        if (deploymentTx === null) {
                            chai_1.assert.fail("Deployment transaction shouldn't be null");
                        }
                        chai_1.assert.equal(deploymentTx.gasLimit, 1000000n);
                    });
                });
                it("should accept overrides for the deployment transaction when there are constructor args", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const contract = yield this.env.ethers.deployContract("GreeterWithConstructorArg", ["Hello"], {
                            gasLimit: 1000000,
                        });
                        yield assertContract(contract, signers[0]);
                        const deploymentTx = contract.deploymentTransaction();
                        if (deploymentTx === null) {
                            chai_1.assert.fail("Deployment transaction shouldn't be null");
                        }
                        chai_1.assert.equal(deploymentTx.gasLimit, 1000000n);
                    });
                });
                function assertContract(contract, signer) {
                    return __awaiter(this, void 0, void 0, function* () {
                        chai_1.assert.isNotNull(contract.interface.getFunction("greet"));
                        chai_1.assert.isNotNull(contract.interface.getFunction("setGreeting"));
                        (0, helpers_1.assertIsSigner)(contract.runner);
                        chai_1.assert.strictEqual(yield contract.runner.getAddress(), yield signer.getAddress());
                    });
                }
            });
        });
    });
    describe("hardhat", function () {
        (0, environment_1.useEnvironment)("hardhat-project", "hardhat");
        describe("contract events", function () {
            // TODO re-enable when we make .on("event") work
            // it("should be detected", async function () {
            //   const Greeter = await this.env.ethers.getContractFactory("Greeter");
            //   const deployedGreeter: any = await Greeter.deploy();
            //
            //   // at the time of this writing, ethers' default polling interval is
            //   // 4000 ms. here we turn it down in order to speed up this test.
            //   // see also
            //   // https://github.com/ethers-io/ethers.js/issues/615#issuecomment-848991047
            //   // const provider = deployedGreeter.provider as EthersProviderWrapper;
            //   // provider.pollingInterval = 200;
            //
            //   let eventEmitted = false;
            //   deployedGreeter.on("GreetingUpdated", () => {
            //     eventEmitted = true;
            //   });
            //
            //   await deployedGreeter.setGreeting("Hola");
            //
            //   // wait for 1.5 polling intervals for the event to fire
            //   await new Promise((resolve) => setTimeout(resolve, 200 * 2));
            //
            //   assert.strictEqual(eventEmitted, true);
            // });
        });
        describe("hardhat_reset", function () {
            it("should return the correct block number after a hardhat_reset", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "0");
                    yield this.env.ethers.provider.send("evm_mine", []);
                    yield this.env.ethers.provider.send("evm_mine", []);
                    blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "2");
                    yield this.env.ethers.provider.send("hardhat_reset", []);
                    blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "0");
                });
            });
            it("should return the correct block after a hardhat_reset", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.ethers.provider.send("evm_mine", []);
                    let blockOne = yield this.env.ethers.provider.getBlock(1);
                    let blockTwo = yield this.env.ethers.provider.getBlock(2);
                    chai_1.assert.isNotNull(blockOne);
                    chai_1.assert.isNull(blockTwo);
                    yield this.env.ethers.provider.send("hardhat_reset", []);
                    blockOne = yield this.env.ethers.provider.getBlock(1);
                    blockTwo = yield this.env.ethers.provider.getBlock(2);
                    chai_1.assert.isNull(blockOne);
                    chai_1.assert.isNull(blockTwo);
                });
            });
            it("should return the correct nonce after a hardhat_reset", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [sig] = yield this.env.ethers.getSigners();
                    let nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 0);
                    const response = yield sig.sendTransaction({
                        from: sig.address,
                        to: this.env.ethers.ZeroAddress,
                        value: "0x1",
                    });
                    yield response.wait();
                    nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 1);
                    yield this.env.ethers.provider.send("hardhat_reset", []);
                    nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 0);
                });
            });
            it("should return the correct balance after a hardhat_reset", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [sig] = yield this.env.ethers.getSigners();
                    let balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "10000000000000000000000");
                    const response = yield sig.sendTransaction({
                        from: sig.address,
                        to: this.env.ethers.ZeroAddress,
                        gasPrice: 8e9,
                    });
                    yield response.wait();
                    balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "9999999832000000000000");
                    yield this.env.ethers.provider.send("hardhat_reset", []);
                    balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "10000000000000000000000");
                });
            });
            it("should return the correct code after a hardhat_reset", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [sig] = yield this.env.ethers.getSigners();
                    const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                    const tx = yield Greeter.getDeployTransaction();
                    const response = yield sig.sendTransaction(tx);
                    const receipt = yield response.wait();
                    if (receipt === null) {
                        chai_1.assert.fail("receipt shoudn't be null");
                    }
                    if (receipt.contractAddress === null) {
                        chai_1.assert.fail("receipt.contractAddress shoudn't be null");
                    }
                    let code = yield this.env.ethers.provider.getCode(receipt.contractAddress);
                    chai_1.assert.lengthOf(code, 1880);
                    yield this.env.ethers.provider.send("hardhat_reset", []);
                    code = yield this.env.ethers.provider.getCode(receipt.contractAddress);
                    chai_1.assert.lengthOf(code, 2);
                });
            });
        });
        describe("evm_revert", function () {
            it("should return the correct block number after a evm_revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshotId = yield this.env.ethers.provider.send("evm_snapshot", []);
                    let blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "0");
                    yield this.env.ethers.provider.send("evm_mine", []);
                    yield this.env.ethers.provider.send("evm_mine", []);
                    blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "2");
                    yield this.env.ethers.provider.send("evm_revert", [snapshotId]);
                    blockNumber = yield this.env.ethers.provider.getBlockNumber();
                    chai_1.assert.strictEqual(blockNumber.toString(), "0");
                });
            });
            it("should return the correct block after a evm_revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshotId = yield this.env.ethers.provider.send("evm_snapshot", []);
                    yield this.env.ethers.provider.send("evm_mine", []);
                    let blockOne = yield this.env.ethers.provider.getBlock(1);
                    let blockTwo = yield this.env.ethers.provider.getBlock(2);
                    chai_1.assert.isNotNull(blockOne);
                    chai_1.assert.isNull(blockTwo);
                    yield this.env.ethers.provider.send("evm_revert", [snapshotId]);
                    blockOne = yield this.env.ethers.provider.getBlock(1);
                    blockTwo = yield this.env.ethers.provider.getBlock(2);
                    chai_1.assert.isNull(blockOne);
                    chai_1.assert.isNull(blockTwo);
                });
            });
            it("should return the correct nonce after a evm_revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshotId = yield this.env.ethers.provider.send("evm_snapshot", []);
                    const [sig] = yield this.env.ethers.getSigners();
                    let nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 0);
                    const response = yield sig.sendTransaction({
                        from: sig.address,
                        to: this.env.ethers.ZeroAddress,
                        value: "0x1",
                    });
                    yield response.wait();
                    nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 1);
                    yield this.env.ethers.provider.send("evm_revert", [snapshotId]);
                    nonce = yield this.env.ethers.provider.getTransactionCount(sig.address);
                    chai_1.assert.strictEqual(nonce, 0);
                });
            });
            it("should return the correct balance after a evm_revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshotId = yield this.env.ethers.provider.send("evm_snapshot", []);
                    const [sig] = yield this.env.ethers.getSigners();
                    let balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "10000000000000000000000");
                    const response = yield sig.sendTransaction({
                        from: sig.address,
                        to: this.env.ethers.ZeroAddress,
                        gasPrice: 8e9,
                    });
                    yield response.wait();
                    balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "9999999832000000000000");
                    yield this.env.ethers.provider.send("evm_revert", [snapshotId]);
                    balance = yield this.env.ethers.provider.getBalance(sig.address);
                    chai_1.assert.strictEqual(balance.toString(), "10000000000000000000000");
                });
            });
            it("should return the correct code after a evm_revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const snapshotId = yield this.env.ethers.provider.send("evm_snapshot", []);
                    const [sig] = yield this.env.ethers.getSigners();
                    const Greeter = yield this.env.ethers.getContractFactory("Greeter");
                    const tx = yield Greeter.getDeployTransaction();
                    const response = yield sig.sendTransaction(tx);
                    const receipt = yield response.wait();
                    if (receipt === null) {
                        chai_1.assert.fail("receipt shoudn't be null");
                    }
                    if (receipt.contractAddress === null) {
                        chai_1.assert.fail("receipt.contractAddress shoudn't be null");
                    }
                    let code = yield this.env.ethers.provider.getCode(receipt.contractAddress);
                    chai_1.assert.lengthOf(code, 1880);
                    yield this.env.ethers.provider.send("evm_revert", [snapshotId]);
                    code = yield this.env.ethers.provider.getCode(receipt.contractAddress);
                    chai_1.assert.lengthOf(code, 2);
                });
            });
        });
        it("signTypedData integration test", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // See https://eips.ethereum.org/EIPS/eip-712#parameters
                // There's a json schema and an explanation for each field.
                const typedMessage = {
                    domain: {
                        chainId: 31337,
                        name: "Hardhat Network test suite",
                    },
                    message: {
                        name: "Translation",
                        start: {
                            x: 200,
                            y: 600,
                        },
                        end: {
                            x: 300,
                            y: 350,
                        },
                        cost: 50,
                    },
                    primaryType: "WeightedVector",
                    types: {
                        // ethers.js derives the EIP712Domain type from the domain object itself
                        // EIP712Domain: [
                        //   { name: "name", type: "string" },
                        //   { name: "chainId", type: "uint256" },
                        // ],
                        WeightedVector: [
                            { name: "name", type: "string" },
                            { name: "start", type: "Point" },
                            { name: "end", type: "Point" },
                            { name: "cost", type: "uint256" },
                        ],
                        Point: [
                            { name: "x", type: "uint256" },
                            { name: "y", type: "uint256" },
                        ],
                    },
                };
                const [signer] = yield this.env.ethers.getSigners();
                const signature = yield signer.signTypedData(typedMessage.domain, typedMessage.types, typedMessage.message);
                const byteToHex = 2;
                const hexPrefix = 2;
                const signatureSizeInBytes = 65;
                chai_1.assert.lengthOf(signature, signatureSizeInBytes * byteToHex + hexPrefix);
            });
        });
    });
    describe("hardhat node via WebSocket", function () {
        (0, environment_1.useEnvironment)("hardhat-project", "localhost");
        // TODO re-enable when we make .on("event") work
        // it("should be able to detect events", async function () {
        //   await this.env.run("compile", { quiet: true });
        //
        //   const Greeter = await this.env.ethers.getContractFactory("Greeter");
        //   const deployedGreeter: any = await Greeter.deploy();
        //
        //   const readonlyContract = deployedGreeter.connect(
        //     new ethers.WebSocketProvider("ws://127.0.0.1:8545")
        //   );
        //   let emitted = false;
        //   await readonlyContract.on("GreetingUpdated", () => {
        //     emitted = true;
        //   });
        //
        //   await deployedGreeter.setGreeting("Hola");
        //
        //   // wait for the event to fire
        //   await new Promise((resolve) => setTimeout(resolve, 100));
        //
        //   assert.strictEqual(emitted, true);
        // });
    });
});
