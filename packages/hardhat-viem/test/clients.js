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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chains = __importStar(require("viem/chains"));
const clients_1 = require("../src/internal/clients");
const provider_1 = require("./mocks/provider");
describe("clients", () => {
    describe("innerGetPublicClient", () => {
        it("should return a public client", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetPublicClient)(provider, chains.mainnet);
            chai_1.assert.isDefined(client);
            chai_1.assert.equal(client.type, "publicClient");
            chai_1.assert.equal(client.chain.id, chains.mainnet.id);
        }));
        it("should return a public client with custom parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetPublicClient)(provider, chains.mainnet, {
                pollingInterval: 1000,
                cacheTime: 2000,
            });
            chai_1.assert.equal(client.pollingInterval, 1000);
            chai_1.assert.equal(client.cacheTime, 2000);
            chai_1.assert.equal(client.transport.retryCount, 3);
        }));
        it("should return a public client with default parameters for development networks", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetPublicClient)(provider, chains.hardhat);
            chai_1.assert.equal(client.pollingInterval, 50);
            chai_1.assert.equal(client.cacheTime, 0);
            chai_1.assert.equal(client.transport.retryCount, 0);
        }));
        it("should retry failed calls on public client", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetPublicClient)(provider, chains.mainnet);
            yield (0, chai_1.expect)(client.getBlockNumber()).to.eventually.be.rejectedWith(/unknown RPC error/);
            chai_1.assert.equal(provider.calledCount, 4);
        }));
        it("should not retry failed calls on public client when using a development network", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetPublicClient)(provider, chains.hardhat);
            yield (0, chai_1.expect)(client.getBlockNumber()).to.eventually.be.rejectedWith(/unknown RPC error/);
            chai_1.assert.equal(provider.calledCount, 1);
        }));
    });
    describe("innerGetWalletClients", () => {
        it("should return a list of wallet clients", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const clients = yield (0, clients_1.innerGetWalletClients)(provider, chains.mainnet, [
                "0x1",
                "0x2",
            ]);
            chai_1.assert.isArray(clients);
            chai_1.assert.isNotEmpty(clients);
            clients.forEach((client) => {
                chai_1.assert.equal(client.type, "walletClient");
                chai_1.assert.equal(client.chain.id, chains.mainnet.id);
            });
            chai_1.assert.equal(clients[0].account.address, "0x1");
            chai_1.assert.equal(clients[1].account.address, "0x2");
        }));
        it("should return a list of wallet clients with custom parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const clients = yield (0, clients_1.innerGetWalletClients)(provider, chains.mainnet, ["0x1", "0x2"], {
                pollingInterval: 1000,
                cacheTime: 2000,
            });
            chai_1.assert.isArray(clients);
            chai_1.assert.isNotEmpty(clients);
            clients.forEach((client) => {
                chai_1.assert.equal(client.pollingInterval, 1000);
                chai_1.assert.equal(client.cacheTime, 2000);
            });
        }));
        it("should return a list of wallet clients with default parameters for development networks", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const clients = yield (0, clients_1.innerGetWalletClients)(provider, chains.hardhat, [
                "0x1",
                "0x2",
            ]);
            chai_1.assert.isArray(clients);
            chai_1.assert.isNotEmpty(clients);
            clients.forEach((client) => {
                chai_1.assert.equal(client.pollingInterval, 50);
                chai_1.assert.equal(client.cacheTime, 0);
                chai_1.assert.equal(client.transport.retryCount, 0);
            });
        }));
        it("should retry failed calls on wallet client", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const [client] = yield (0, clients_1.innerGetWalletClients)(provider, chains.mainnet, [
                "0x1",
            ]);
            yield (0, chai_1.expect)(client.getChainId()).to.eventually.be.rejectedWith(/unknown RPC error/);
            chai_1.assert.equal(provider.calledCount, 4);
        }));
        it("should not retry failed calls on wallet client when using a development network", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const [client] = yield (0, clients_1.innerGetWalletClients)(provider, chains.hardhat, [
                "0x1",
            ]);
            yield (0, chai_1.expect)(client.getChainId()).to.eventually.be.rejectedWith(/unknown RPC error/);
            chai_1.assert.equal(provider.calledCount, 1);
        }));
        it("should return an empty array if there are no accounts owned by the user", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const clients = yield (0, clients_1.innerGetWalletClients)(provider, chains.mainnet, []);
            chai_1.assert.isArray(clients);
            chai_1.assert.isEmpty(clients);
        }));
    });
    describe("innerGetTestClient", () => {
        it("should return a test client with hardhat mode", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetTestClient)(provider, chains.hardhat, "hardhat");
            chai_1.assert.isDefined(client);
            chai_1.assert.equal(client.type, "testClient");
            chai_1.assert.equal(client.chain.id, chains.hardhat.id);
            chai_1.assert.equal(client.mode, "hardhat");
        }));
        it("should return a test client with anvil mode", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetTestClient)(provider, chains.foundry, "anvil");
            chai_1.assert.isDefined(client);
            chai_1.assert.equal(client.type, "testClient");
            chai_1.assert.equal(client.chain.id, chains.foundry.id);
            chai_1.assert.equal(client.mode, "anvil");
        }));
        it("should return a test client with custom parameters", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetTestClient)(provider, chains.hardhat, "hardhat", {
                pollingInterval: 1000,
                cacheTime: 2000,
            });
            chai_1.assert.equal(client.pollingInterval, 1000);
            chai_1.assert.equal(client.cacheTime, 2000);
        }));
        it("should return a test client with default parameters for development networks", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetTestClient)(provider, chains.hardhat, "hardhat");
            chai_1.assert.equal(client.pollingInterval, 50);
            chai_1.assert.equal(client.cacheTime, 0);
            chai_1.assert.equal(client.transport.retryCount, 0);
        }));
        it("should not retry failed calls on test client", () => __awaiter(void 0, void 0, void 0, function* () {
            const provider = new provider_1.EthereumMockedProvider();
            const client = yield (0, clients_1.innerGetTestClient)(provider, chains.hardhat, "hardhat");
            yield (0, chai_1.expect)(client.getAutomine()).to.eventually.be.rejectedWith(/unknown RPC error/);
            chai_1.assert.equal(provider.calledCount, 1);
        }));
    });
});
