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
exports.getMode = exports.isDevelopmentNetwork = exports.getChain = void 0;
const lodash_memoize_1 = __importDefault(require("lodash.memoize"));
const errors_1 = require("./errors");
function getChain(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        const chains = require("viem/chains");
        const chainId = yield getChainId(provider);
        if (isDevelopmentNetwork(chainId)) {
            if (yield isHardhatNetwork(provider)) {
                return chains.hardhat;
            }
            else if (yield isFoundryNetwork(provider)) {
                return chains.foundry;
            }
            else {
                throw new errors_1.UnknownDevelopmentNetworkError();
            }
        }
        const matchingChains = Object.values(chains).filter(({ id }) => id === chainId);
        if (matchingChains.length === 0) {
            if (yield isHardhatNetwork(provider)) {
                return Object.assign(Object.assign({}, chains.hardhat), { id: chainId });
            }
            else if (yield isFoundryNetwork(provider)) {
                return Object.assign(Object.assign({}, chains.foundry), { id: chainId });
            }
            else {
                throw new errors_1.NetworkNotFoundError(chainId);
            }
        }
        if (matchingChains.length > 1) {
            throw new errors_1.MultipleMatchingNetworksError(chainId);
        }
        return matchingChains[0];
    });
}
exports.getChain = getChain;
function isDevelopmentNetwork(chainId) {
    return chainId === 31337;
}
exports.isDevelopmentNetwork = isDevelopmentNetwork;
function getMode(provider) {
    return __awaiter(this, void 0, void 0, function* () {
        if (yield isHardhatNetwork(provider)) {
            return "hardhat";
        }
        else if (yield isFoundryNetwork(provider)) {
            return "anvil";
        }
        else {
            throw new errors_1.UnknownDevelopmentNetworkError();
        }
    });
}
exports.getMode = getMode;
const getChainId = (0, lodash_memoize_1.default)((provider) => __awaiter(void 0, void 0, void 0, function* () { return Number(yield provider.send("eth_chainId")); }));
const isHardhatNetwork = (0, lodash_memoize_1.default)((provider) => __awaiter(void 0, void 0, void 0, function* () { return detectNetworkByMethodName(provider, NetworkMethod.HARDHAT_METADATA); }));
const isFoundryNetwork = (0, lodash_memoize_1.default)((provider) => __awaiter(void 0, void 0, void 0, function* () { return detectNetworkByMethodName(provider, NetworkMethod.ANVIL_NODE_INFO); }));
var NetworkMethod;
(function (NetworkMethod) {
    NetworkMethod["HARDHAT_METADATA"] = "hardhat_metadata";
    NetworkMethod["ANVIL_NODE_INFO"] = "anvil_nodeInfo";
})(NetworkMethod || (NetworkMethod = {}));
function detectNetworkByMethodName(provider, methodName) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield provider.send(methodName);
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
