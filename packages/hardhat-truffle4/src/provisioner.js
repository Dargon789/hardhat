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
exports.LazyTruffleContractProvisioner = void 0;
const plugins_1 = require("hardhat/plugins");
const util_1 = __importDefault(require("util"));
class LazyTruffleContractProvisioner {
    constructor(web3, _networkConfig, defaultAccount) {
        this._networkConfig = _networkConfig;
        this._deploymentAddresses = {};
        this._defaultAccount = defaultAccount;
        this._web3 = web3;
    }
    provision(Contract, linker) {
        Contract.setProvider(this._web3.currentProvider);
        this._hookCloneCalls(Contract, linker);
        this._setDefaultValues(Contract);
        this._addDefaultParamsHooks(Contract);
        this._hookLink(Contract, linker);
        this._hookDeployed(Contract);
        return new Proxy(Contract, {
            construct(target, argumentsList, newTarget) {
                if (argumentsList.length > 0 && typeof argumentsList[0] === "string") {
                    return target.at(argumentsList[0]);
                }
                return Reflect.construct(target, argumentsList, newTarget);
            },
        });
    }
    _setDefaultValues(Contract) {
        const defaults = {};
        let hasDefaults = false;
        if (typeof this._networkConfig.gas === "number") {
            defaults.gas = this._networkConfig.gas;
            hasDefaults = true;
        }
        if (typeof this._networkConfig.gasPrice === "number") {
            defaults.gasPrice = this._networkConfig.gasPrice;
            hasDefaults = true;
        }
        if (this._defaultAccount !== undefined) {
            defaults.from = this._defaultAccount;
            hasDefaults = true;
        }
        if (hasDefaults) {
            Contract.defaults(defaults);
        }
    }
    _addDefaultParamsHooks(Contract) {
        const originalNew = Contract.new;
        const originalAt = Contract.at;
        const { wrapWithSolidityErrorsCorrection } = require("hardhat/internal/hardhat-network/stack-traces/solidity-errors");
        Contract.new = (...args) => __awaiter(this, void 0, void 0, function* () {
            return wrapWithSolidityErrorsCorrection(() => __awaiter(this, void 0, void 0, function* () {
                args = yield this._ensureTxParamsWithDefaults(args);
                const contractInstance = yield originalNew.apply(Contract, args);
                this._addDefaultParamsToAllInstanceMethods(Contract, contractInstance);
                return contractInstance;
            }), 3);
        });
        Contract.at = (...args) => {
            const contractInstance = originalAt.apply(Contract, args);
            contractInstance.then = (resolve, reject) => {
                delete contractInstance.then;
                Promise.resolve(contractInstance).then(resolve, reject);
            };
            this._addDefaultParamsToAllInstanceMethods(Contract, contractInstance);
            return contractInstance;
        };
    }
    _hookLink(Contract, linker) {
        const originalLink = Contract.link;
        const alreadyLinkedLibs = {};
        let linkingByInstance = false;
        Contract.link = (...args) => {
            // This is a simple way to detect if it is being called with a contract as first argument.
            if (args[0].constructor.name === "TruffleContract") {
                const libName = args[0].constructor.contractName;
                if (alreadyLinkedLibs[libName]) {
                    throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle4", `Contract ${Contract.contractName} has already been linked to ${libName}.`);
                }
                linkingByInstance = true;
                const ret = linker.link(Contract, args[0]);
                alreadyLinkedLibs[libName] = true;
                linkingByInstance = false;
                return ret;
            }
            if (!linkingByInstance) {
                if (typeof args[0] === "string") {
                    throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle4", `Linking contracts by name is not supported by Hardhat. Please use ${Contract.contractName}.link(libraryInstance) instead.`);
                }
                throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle4", `Linking contracts with a map of addresses is not supported by Hardhat. Please use ${Contract.contractName}.link(libraryInstance) instead.`);
            }
            originalLink.apply(Contract, args);
        };
    }
    _addDefaultParamsToAllInstanceMethods(Contract, contractInstance) {
        this._getContractInstanceMethodsToOverride(Contract).forEach((name) => this._addDefaultParamsToInstanceMethod(contractInstance, name));
    }
    _getContractInstanceMethodsToOverride(Contract) {
        const DEFAULT_INSTANCE_METHODS_TO_OVERRIDE = ["sendTransaction"];
        const abiFunctions = Contract.abi
            .filter((item) => item.type === "function")
            .map((item) => item.name);
        return [...DEFAULT_INSTANCE_METHODS_TO_OVERRIDE, ...abiFunctions];
    }
    _addDefaultParamsToInstanceMethod(instance, methodName) {
        const abi = instance.contract.abi.filter((abiElement) => abiElement.name === methodName)[0];
        const isConstant = abi !== undefined &&
            (abi.constant === true ||
                abi.stateMutability === "view" ||
                abi.stateMutability === "pure");
        const original = instance[methodName];
        const originalCall = original.call;
        const originalEstimateGas = original.estimateGas;
        const originalSendTransaction = original.sendTransaction;
        const originalRequest = original.request;
        const { wrapWithSolidityErrorsCorrection } = require("hardhat/internal/hardhat-network/stack-traces/solidity-errors");
        instance[methodName] = (...args) => __awaiter(this, void 0, void 0, function* () {
            return wrapWithSolidityErrorsCorrection(() => __awaiter(this, void 0, void 0, function* () {
                args = yield this._ensureTxParamsWithDefaults(args, !isConstant);
                return original.apply(instance, args);
            }), 3);
        });
        instance[methodName].call = (...args) => __awaiter(this, void 0, void 0, function* () {
            return wrapWithSolidityErrorsCorrection(() => __awaiter(this, void 0, void 0, function* () {
                args = yield this._ensureTxParamsWithDefaults(args, !isConstant);
                return originalCall.apply(original, args);
            }), 3);
        });
        instance[methodName].estimateGas = (...args) => __awaiter(this, void 0, void 0, function* () {
            return wrapWithSolidityErrorsCorrection(() => __awaiter(this, void 0, void 0, function* () {
                args = yield this._ensureTxParamsWithDefaults(args, !isConstant);
                return originalEstimateGas.apply(original, args);
            }), 3);
        });
        instance[methodName].sendTransaction = (...args) => __awaiter(this, void 0, void 0, function* () {
            return wrapWithSolidityErrorsCorrection(() => __awaiter(this, void 0, void 0, function* () {
                args = yield this._ensureTxParamsWithDefaults(args, !isConstant);
                return originalSendTransaction.apply(original, args);
            }), 3);
        });
        instance[methodName].request = (...args) => {
            return originalRequest.apply(original, args);
        };
    }
    _ensureTxParamsWithDefaults(args, isDefaultAccountRequired = true) {
        return __awaiter(this, void 0, void 0, function* () {
            args = this._ensureTxParamsIsPresent(args);
            const txParams = args[args.length - 1];
            args[args.length - 1] = yield this._addDefaultTxParams(txParams, isDefaultAccountRequired);
            return args;
        });
    }
    _ensureTxParamsIsPresent(args) {
        if (this._isLastArgumentTxParams(args)) {
            return args;
        }
        return [...args, {}];
    }
    _isLastArgumentTxParams(args) {
        const lastArg = args[args.length - 1];
        return lastArg && Object.getPrototypeOf(lastArg) === Object.prototype;
    }
    _addDefaultTxParams(txParams, isDefaultAccountRequired = true) {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.assign(Object.assign({}, txParams), { from: yield this._getDefaultAccount(txParams, isDefaultAccountRequired) });
        });
    }
    _getDefaultAccount(txParams, isDefaultAccountRequired = true) {
        return __awaiter(this, void 0, void 0, function* () {
            if (txParams.from !== undefined) {
                return txParams.from;
            }
            if (this._defaultAccount === undefined) {
                const getAccounts = this._web3.eth.getAccounts.bind(this._web3.eth);
                const accounts = yield util_1.default.promisify(getAccounts)();
                if (accounts.length === 0) {
                    if (isDefaultAccountRequired) {
                        throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle4", "There's no account available in the selected network.");
                    }
                    return undefined;
                }
                this._defaultAccount = accounts[0];
            }
            return this._defaultAccount;
        });
    }
    _hookCloneCalls(Contract, linker) {
        const originalClone = Contract.clone;
        Contract.clone = (...args) => {
            const cloned = originalClone.apply(Contract, args);
            return this.provision(cloned, linker);
        };
    }
    _hookDeployed(Contract) {
        Contract.deployed = () => __awaiter(this, void 0, void 0, function* () {
            const address = this._deploymentAddresses[Contract.contractName];
            if (address === undefined) {
                throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle5", `Trying to get deployed instance of ${Contract.contractName}, but none was set.`);
            }
            return Contract.at(address);
        });
        Contract.setAsDeployed = (instance) => {
            if (instance === undefined) {
                delete this._deploymentAddresses[Contract.contractName];
            }
            else {
                this._deploymentAddresses[Contract.contractName] = instance.address;
            }
        };
    }
}
exports.LazyTruffleContractProvisioner = LazyTruffleContractProvisioner;
