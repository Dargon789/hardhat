"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const getApiKeyAndUrls_1 = require("../../src/utils/getApiKeyAndUrls");
describe("getApiKeyAndUrls", function () {
    it("should return the correct API URLs when given a string", function () {
        const apiKeyList = (0, getApiKeyAndUrls_1.getApiKeyAndUrls)("testApiKey", {
            network: "mainnet",
            chainId: 1,
            urls: {
                apiURL: "https://api.etherscan.io/api",
                browserURL: "https://etherscan.io",
            },
        });
        chai_1.assert.deepEqual(apiKeyList, [
            "testApiKey",
            "https://api.etherscan.io/api",
            "https://etherscan.io",
        ]);
    });
    it("should return the correct API URLs when given an apiKey object", function () {
        const apiKeyList = (0, getApiKeyAndUrls_1.getApiKeyAndUrls)({
            goerli: "goerliApiKey",
            sepolia: "sepoliaApiKey",
        }, {
            network: "goerli",
            chainId: 5,
            urls: {
                apiURL: "https://api-goerli.etherscan.io/api",
                browserURL: "https://goerli.etherscan.io",
            },
        });
        chai_1.assert.deepEqual(apiKeyList, [
            "goerliApiKey",
            "https://api-goerli.etherscan.io/api",
            "https://goerli.etherscan.io",
        ]);
    });
    it("should return the correct API URLs when given a string and the network is not mainnet", function () {
        const apiKeyList = (0, getApiKeyAndUrls_1.getApiKeyAndUrls)("goerliApiKey", {
            network: "goerli",
            chainId: 5,
            urls: {
                apiURL: "https://api-goerli.etherscan.io/api",
                browserURL: "https://goerli.etherscan.io",
            },
        });
        chai_1.assert.deepEqual(apiKeyList, [
            "goerliApiKey",
            "https://api-goerli.etherscan.io/api",
            "https://goerli.etherscan.io",
        ]);
    });
    it("should throw when given an object and a nonexistent network name", function () {
        chai_1.assert.throws(() => (0, getApiKeyAndUrls_1.getApiKeyAndUrls)({
            goerli: "goerliApiKey",
            sepolia: "sepoliaApiKey",
        }, {
            network: "mainnet",
            chainId: 1,
            urls: {
                apiURL: "https://api.etherscan.io/api",
                browserURL: "https://etherscan.io",
            },
        }), /No etherscan API key configured for network mainnet/);
    });
});
