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
const chai_1 = require("chai");
const fs = __importStar(require("fs"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const path_1 = __importDefault(require("path"));
const constants_1 = require("../src/constants");
const helpers_1 = require("./helpers");
function assertIsContract(contract) {
    chai_1.assert.containsAllKeys(contract, [
        "new",
        "at",
        "defaults",
        "detectNetwork",
        "deployed",
        "link",
    ]);
}
function assertIsContractInstance(contractInstance, ...functionNames) {
    chai_1.assert.containsAllKeys(contractInstance, [
        "address",
        "abi",
        ...functionNames,
    ]);
}
function testArtifactsFunctionality() {
    it("Should load existing contracts successfully", function () {
        assertIsContract(this.env.artifacts.require("Greeter"));
        assertIsContract(this.env.artifacts.require("Lib"));
        assertIsContract(this.env.artifacts.require("UsesLib"));
    });
    it("Should set a default sender to contract deployments", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = this.env.artifacts.require("Greeter");
            const greeter = yield Greeter.new();
            assertIsContractInstance(greeter, "greet", "setGreeting");
            const Lib = this.env.artifacts.require("Lib");
            const lib = yield Lib.new();
            assertIsContractInstance(lib, "addOne");
        });
    });
    it("Should set a default sender to the contract's functions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = this.env.artifacts.require("Greeter");
            const greeter = yield Greeter.new();
            chai_1.assert.equal(yield greeter.greet(), "Hi");
            yield greeter.setGreeting("Hi!!!");
            chai_1.assert.equal(yield greeter.greet(), "Hi!!!");
        });
    });
    it("Should work with Contract.at", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = this.env.artifacts.require("Greeter");
            const greeter = yield Greeter.new();
            const greeterWithAt = yield Greeter.at(greeter.address);
            assertIsContractInstance(greeterWithAt, "greet");
            chai_1.assert.equal(yield greeterWithAt.greet(), "Hi");
            yield greeterWithAt.setGreeting("Hi!!!");
            chai_1.assert.equal(yield greeterWithAt.greet(), "Hi!!!");
        });
    });
    it("Should work with new Contract(addr)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = this.env.artifacts.require("Greeter");
            const greeter = yield Greeter.new();
            const greeterWithNew = new Greeter(greeter.address);
            assertIsContractInstance(greeterWithNew, "greet");
            chai_1.assert.equal(yield greeterWithNew.greet(), "Hi");
            yield greeterWithNew.setGreeting("Hi!!!");
            chai_1.assert.equal(yield greeterWithNew.greet(), "Hi!!!");
        });
    });
    it("Should provison cloned contracts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = this.env.artifacts.require("Greeter");
            const ClonedGreeter = Greeter.clone();
            const greeter = yield ClonedGreeter.new();
            assertIsContractInstance(greeter, "greet");
            chai_1.assert.equal(yield greeter.greet(), "Hi");
            yield greeter.setGreeting("Hi!!!");
            chai_1.assert.equal(yield greeter.greet(), "Hi!!!");
        });
    });
    it("Should fail to deploy an unlinked contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const UsesLib = this.env.artifacts.require("UsesLib");
            try {
                yield UsesLib.new();
                chai_1.assert.fail("UsesLib shouldn't be deployeable if not linked");
            }
            catch (error) {
                chai_1.assert.include(error.message, "UsesLib contains unresolved libraries");
            }
        });
    });
    it("Should deploy linked contracts successfully", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Lib = this.env.artifacts.require("Lib");
            const lib = yield Lib.new();
            assertIsContractInstance(lib, "addOne");
            const UsesLib = this.env.artifacts.require("UsesLib");
            UsesLib.link(lib);
            const usesLib = yield UsesLib.new();
            assertIsContractInstance(usesLib, "n", "addTwo");
            chai_1.assert.equal((yield usesLib.n()).toString(), "0");
            yield usesLib.addTwo();
            chai_1.assert.equal((yield usesLib.n()).toString(), "2");
        });
    });
}
describe("HardhatRuntimeEnvironment extension", function () {
    (0, helpers_1.useEnvironment)("hardhat-project-solc-0.5");
    it("It should add a require function to artifacts", function () {
        chai_1.assert.isFunction(this.env.artifacts.require);
    });
});
describe("TruffleContracts loading and provisioning", function () {
    describe("When compiling with solc 0.5.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.5");
        testArtifactsFunctionality();
    });
    describe("When compiling with solc 0.4.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4");
        testArtifactsFunctionality();
    });
    describe("When compiling with solc 0.6.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.6");
        testArtifactsFunctionality();
    });
    describe("Without accounts", function () {
        function shouldWorkWithoutAccounts() {
            it("Should be able to call constant functions", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const Greeter = this.env.artifacts.require("Greeter");
                    // We test it this way as actually deploying a contract here, without
                    // accounts, is difficult.
                    const greeterWithAt = new Greeter("0x0000000000000000000000000000000000000001");
                    // Shouldn't throw.
                    yield greeterWithAt.greet.estimateGas();
                });
            });
        }
        describe("With solc 0.4.x", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4", "withoutAccounts");
            shouldWorkWithoutAccounts();
        });
        describe("With solc 0.5.x", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-solc-0.5", "withoutAccounts");
            shouldWorkWithoutAccounts();
        });
        describe("With solc 0.6.x", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-solc-0.6", "withoutAccounts");
            shouldWorkWithoutAccounts();
        });
    });
});
describe("Test contracts compilation", function () {
    (0, helpers_1.useEnvironment)("hardhat-project-with-test-contracts");
    it("Should include sources from sources", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const sources = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
            chai_1.assert.include(sources, fs.realpathSync(path_1.default.join(process.cwd(), "contracts", "fromContracts.sol")));
        });
    });
    it("Should include sources from test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const sources = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
            chai_1.assert.include(sources, fs.realpathSync(path_1.default.join(process.cwd(), "test", "fromTest.sol")));
        });
    });
    it("Should ignore non-source files from test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const sources = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
            chai_1.assert.notInclude(sources, fs.realpathSync(path_1.default.join(process.cwd(), "test", "shouldBeIgnored.txt")));
        });
    });
    it("Should include all the files from contracts and test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const sources = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
            chai_1.assert.lengthOf(sources, 2);
        });
    });
});
describe("Gas multiplier", function () {
    function assertItWorksForDeployments(env, multiplier) {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = env.artifacts.require("Greeter");
            const accounts = yield env.web3.eth.getAccounts();
            const web3Estimation = yield env.web3.eth.estimateGas({
                from: accounts[0],
                data: Greeter.bytecode,
            });
            const greeter = yield Greeter.new();
            const tx = yield env.web3.eth.getTransaction(greeter.transactionHash);
            const gasLimit = tx.gas;
            chai_1.assert.equal(gasLimit, Math.floor(web3Estimation * multiplier));
        });
    }
    function assertItWorksForFunctions(env, multiplier) {
        return __awaiter(this, void 0, void 0, function* () {
            const Greeter = env.artifacts.require("Greeter");
            const greeter = yield Greeter.new();
            const greeting = "Hello, Truffle";
            const callData = env.web3.eth.abi.encodeFunctionCall({
                name: "setGreeting",
                type: "function",
                inputs: [
                    {
                        type: "string",
                        name: "_greeting",
                    },
                ],
            }, [greeting]);
            const accounts = yield env.web3.eth.getAccounts();
            const web3Estimation = yield env.web3.eth.estimateGas({
                to: greeter.address,
                from: accounts[0],
                data: callData,
            });
            const txResult = yield greeter.setGreeting(greeting);
            const tx = yield env.web3.eth.getTransaction(txResult.tx);
            const gasLimit = tx.gas;
            chai_1.assert.equal(gasLimit, Math.floor(web3Estimation * multiplier));
        });
    }
    describe("When it's set in the network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4", "withGasMultiplier");
        it("Should use the set one for deployments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const multiplier = this.env.network.config.gasMultiplier;
                yield assertItWorksForDeployments(this.env, multiplier);
            });
        });
        it("Should use the set one for functions", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const multiplier = this.env.network.config.gasMultiplier;
                yield assertItWorksForFunctions(this.env, multiplier);
            });
        });
    });
    describe("When it's not set in the network", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4");
        it("Should use the set one for deployments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield assertItWorksForDeployments(this.env, constants_1.DEFAULT_GAS_MULTIPLIER);
            });
        });
        it("Should use the set one for functions", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield assertItWorksForFunctions(this.env, constants_1.DEFAULT_GAS_MULTIPLIER);
            });
        });
    });
});
describe("Contract function's accounts derivation", function () {
    (0, helpers_1.useEnvironment)("hardhat-project-with-accounts", "hardhat");
    it("Should derive the right accounts for hardhat network when contract is used in a test", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // We run a test in the fixture project that validates this
            const result = yield this.env.run("test");
            chai_1.assert.equal(result, 0);
            process.exitCode = 0;
        });
    });
});
