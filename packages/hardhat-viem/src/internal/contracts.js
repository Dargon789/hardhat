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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getContractAt = exports.sendDeploymentTransaction = exports.innerDeployContract = exports.deployContract = void 0;
const bytecode_1 = require("./bytecode");
const clients_1 = require("./clients");
const errors_1 = require("./errors");
function getContractAbiAndBytecode(artifacts, contractName, libraries) {
    return __awaiter(this, void 0, void 0, function* () {
        const artifact = yield artifacts.readArtifact(contractName);
        const bytecode = yield (0, bytecode_1.resolveBytecodeWithLinkedLibraries)(artifact, libraries);
        return {
            abi: artifact.abi,
            bytecode,
        };
    });
}
function deployContract({ artifacts, network }, contractName, constructorArgs = [], config = {}) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { client, confirmations, libraries = {} } = config, deployContractParameters = __rest(config, ["client", "confirmations", "libraries"]);
        const [publicClient, walletClient, { abi, bytecode }] = yield Promise.all([
            (_a = client === null || client === void 0 ? void 0 : client.public) !== null && _a !== void 0 ? _a : (0, clients_1.getPublicClient)(network.provider),
            (_b = client === null || client === void 0 ? void 0 : client.wallet) !== null && _b !== void 0 ? _b : getDefaultWalletClient(network.provider, network.name),
            getContractAbiAndBytecode(artifacts, contractName, libraries),
        ]);
        return innerDeployContract(publicClient, walletClient, abi, bytecode, constructorArgs, deployContractParameters, confirmations);
    });
}
exports.deployContract = deployContract;
function innerDeployContract(publicClient, walletClient, contractAbi, contractBytecode, constructorArgs, deployContractParameters = {}, confirmations = 1) {
    return __awaiter(this, void 0, void 0, function* () {
        let deploymentTxHash;
        // If gasPrice is defined, then maxFeePerGas and maxPriorityFeePerGas
        // must be undefined because it's a legaxy tx.
        if (deployContractParameters.gasPrice !== undefined) {
            deploymentTxHash = yield walletClient.deployContract(Object.assign(Object.assign({ abi: contractAbi, bytecode: contractBytecode, args: constructorArgs }, deployContractParameters), { maxFeePerGas: undefined, maxPriorityFeePerGas: undefined }));
        }
        else {
            deploymentTxHash = yield walletClient.deployContract(Object.assign(Object.assign({ abi: contractAbi, bytecode: contractBytecode, args: constructorArgs }, deployContractParameters), { gasPrice: undefined }));
        }
        if (confirmations < 0) {
            throw new errors_1.HardhatViemError("Confirmations must be greater than 0.");
        }
        if (confirmations === 0) {
            throw new errors_1.InvalidConfirmationsError();
        }
        const { contractAddress } = yield publicClient.waitForTransactionReceipt({
            hash: deploymentTxHash,
            confirmations,
        });
        if (contractAddress === null || contractAddress === undefined) {
            const transaction = yield publicClient.getTransaction({
                hash: deploymentTxHash,
            });
            throw new errors_1.DeployContractError(deploymentTxHash, transaction.blockNumber);
        }
        const contract = yield innerGetContractAt(publicClient, walletClient, contractAbi, contractAddress);
        return contract;
    });
}
exports.innerDeployContract = innerDeployContract;
function sendDeploymentTransaction({ artifacts, network }, contractName, constructorArgs = [], config = {}) {
    var _a, _b;
    return __awaiter(this, void 0, void 0, function* () {
        const { client, libraries = {} } = config, deployContractParameters = __rest(config, ["client", "libraries"]);
        const [publicClient, walletClient, { abi, bytecode }] = yield Promise.all([
            (_a = client === null || client === void 0 ? void 0 : client.public) !== null && _a !== void 0 ? _a : (0, clients_1.getPublicClient)(network.provider),
            (_b = client === null || client === void 0 ? void 0 : client.wallet) !== null && _b !== void 0 ? _b : getDefaultWalletClient(network.provider, network.name),
            getContractAbiAndBytecode(artifacts, contractName, libraries),
        ]);
        return innerSendDeploymentTransaction(publicClient, walletClient, abi, bytecode, constructorArgs, deployContractParameters);
    });
}
exports.sendDeploymentTransaction = sendDeploymentTransaction;
function innerSendDeploymentTransaction(publicClient, walletClient, contractAbi, contractBytecode, constructorArgs, deployContractParameters = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        let deploymentTxHash;
        // If gasPrice is defined, then maxFeePerGas and maxPriorityFeePerGas
        // must be undefined because it's a legaxy tx.
        if (deployContractParameters.gasPrice !== undefined) {
            deploymentTxHash = yield walletClient.deployContract(Object.assign(Object.assign({ abi: contractAbi, bytecode: contractBytecode, args: constructorArgs }, deployContractParameters), { maxFeePerGas: undefined, maxPriorityFeePerGas: undefined }));
        }
        else {
            deploymentTxHash = yield walletClient.deployContract(Object.assign(Object.assign({ abi: contractAbi, bytecode: contractBytecode, args: constructorArgs }, deployContractParameters), { gasPrice: undefined }));
        }
        const deploymentTx = yield publicClient.getTransaction({
            hash: deploymentTxHash,
        });
        const { getContractAddress } = yield Promise.resolve().then(() => __importStar(require("viem")));
        const contractAddress = getContractAddress({
            from: walletClient.account.address,
            nonce: BigInt(deploymentTx.nonce),
        });
        const contract = yield innerGetContractAt(publicClient, walletClient, contractAbi, contractAddress);
        return { contract, deploymentTransaction: deploymentTx };
    });
}
function getContractAt({ artifacts, network }, contractName, address, config = {}) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
        const [publicClient, walletClient, contractArtifact] = yield Promise.all([
            (_b = (_a = config.client) === null || _a === void 0 ? void 0 : _a.public) !== null && _b !== void 0 ? _b : (0, clients_1.getPublicClient)(network.provider),
            (_d = (_c = config.client) === null || _c === void 0 ? void 0 : _c.wallet) !== null && _d !== void 0 ? _d : getDefaultWalletClient(network.provider, network.name),
            artifacts.readArtifact(contractName),
        ]);
        return innerGetContractAt(publicClient, walletClient, contractArtifact.abi, address);
    });
}
exports.getContractAt = getContractAt;
function innerGetContractAt(publicClient, walletClient, contractAbi, address) {
    return __awaiter(this, void 0, void 0, function* () {
        const viem = yield Promise.resolve().then(() => __importStar(require("viem")));
        const contract = viem.getContract({
            address,
            client: {
                public: publicClient,
                wallet: walletClient,
            },
            abi: contractAbi,
        });
        return contract;
    });
}
function getDefaultWalletClient(provider, networkName) {
    return __awaiter(this, void 0, void 0, function* () {
        const [defaultWalletClient] = yield (0, clients_1.getWalletClients)(provider);
        if (defaultWalletClient === undefined) {
            throw new errors_1.DefaultWalletClientNotFoundError(networkName);
        }
        return defaultWalletClient;
    });
}
