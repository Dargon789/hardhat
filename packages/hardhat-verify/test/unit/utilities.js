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
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const picocolors_1 = __importDefault(require("picocolors"));
const utilities_1 = require("../../src/internal/utilities");
const errors_1 = require("../../src/internal/errors");
const chain_config_1 = require("../../src/internal/chain-config");
describe("Utilities", () => {
    describe("printSupportedNetworks", () => {
        it("should print supported and custom networks", () => __awaiter(void 0, void 0, void 0, function* () {
            const customChains = [
                {
                    network: "MyNetwork",
                    chainId: 1337,
                    urls: {
                        apiURL: "https://api.mynetwork.io/api",
                        browserURL: "https://mynetwork.io",
                    },
                },
            ];
            const logStub = sinon_1.default.stub(console, "log");
            yield (0, utilities_1.printSupportedNetworks)(customChains);
            sinon_1.default.restore();
            chai_1.assert.isTrue(logStub.calledOnce);
            const actualTableOutput = logStub.getCall(0).args[0];
            const allChains = [...chain_config_1.builtinChains, ...customChains];
            allChains.forEach(({ network, chainId }) => {
                const regex = new RegExp(`║\\s*${network}\\s*│\\s*${chainId}\\s*║`);
                chai_1.assert.isTrue(regex.test(actualTableOutput));
            });
        }));
    });
    describe("printVerificationErrors", () => {
        it("should print verification errors", () => {
            const errors = {
                Etherscan: new errors_1.HardhatVerifyError("Etherscan error message"),
                Sourcify: new errors_1.HardhatVerifyError("Sourcify error message"),
            };
            const errorStub = sinon_1.default.stub(console, "error");
            (0, utilities_1.printVerificationErrors)(errors);
            sinon_1.default.restore();
            chai_1.assert.isTrue(errorStub.calledOnce);
            const errorMessage = errorStub.getCall(0).args[0];
            chai_1.assert.equal(errorMessage, picocolors_1.default.red(`hardhat-verify found one or more errors during the verification process:

Etherscan:
Etherscan error message

Sourcify:
Sourcify error message

`));
        });
    });
    describe("resolveConstructorArguments", () => {
        it("should return the constructorArgsParams if constructorArgsModule is not defined", () => __awaiter(void 0, void 0, void 0, function* () {
            const constructorArgsParams = ["1", "arg2", "false"];
            const result = yield (0, utilities_1.resolveConstructorArguments)(constructorArgsParams);
            chai_1.assert.equal(constructorArgsParams, result);
        }));
        it("should return the constructor arguments exported in constructorArgsModule", () => __awaiter(void 0, void 0, void 0, function* () {
            const constructorArgsModule = "test/unit/mocks/valid-constructor-args.js";
            const expected = [
                50,
                "a string argument",
                {
                    x: 10,
                    y: 5,
                },
                "0xabcdef",
            ];
            const result = yield (0, utilities_1.resolveConstructorArguments)([], constructorArgsModule);
            chai_1.assert.deepEqual(result, expected);
        }));
        it("should throw if constructorArgsModule can't be imported", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, chai_1.expect)((0, utilities_1.resolveConstructorArguments)([], "not-a-valid-path.js")).to.be.rejectedWith(/Cannot find module/);
        }));
        it("should throw if the constructor arguments exported in constructorArgsModule are not an array", () => __awaiter(void 0, void 0, void 0, function* () {
            const constructorArgsModule = "test/unit/mocks/invalid-constructor-args.js";
            const constructorArgsModulePath = path_1.default
                .resolve(process.cwd(), constructorArgsModule)
                // make test work on windows
                .replace(/\\/g, "\\\\");
            yield (0, chai_1.expect)((0, utilities_1.resolveConstructorArguments)([], constructorArgsModule)).to.be.rejectedWith(new RegExp(`The module ${constructorArgsModulePath} doesn't export a list.`));
        }));
        it("should throw an error if both parameters are provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const constructorArgsParams = ["1", "arg2", "false"];
            const constructorArgsModule = "test/unit/mocks/valid-constructor-args.js";
            yield (0, chai_1.expect)((0, utilities_1.resolveConstructorArguments)(constructorArgsParams, constructorArgsModule)).to.be.rejectedWith("The parameters constructorArgsParams and constructorArgsModule are exclusive. Please provide only one of them.");
        }));
    });
    describe("resolveLibraries", () => {
        it("should return an empty object if librariesModule is not defined", () => __awaiter(void 0, void 0, void 0, function* () {
            const result = yield (0, utilities_1.resolveLibraries)();
            chai_1.assert.deepEqual(result, {});
        }));
        it("should return the library dictionary exported in librariesModule", () => __awaiter(void 0, void 0, void 0, function* () {
            const librariesModule = "test/unit/mocks/valid-libraries.js";
            const expected = {
                SomeLibrary: "0x...",
                AnotherLibrary: "0x...",
            };
            const result = yield (0, utilities_1.resolveLibraries)(librariesModule);
            chai_1.assert.deepEqual(result, expected);
        }));
        it("should throw if librariesModule can't be imported", () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, chai_1.expect)((0, utilities_1.resolveLibraries)("not-a-valid-path.js")).to.be.rejectedWith(/Cannot find module/);
        }));
        it("should throw if the libraries exported in librariesModule are not a dictionary", () => __awaiter(void 0, void 0, void 0, function* () {
            const librariesModule = "test/unit/mocks/invalid-libraries.js";
            const librariesModulePath = path_1.default
                .resolve(process.cwd(), librariesModule)
                // make test work on windows
                .replace(/\\/g, "\\\\");
            yield (0, chai_1.expect)((0, utilities_1.resolveLibraries)(librariesModule)).to.be.rejectedWith(new RegExp(`The module ${librariesModulePath} doesn't export a dictionary.`));
        }));
    });
    describe("getCompilerVersions", () => {
        it("should return the list of compiler versions defined in the hardhat config (compilers + overrides)", () => __awaiter(void 0, void 0, void 0, function* () {
            const solidityConfig = {
                compilers: [
                    {
                        version: "0.8.18",
                        settings: {},
                    },
                    {
                        version: "0.7.2",
                        settings: {},
                    },
                ],
                overrides: {
                    "contracts/Foo.sol": {
                        version: "0.5.5",
                        settings: {},
                    },
                    "contracts/Bar.sol": {
                        version: "0.6.4",
                        settings: {},
                    },
                },
            };
            const expected = ["0.8.18", "0.7.2", "0.5.5", "0.6.4"];
            const compilerVersions = yield (0, utilities_1.getCompilerVersions)(solidityConfig);
            chai_1.assert.deepEqual(compilerVersions, expected);
        }));
        it("should return the list of compiler versions defined in the hardhat config (compilers - no overrides)", () => __awaiter(void 0, void 0, void 0, function* () {
            const solidityConfig = {
                compilers: [
                    {
                        version: "0.8.18",
                        settings: {},
                    },
                    {
                        version: "0.7.2",
                        settings: {},
                    },
                    {
                        version: "0.4.11",
                        settings: {},
                    },
                ],
                overrides: {},
            };
            const expected = ["0.8.18", "0.7.2", "0.4.11"];
            const compilerVersions = yield (0, utilities_1.getCompilerVersions)(solidityConfig);
            chai_1.assert.deepEqual(compilerVersions, expected);
        }));
        it("should return the list of compiler versions defined in the hardhat config (compilers + overrides (dup))", () => __awaiter(void 0, void 0, void 0, function* () {
            const solidityConfig = {
                compilers: [
                    {
                        version: "0.8.18",
                        settings: {},
                    },
                ],
                overrides: {
                    "contracts/Foo.sol": {
                        version: "0.8.18",
                        settings: {},
                    },
                },
            };
            const expected = ["0.8.18", "0.8.18"];
            const compilerVersions = yield (0, utilities_1.getCompilerVersions)(solidityConfig);
            chai_1.assert.deepEqual(compilerVersions, expected);
        }));
        it("should throw if any version is below Etherscan supported version (compilers)", () => __awaiter(void 0, void 0, void 0, function* () {
            const solidityConfig = {
                compilers: [
                    {
                        version: "0.8.18",
                        settings: {},
                    },
                    {
                        version: "0.4.10",
                        settings: {},
                    },
                ],
                overrides: {
                    "contracts/Foo.sol": {
                        version: "0.8.15",
                        settings: {},
                    },
                },
            };
            yield (0, chai_1.expect)((0, utilities_1.getCompilerVersions)(solidityConfig)).to.be.rejectedWith(/Etherscan only supports compiler versions 0.4.11 and higher/);
        }));
        it("should throw if any version is below Etherscan supported version (overrides)", () => __awaiter(void 0, void 0, void 0, function* () {
            const solidityConfig = {
                compilers: [
                    {
                        version: "0.8.18",
                        settings: {},
                    },
                    {
                        version: "0.7.6",
                        settings: {},
                    },
                ],
                overrides: {
                    "contracts/Foo.sol": {
                        version: "0.3.5",
                        settings: {},
                    },
                },
            };
            yield (0, chai_1.expect)((0, utilities_1.getCompilerVersions)(solidityConfig)).to.be.rejectedWith(/Etherscan only supports compiler versions 0.4.11 and higher/);
        }));
    });
    describe("encodeArguments", () => {
        const sourceName = "TheContract.sol";
        const contractName = "TheContract";
        it("should correctly encode a single constructor argument", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [50];
            const encodedArguments = yield (0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments);
            chai_1.assert.equal(encodedArguments, "0000000000000000000000000000000000000000000000000000000000000032");
        }));
        it("should correctly encode multiple constructor arguments", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                        {
                            name: "amount",
                            type: "string",
                        },
                        {
                            name: "amount",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [
                50,
                "initializer",
                "0x752C8191E6b1Db38B41A8c8921F7a703F2969d18",
            ];
            const encodedArguments = yield (0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments);
            const expectedArguments = [
                "0000000000000000000000000000000000000000000000000000000000000032",
                "0000000000000000000000000000000000000000000000000000000000000060",
                "000000000000000000000000752c8191e6b1db38b41a8c8921f7a703f2969d18",
                "000000000000000000000000000000000000000000000000000000000000000b",
                "696e697469616c697a6572000000000000000000000000000000000000000000",
            ].join("");
            chai_1.assert.equal(encodedArguments, expectedArguments);
        }));
        it("should correctly encode ABIv2 nested tuples", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "t",
                            type: "tuple",
                            components: [
                                {
                                    name: "x",
                                    type: "uint256",
                                },
                                {
                                    name: "y",
                                    type: "uint256",
                                },
                                {
                                    name: "nestedProperty",
                                    type: "tuple",
                                    components: [
                                        {
                                            name: "x",
                                            type: "uint256",
                                        },
                                        {
                                            name: "y",
                                            type: "uint256",
                                        },
                                    ],
                                },
                            ],
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [
                {
                    x: 8,
                    y: 8 + 16,
                    nestedProperty: {
                        x: 8 + 16 * 2,
                        y: 8 + 16 * 3,
                    },
                },
            ];
            const encodedArguments = yield (0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments);
            const expectedArguments = [
                "0000000000000000000000000000000000000000000000000000000000000008",
                "0000000000000000000000000000000000000000000000000000000000000018",
                "0000000000000000000000000000000000000000000000000000000000000028",
                "0000000000000000000000000000000000000000000000000000000000000038",
            ].join("");
            chai_1.assert.equal(encodedArguments, expectedArguments);
        }));
        it("should return an empty string when there are no constructor arguments", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [];
            const encodedArguments = yield (0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments);
            chai_1.assert.equal(encodedArguments, "");
        }));
        it("should throw if there are less arguments than expected", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                        {
                            name: "anotherAmount",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [50];
            yield (0, chai_1.expect)((0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments)).to.be
                .rejectedWith(`The constructor for ${sourceName}:${contractName} has 2 parameters
but 1 arguments were provided instead.`);
        }));
        it("should throw if there are more arguments than expected", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [50, 100];
            yield (0, chai_1.expect)((0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments)).to.be
                .rejectedWith(`The constructor for ${sourceName}:${contractName} has 1 parameters
but 2 arguments were provided instead.`);
        }));
        it("should throw if a parameter type does not match its expected type", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                        {
                            name: "amount",
                            type: "string",
                        },
                        {
                            name: "amount",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [
                50,
                "initializer",
                "0x752c8191e6b1db38b41a752C8191E6b1Db38B41A8c8921F7a703F2969d18", // Invalid address
            ];
            yield (0, chai_1.expect)((0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments)).to.be.rejectedWith(/Value 0x752c8191e6b1db38b41a752C8191E6b1Db38B41A8c8921F7a703F2969d18 cannot be encoded for the parameter amount./);
        }));
        it("should throw if a parameter type does not match its expected type: number instead of string", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                        {
                            name: "amount",
                            type: "string",
                        },
                        {
                            name: "amount",
                            type: "address",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const constructorArguments = [
                50,
                50,
                "0x752C8191E6b1Db38B41A8c8921F7a703F2969d18",
            ];
            yield (0, chai_1.expect)((0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments)).to.be.rejectedWith(/Value 50 cannot be encoded for the parameter amount./);
        }));
        it("should throw if an unsafe integer is provided as an argument", () => __awaiter(void 0, void 0, void 0, function* () {
            const abi = [
                {
                    inputs: [
                        {
                            name: "amount",
                            type: "uint256",
                        },
                    ],
                    stateMutability: "nonpayable",
                    type: "constructor",
                },
            ];
            const amount = 1000000000000000000;
            chai_1.assert.isFalse(Number.isSafeInteger(amount));
            const constructorArguments = [amount];
            yield (0, chai_1.expect)((0, utilities_1.encodeArguments)(abi, sourceName, contractName, constructorArguments)).to.be.rejectedWith(/Value 1000000000000000000 is not a safe integer and cannot be encoded./);
        }));
    });
});
