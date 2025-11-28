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
exports.innerGetTestClient = exports.getTestClient = exports.getWalletClient = exports.innerGetWalletClients = exports.getWalletClients = exports.innerGetPublicClient = exports.getPublicClient = void 0;
function getParameters(chain, config) {
    return __awaiter(this, void 0, void 0, function* () {
        const { isDevelopmentNetwork } = yield Promise.resolve().then(() => __importStar(require("./chains")));
        const defaultParameters = isDevelopmentNetwork(chain.id)
            ? { pollingInterval: 50, cacheTime: 0 }
            : {};
        const transportParameters = isDevelopmentNetwork(chain.id)
            ? { retryCount: 0 }
            : {};
        return {
            clientParameters: Object.assign(Object.assign({}, defaultParameters), config),
            transportParameters,
        };
    });
}
/**
 * Get a PublicClient instance. This is a read-only client that can be used to
 * query the blockchain.
 *
 * @param provider The Ethereum provider used to connect to the blockchain.
 * @param publicClientConfig Optional configuration for the PublicClient instance. See the viem documentation for more information.
 * @returns A PublicClient instance.
 */
function getPublicClient(provider, publicClientConfig) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { getChain } = yield Promise.resolve().then(() => __importStar(require("./chains")));
        const chain = (_a = publicClientConfig === null || publicClientConfig === void 0 ? void 0 : publicClientConfig.chain) !== null && _a !== void 0 ? _a : (yield getChain(provider));
        return innerGetPublicClient(provider, chain, publicClientConfig);
    });
}
exports.getPublicClient = getPublicClient;
function innerGetPublicClient(provider, chain, publicClientConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const viem = yield Promise.resolve().then(() => __importStar(require("viem")));
        const { clientParameters, transportParameters } = yield getParameters(chain, publicClientConfig);
        const publicClient = viem.createPublicClient(Object.assign({ chain, transport: viem.custom(provider, transportParameters) }, clientParameters));
        return publicClient;
    });
}
exports.innerGetPublicClient = innerGetPublicClient;
/**
 * Get a list of WalletClient instances. These are read-write clients that can
 * be used to send transactions to the blockchain. Each client is associated
 * with an account obtained from the provider using `eth_accounts`.
 *
 * @param provider The Ethereum provider used to connect to the blockchain.
 * @param walletClientConfig Optional configuration for the WalletClient instances. See the viem documentation for more information.
 * @returns A list of WalletClient instances.
 */
function getWalletClients(provider, walletClientConfig) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { getAccounts } = yield Promise.resolve().then(() => __importStar(require("./accounts")));
        const { getChain } = yield Promise.resolve().then(() => __importStar(require("./chains")));
        const chain = (_a = walletClientConfig === null || walletClientConfig === void 0 ? void 0 : walletClientConfig.chain) !== null && _a !== void 0 ? _a : (yield getChain(provider));
        const accounts = yield getAccounts(provider);
        return innerGetWalletClients(provider, chain, accounts, walletClientConfig);
    });
}
exports.getWalletClients = getWalletClients;
function innerGetWalletClients(provider, chain, accounts, walletClientConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const viem = yield Promise.resolve().then(() => __importStar(require("viem")));
        const { clientParameters, transportParameters } = yield getParameters(chain, walletClientConfig);
        const walletClients = accounts.map((account) => viem.createWalletClient(Object.assign({ chain,
            account, transport: viem.custom(provider, transportParameters) }, clientParameters)));
        return walletClients;
    });
}
exports.innerGetWalletClients = innerGetWalletClients;
/**
 * Get a WalletClient instance for a specific address. This is a read-write
 * client that can be used to send transactions to the blockchain.
 *
 * @param provider The Ethereum provider used to connect to the blockchain.
 * @param address The public address of the account to use.
 * @param walletClientConfig Optional configuration for the WalletClient instance. See the viem documentation for more information.
 * @returns A WalletClient instance.
 */
function getWalletClient(provider, address, walletClientConfig) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { getChain } = yield Promise.resolve().then(() => __importStar(require("./chains")));
        const chain = (_a = walletClientConfig === null || walletClientConfig === void 0 ? void 0 : walletClientConfig.chain) !== null && _a !== void 0 ? _a : (yield getChain(provider));
        return (yield innerGetWalletClients(provider, chain, [address], walletClientConfig))[0];
    });
}
exports.getWalletClient = getWalletClient;
/**
 * Get a TestClient instance. This is a read-write client that can be used to
 * perform actions only available on test nodes such as hardhat or anvil.
 *
 * @param provider The Ethereum provider used to connect to the blockchain.
 * @param testClientConfig Optional configuration for the TestClient instance. See the viem documentation for more information.
 * @returns A TestClient instance.
 */
function getTestClient(provider, testClientConfig) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        const { getChain, getMode } = yield Promise.resolve().then(() => __importStar(require("./chains")));
        const chain = (_a = testClientConfig === null || testClientConfig === void 0 ? void 0 : testClientConfig.chain) !== null && _a !== void 0 ? _a : (yield getChain(provider));
        const mode = yield getMode(provider);
        return innerGetTestClient(provider, chain, mode, testClientConfig);
    });
}
exports.getTestClient = getTestClient;
function innerGetTestClient(provider, chain, mode, testClientConfig) {
    return __awaiter(this, void 0, void 0, function* () {
        const viem = yield Promise.resolve().then(() => __importStar(require("viem")));
        const { clientParameters, transportParameters } = yield getParameters(chain, testClientConfig);
        const testClient = viem.createTestClient(Object.assign({ mode,
            chain, transport: viem.custom(provider, transportParameters) }, clientParameters));
        return testClient;
    });
}
exports.innerGetTestClient = innerGetTestClient;
