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
const etherscan_1 = require("../../src/internal/etherscan");
describe("Etherscan", () => {
    const chainConfig = {
        network: "goerli",
        chainId: 5,
        urls: {
            apiURL: "https://api-goerli.etherscan.io/api",
            browserURL: "https://goerli.etherscan.io",
        },
    };
    describe("constructor", () => {
        it("should throw if the apiKey is undefined or empty", () => {
            (0, chai_1.expect)(() => etherscan_1.Etherscan.fromChainConfig(undefined, chainConfig)).to.throw(/You are trying to verify a contract in 'goerli', but no API token was found for this network./);
            (0, chai_1.expect)(() => etherscan_1.Etherscan.fromChainConfig("", chainConfig)).to.throw(/You are trying to verify a contract in 'goerli', but no API token was found for this network./);
        });
        it("should throw if the apiKey is an object but apiKey[network] is undefined or empty", () => {
            (0, chai_1.expect)(() => etherscan_1.Etherscan.fromChainConfig({}, chainConfig)).to.throw(/You are trying to verify a contract in 'goerli', but no API token was found for this network./);
            (0, chai_1.expect)(() => etherscan_1.Etherscan.fromChainConfig({ goerli: "" }, chainConfig)).to.throw(/You are trying to verify a contract in 'goerli', but no API token was found for this network./);
        });
    });
    describe("getCurrentChainConfig", () => {
        const customChains = [
            {
                network: "customChain1",
                chainId: 5000,
                urls: {
                    apiURL: "<api-url>",
                    browserURL: "<browser-url>",
                },
            },
            {
                network: "customChain2",
                chainId: 5000,
                urls: {
                    apiURL: "<api-url>",
                    browserURL: "<browser-url>",
                },
            },
            {
                network: "customChain3",
                chainId: 4999,
                urls: {
                    apiURL: "<api-url>",
                    browserURL: "<browser-url>",
                },
            },
        ];
        it("should return the last matching custom chain defined by the user", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const networkName = "customChain2";
                const ethereumProvider = {
                    send() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return (5000).toString(16);
                        });
                    },
                };
                const currentChainConfig = yield etherscan_1.Etherscan.getCurrentChainConfig(networkName, ethereumProvider, customChains);
                chai_1.assert.equal(currentChainConfig.network, networkName);
                chai_1.assert.equal(currentChainConfig.chainId, 5000);
            });
        });
        it("should return a built-in chain if no custom chain matches", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const networkName = "goerli";
                const ethereumProvider = {
                    send() {
                        return __awaiter(this, void 0, void 0, function* () {
                            return (5).toString(16);
                        });
                    },
                };
                const currentChainConfig = yield etherscan_1.Etherscan.getCurrentChainConfig(networkName, ethereumProvider, customChains);
                chai_1.assert.equal(currentChainConfig.network, networkName);
                chai_1.assert.equal(currentChainConfig.chainId, 5);
            });
        });
        it("should throw if the selected network is hardhat and it's not added to custom chains", () => __awaiter(void 0, void 0, void 0, function* () {
            const networkName = "hardhat";
            const ethereumProvider = {
                send() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return (31337).toString(16);
                    });
                },
            };
            yield (0, chai_1.expect)(etherscan_1.Etherscan.getCurrentChainConfig(networkName, ethereumProvider, customChains)).to.be.rejectedWith(/The selected network is "hardhat", which is not supported for contract verification./);
        }));
        it("should return hardhat if the selected network is hardhat and it was added as a custom chain", () => __awaiter(void 0, void 0, void 0, function* () {
            const networkName = "hardhat";
            const ethereumProvider = {
                send() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return (31337).toString(16);
                    });
                },
            };
            const currentChainConfig = yield etherscan_1.Etherscan.getCurrentChainConfig(networkName, ethereumProvider, [
                ...customChains,
                {
                    network: "hardhat",
                    chainId: 31337,
                    urls: {
                        apiURL: "<api-url>",
                        browserURL: "<browser-url>",
                    },
                },
            ]);
            chai_1.assert.equal(currentChainConfig.network, networkName);
            chai_1.assert.equal(currentChainConfig.chainId, 31337);
        }));
        it("should throw if there are no matches at all", () => __awaiter(void 0, void 0, void 0, function* () {
            const networkName = "someNetwork";
            const ethereumProvider = {
                send() {
                    return __awaiter(this, void 0, void 0, function* () {
                        return (21343214123).toString(16);
                    });
                },
            };
            yield (0, chai_1.expect)(etherscan_1.Etherscan.getCurrentChainConfig(networkName, ethereumProvider, customChains)).to.be.rejectedWith(/Trying to verify a contract in a network with chain id 21343214123, but the plugin doesn't recognize it as a supported chain./);
        }));
    });
    describe("getContractUrl", () => {
        it("should return the contract url", () => {
            const expectedContractAddress = "https://goerli.etherscan.io/address/someAddress#code";
            let etherscan = etherscan_1.Etherscan.fromChainConfig("someApiKey", chainConfig);
            let contractUrl = etherscan.getContractUrl("someAddress");
            chai_1.assert.equal(contractUrl, expectedContractAddress);
            etherscan = etherscan_1.Etherscan.fromChainConfig("someApiKey", {
                network: "goerli",
                chainId: 5,
                urls: {
                    apiURL: "https://api-goerli.etherscan.io/api",
                    browserURL: "   https://goerli.etherscan.io/  ",
                },
            });
            contractUrl = etherscan.getContractUrl("someAddress");
            chai_1.assert.equal(contractUrl, expectedContractAddress);
        });
    });
});
