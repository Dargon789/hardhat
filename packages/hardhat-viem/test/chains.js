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
const sinon_1 = __importDefault(require("sinon"));
const chains = __importStar(require("viem/chains"));
const chains_1 = require("../src/internal/chains");
const provider_1 = require("./mocks/provider");
describe("chains", () => {
    describe("getChain", () => {
        afterEach(sinon_1.default.restore);
        it("should return the chain corresponding to the chain id", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x1")); // mainnet chain id
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").throws();
            const chain = yield (0, chains_1.getChain)(provider);
            (0, chai_1.expect)(chain).to.deep.equal(chains.mainnet);
            chai_1.assert.equal(sendStub.callCount, 1);
        }));
        it("should return the hardhat chain if the chain id is 31337 and the network is hardhat", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x7a69")); // 31337 in hex
            sendStub.withArgs("hardhat_metadata").returns(Promise.resolve({}));
            sendStub.withArgs("anvil_nodeInfo").throws();
            const chain = yield (0, chains_1.getChain)(provider);
            (0, chai_1.expect)(chain).to.deep.equal(chains.hardhat);
        }));
        it("should return the foundry chain if the chain id is 31337 and the network is foundry", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x7a69")); // 31337 in hex
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").returns(Promise.resolve({}));
            const chain = yield (0, chains_1.getChain)(provider);
            (0, chai_1.expect)(chain).to.deep.equal(chains.foundry);
        }));
        it("should throw if the chain id is 31337 and the network is neither hardhat nor foundry", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x7a69")); // 31337 in hex
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").throws();
            yield (0, chai_1.expect)((0, chains_1.getChain)(provider)).to.be.rejectedWith(`The chain id corresponds to a development network but we couldn't detect which one.
Please report this issue if you're using Hardhat or Foundry.`);
        }));
        it("should throw if the chain id is not 31337 and there is no chain with that id", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x0")); // fake chain id 0
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").throws();
            yield (0, chai_1.expect)((0, chains_1.getChain)(provider)).to.be.rejectedWith(/No network with chain id 0 found/);
        }));
        it("should throw if the chain id is not 31337 and there are multiple chains with that id", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            // chain id 999 corresponds to Wanchain Testnet but also Zora Goerli Testnet
            sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x3e7"));
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").throws();
            yield (0, chai_1.expect)((0, chains_1.getChain)(provider)).to.be.rejectedWith(/Multiple networks with chain id 999 found./);
        }));
    });
    describe("isDevelopmentNetwork", () => {
        it("should return true if the chain id is 31337", () => {
            chai_1.assert.ok((0, chains_1.isDevelopmentNetwork)(31337));
        });
        it("should return false if the chain id is not 31337", () => {
            chai_1.assert.notOk((0, chains_1.isDevelopmentNetwork)(1));
        });
    });
    describe("getMode", () => {
        it("should return hardhat if the network is hardhat", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("hardhat_metadata").returns(Promise.resolve({}));
            sendStub.withArgs("anvil_nodeInfo").throws();
            const mode = yield (0, chains_1.getMode)(provider);
            (0, chai_1.expect)(mode).to.equal("hardhat");
        }));
        it("should return anvil if the network is foundry", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").returns(Promise.resolve({}));
            const mode = yield (0, chains_1.getMode)(provider);
            (0, chai_1.expect)(mode).to.equal("anvil");
        }));
        it("should throw if the network is neither hardhat nor foundry", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const sendStub = sinon_1.default.stub(provider, "send");
            sendStub.withArgs("hardhat_metadata").throws();
            sendStub.withArgs("anvil_nodeInfo").throws();
            yield (0, chai_1.expect)((0, chains_1.getMode)(provider)).to.be.rejectedWith(`The chain id corresponds to a development network but we couldn't detect which one.
Please report this issue if you're using Hardhat or Foundry.`);
        }));
        it("should return a hardhat chain with the custom chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = new provider_1.EthereumMockedProvider();
                const sendStub = sinon_1.default.stub(provider, "send");
                sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x3039")); // 12345 in hex
                sendStub.withArgs("hardhat_metadata").returns(Promise.resolve({}));
                sendStub.withArgs("anvil_nodeInfo").throws();
                const chain = yield (0, chains_1.getChain)(provider);
                (0, chai_1.expect)(chain.id).to.equal(12345);
                (0, chai_1.expect)(chain.name).to.equal("Hardhat");
            });
        });
        it("should return a foundry chain with the custom chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = new provider_1.EthereumMockedProvider();
                const sendStub = sinon_1.default.stub(provider, "send");
                sendStub.withArgs("eth_chainId").returns(Promise.resolve("0x3039")); // 12345 in hex
                sendStub.withArgs("anvil_nodeInfo").returns(Promise.resolve({}));
                sendStub.withArgs("hardhat_metadata").throws();
                const chain = yield (0, chains_1.getChain)(provider);
                (0, chai_1.expect)(chain.id).to.equal(12345);
                (0, chai_1.expect)(chain.name).to.equal("Foundry");
            });
        });
    });
});
