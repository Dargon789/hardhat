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
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const config_1 = require("../../src/internal/config");
describe("Extend config", () => {
    describe("Etherscan config extender", () => {
        it("should extend the hardhat config with the user config", () => __awaiter(void 0, void 0, void 0, function* () {
            const hardhatConfig = {};
            const userConfig = {
                etherscan: {
                    apiKey: {
                        goerli: "<goerli-api-key>",
                    },
                    customChains: [
                        {
                            network: "goerli",
                            chainId: 5,
                            urls: {
                                apiURL: "https://api-goerli.etherscan.io/api",
                                browserURL: "https://goerli.etherscan.io",
                            },
                        },
                    ],
                },
            };
            const expected = {
                enabled: true,
                apiKey: {
                    goerli: "<goerli-api-key>",
                },
                customChains: [
                    {
                        network: "goerli",
                        chainId: 5,
                        urls: {
                            apiURL: "https://api-goerli.etherscan.io/api",
                            browserURL: "https://goerli.etherscan.io",
                        },
                    },
                ],
            };
            (0, config_1.etherscanConfigExtender)(hardhatConfig, userConfig);
            chai_1.assert.deepEqual(hardhatConfig.etherscan, expected);
        }));
        it("should override the hardhat config with the user config", () => __awaiter(void 0, void 0, void 0, function* () {
            const hardhatConfig = {};
            hardhatConfig.etherscan = {
                enabled: true,
                apiKey: {
                    goerli: "<goerli-api-key>",
                },
                customChains: [
                    {
                        network: "goerli",
                        chainId: 5,
                        urls: {
                            apiURL: "https://api-goerli.etherscan.io/api",
                            browserURL: "https://goerli.etherscan.io",
                        },
                    },
                ],
            };
            const userConfig = {
                etherscan: {
                    apiKey: {
                        mainnet: "<mainnet-api-key>",
                        sepolia: "<sepolia-api-key>",
                    },
                    customChains: [
                        {
                            network: "mainnet",
                            chainId: 1,
                            urls: {
                                apiURL: "https://api.etherscan.io/api",
                                browserURL: "https://etherscan.io",
                            },
                        },
                        {
                            network: "sepolia",
                            chainId: 11155111,
                            urls: {
                                apiURL: "https://api-sepolia.etherscan.io/api",
                                browserURL: "https://sepolia.etherscan.io",
                            },
                        },
                    ],
                },
            };
            const expected = {
                enabled: true,
                apiKey: {
                    mainnet: "<mainnet-api-key>",
                    sepolia: "<sepolia-api-key>",
                },
                customChains: [
                    {
                        network: "mainnet",
                        chainId: 1,
                        urls: {
                            apiURL: "https://api.etherscan.io/api",
                            browserURL: "https://etherscan.io",
                        },
                    },
                    {
                        network: "sepolia",
                        chainId: 11155111,
                        urls: {
                            apiURL: "https://api-sepolia.etherscan.io/api",
                            browserURL: "https://sepolia.etherscan.io",
                        },
                    },
                ],
            };
            (0, config_1.etherscanConfigExtender)(hardhatConfig, userConfig);
            chai_1.assert.deepEqual(hardhatConfig.etherscan, expected);
        }));
        it("should set default values when user config is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const hardhatConfig = {};
            const userConfig = {};
            const expected = {
                enabled: true,
                apiKey: "",
                customChains: [],
            };
            (0, config_1.etherscanConfigExtender)(hardhatConfig, userConfig);
            chai_1.assert.deepEqual(hardhatConfig.etherscan, expected);
        }));
        it("should display a warning message if there is an etherscan entry in the networks object", () => __awaiter(void 0, void 0, void 0, function* () {
            const warnStub = sinon_1.default.stub(console, "warn");
            const hardhatConfig = {
                networks: {
                    etherscan: {
                        apiKey: {
                            goerli: "<goerli-api-key>",
                        },
                    },
                },
            };
            const userConfig = {};
            // @ts-expect-error
            (0, config_1.etherscanConfigExtender)(hardhatConfig, userConfig);
            (0, chai_1.expect)(warnStub).to.be.calledOnceWith(sinon_1.default.match(/WARNING: you have an 'etherscan' entry in your networks configuration./));
            warnStub.restore();
        }));
    });
    describe("Sourcify config extender", () => {
        it("should set default values when user config is not provided", () => __awaiter(void 0, void 0, void 0, function* () {
            const hardhatConfig = {};
            const userConfig = {};
            const expected = {
                enabled: false,
                apiUrl: "https://sourcify.dev/server",
                browserUrl: "https://repo.sourcify.dev",
            };
            (0, config_1.sourcifyConfigExtender)(hardhatConfig, userConfig);
            chai_1.assert.deepEqual(hardhatConfig.sourcify, expected);
        }));
    });
});
