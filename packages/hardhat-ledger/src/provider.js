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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LedgerProvider = void 0;
const ethers_1 = require("ethers");
const t = __importStar(require("io-ts"));
const util_1 = require("@ethereumjs/util");
const hw_app_eth_1 = require("@ledgerhq/hw-app-eth");
const hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
const validation_1 = require("hardhat/internal/core/jsonrpc/types/input/validation");
const transactionRequest_1 = require("hardhat/internal/core/jsonrpc/types/input/transactionRequest");
const base_types_1 = require("hardhat/internal/core/jsonrpc/types/base-types");
const chainId_1 = require("hardhat/internal/core/providers/chainId");
const errors_1 = require("hardhat/internal/core/errors");
const errors_list_1 = require("hardhat/internal/core/errors-list");
const cache = __importStar(require("./internal/cache"));
const utils_1 = require("./internal/utils");
const wrap_transport_1 = require("./internal/wrap-transport");
const errors_2 = require("./errors");
class LedgerProvider extends chainId_1.ProviderWrapperWithChainId {
    static create(options, wrappedProvider) {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = new LedgerProvider(options, wrappedProvider);
            yield provider.init();
            return provider;
        });
    }
    constructor(options, _wrappedProvider) {
        super(_wrappedProvider);
        this.options = options;
        this.paths = {}; // { address: path }
        this.name = "LedgerProvider";
        this.isOutputEnabled = true;
        this.options.accounts = options.accounts.map((account) => {
            if (!(0, util_1.isValidAddress)(account)) {
                throw new errors_2.HardhatLedgerError(`The following ledger address from the config is invalid: ${account}`);
            }
            return account.toLowerCase();
        });
    }
    get eth() {
        if (this._eth === undefined) {
            throw new errors_1.HardhatError(errors_list_1.ERRORS.GENERAL.UNINITIALIZED_PROVIDER);
        }
        return this._eth;
    }
    init() {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            // If init is called concurrently, it can cause the Ledger to throw
            // because the transport might be in use. This is a known problem but shouldn't happen
            // as init is not called manually. More info read: https://github.com/NomicFoundation/hardhat/pull/4008#discussion_r1233258204
            if (this._eth === undefined) {
                const openTimeout = (_a = this.options.openTimeout) !== null && _a !== void 0 ? _a : LedgerProvider.DEFAULT_TIMEOUT;
                const connectionTimeout = (_b = this.options.connectionTimeout) !== null && _b !== void 0 ? _b : LedgerProvider.DEFAULT_TIMEOUT;
                try {
                    this.emit("connection_start");
                    const transport = yield hw_transport_node_hid_1.default.create(openTimeout, connectionTimeout);
                    this._eth = (0, wrap_transport_1.wrapTransport)(transport);
                    this.emit("connection_success");
                }
                catch (error) {
                    this.emit("connection_failure");
                    if (error instanceof Error) {
                        throw new errors_2.HardhatLedgerConnectionError(error);
                    }
                    throw error;
                }
            }
            try {
                const paths = yield cache.read();
                if (paths !== undefined) {
                    Object.assign(this.paths, paths);
                }
            }
            catch (error) { }
        });
    }
    request(args) {
        return __awaiter(this, void 0, void 0, function* () {
            const params = this._getParams(args);
            if (args.method === "hardhat_setLedgerOutputEnabled") {
                return this._setOutputEnabled(params);
            }
            if (args.method === "eth_accounts") {
                const accounts = (yield this._wrappedProvider.request(args));
                return [...accounts, ...this.options.accounts];
            }
            if (this._methodRequiresSignature(args.method)) {
                try {
                    if (args.method === "eth_sign") {
                        return yield this._ethSign(params);
                    }
                    if (args.method === "personal_sign") {
                        return yield this._personalSign(params);
                    }
                    if (args.method === "eth_signTypedData_v4") {
                        return yield this._ethSignTypedDataV4(params);
                    }
                    if (args.method === "eth_sendTransaction" && params.length > 0) {
                        return yield this._ethSendTransaction(params);
                    }
                }
                catch (error) {
                    // We skip non controlled errors and forward them to the wrapped provider
                    if (!errors_2.HardhatLedgerNotControlledAddressError.instanceOf(error)) {
                        throw error;
                    }
                }
            }
            return this._wrappedProvider.request(args);
        });
    }
    _methodRequiresSignature(method) {
        return [
            "personal_sign",
            "eth_sign",
            "eth_signTypedData_v4",
            "eth_sendTransaction",
        ].includes(method);
    }
    _ethSign(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.length > 0) {
                const [address, data] = (0, validation_1.validateParams)(params, base_types_1.rpcAddress, base_types_1.rpcData);
                yield this._requireControlledInit(address);
                if (address !== undefined) {
                    if (data === undefined) {
                        throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.ETHSIGN_MISSING_DATA_PARAM);
                    }
                    const path = yield this._derivePath(address);
                    const signature = yield this._withConfirmation(() => this.eth.signPersonalMessage(path, data.toString("hex")));
                    return this._toRpcSig(signature);
                }
            }
        });
    }
    _personalSign(params) {
        return __awaiter(this, void 0, void 0, function* () {
            if (params.length > 0) {
                const [data, address] = (0, validation_1.validateParams)(params, base_types_1.rpcData, base_types_1.rpcAddress);
                yield this._requireControlledInit(address);
                if (data !== undefined) {
                    if (address === undefined) {
                        throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.PERSONALSIGN_MISSING_ADDRESS_PARAM);
                    }
                    const path = yield this._derivePath(address);
                    const signature = yield this._withConfirmation(() => this.eth.signPersonalMessage(path, data.toString("hex")));
                    return this._toRpcSig(signature);
                }
            }
        });
    }
    _ethSignTypedDataV4(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const [address, data] = (0, validation_1.validateParams)(params, base_types_1.rpcAddress, t.any);
            yield this._requireControlledInit(address);
            if (data === undefined) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.ETHSIGN_MISSING_DATA_PARAM);
            }
            let typedMessage;
            try {
                typedMessage = typeof data === "string" ? JSON.parse(data) : data;
                if (!(0, hw_app_eth_1.isEIP712Message)(typedMessage)) {
                    throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.ETHSIGN_TYPED_DATA_V4_INVALID_DATA_PARAM);
                }
            }
            catch (_a) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.ETHSIGN_TYPED_DATA_V4_INVALID_DATA_PARAM);
            }
            const { types, domain, message, primaryType } = typedMessage;
            const { EIP712Domain: _ } = types, structTypes = __rest(types, ["EIP712Domain"]);
            const path = yield this._derivePath(address);
            const signature = yield this._withConfirmation(() => __awaiter(this, void 0, void 0, function* () {
                try {
                    return yield this.eth.signEIP712Message(path, typedMessage);
                }
                catch (error) {
                    return this.eth.signEIP712HashedMessage(path, ethers_1.ethers.TypedDataEncoder.hashDomain(domain), ethers_1.ethers.TypedDataEncoder.hashStruct(primaryType, structTypes, message));
                }
            }));
            return this._toRpcSig(signature);
        });
    }
    _ethSendTransaction(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const [txRequest] = (0, validation_1.validateParams)(params, transactionRequest_1.rpcTransactionRequest);
            yield this._requireControlledInit(txRequest.from);
            if (txRequest.gas === undefined) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY, {
                    param: "gas",
                });
            }
            const hasGasPrice = txRequest.gasPrice !== undefined;
            const hasEip1559Fields = txRequest.maxFeePerGas !== undefined ||
                txRequest.maxPriorityFeePerGas !== undefined;
            if (!hasGasPrice && !hasEip1559Fields) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.MISSING_FEE_PRICE_FIELDS);
            }
            if (hasGasPrice && hasEip1559Fields) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.INCOMPATIBLE_FEE_PRICE_FIELDS);
            }
            if (hasEip1559Fields && txRequest.maxFeePerGas === undefined) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY, {
                    param: "maxFeePerGas",
                });
            }
            if (hasEip1559Fields && txRequest.maxPriorityFeePerGas === undefined) {
                throw new errors_1.HardhatError(errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY, {
                    param: "maxPriorityFeePerGas",
                });
            }
            const path = yield this._derivePath(txRequest.from);
            if (txRequest.nonce === undefined) {
                txRequest.nonce = yield this._getNonce(txRequest.from);
            }
            const chainId = yield this._getChainId();
            const baseTx = {
                chainId,
                gasLimit: txRequest.gas,
                gasPrice: txRequest.gasPrice,
                maxFeePerGas: txRequest.maxFeePerGas,
                maxPriorityFeePerGas: txRequest.maxPriorityFeePerGas,
                nonce: Number(txRequest.nonce),
                value: txRequest.value,
            };
            if (txRequest.to !== undefined) {
                baseTx.to = (0, utils_1.toHex)(txRequest.to);
            }
            if (txRequest.data !== undefined) {
                baseTx.data = (0, utils_1.toHex)(txRequest.data);
            }
            const txToSign = ethers_1.ethers.Transaction.from(baseTx).unsignedSerialized.substring(2);
            const resolution = yield hw_app_eth_1.ledgerService.resolveTransaction(txToSign, {}, {});
            const signature = yield this._withConfirmation(() => this.eth.signTransaction(path, txToSign, resolution));
            const rawTransaction = ethers_1.ethers.Transaction.from(Object.assign(Object.assign({}, baseTx), { signature: {
                    v: (0, utils_1.toHex)(signature.v),
                    r: (0, utils_1.toHex)(signature.r),
                    s: (0, utils_1.toHex)(signature.s),
                } })).serialized;
            return this._wrappedProvider.request({
                method: "eth_sendRawTransaction",
                params: [rawTransaction],
            });
        });
    }
    _derivePath(addressToFindAsBuffer) {
        return __awaiter(this, void 0, void 0, function* () {
            const addressToFind = (0, utils_1.toHex)(addressToFindAsBuffer).toLowerCase();
            if (this.paths[addressToFind] !== undefined) {
                return this.paths[addressToFind];
            }
            this.emit("derivation_start");
            let path = "<unset-path>";
            try {
                for (let account = 0; account <= LedgerProvider.MAX_DERIVATION_ACCOUNTS; account++) {
                    path = this._getDerivationPath(account);
                    this.emit("derivation_progress", path, account);
                    const wallet = yield this.eth.getAddress(path);
                    const address = wallet.address.toLowerCase();
                    if (address === addressToFind) {
                        this.emit("derivation_success", path);
                        this.paths[addressToFind] = path;
                        void cache.write(this.paths); // hanging promise
                        return path;
                    }
                }
            }
            catch (error) {
                const message = error.message;
                this.emit("derivation_failure");
                throw new errors_2.HardhatLedgerDerivationPathError(`There was an error trying to derivate path ${path}: "${message}". The wallet might be connected but locked or in the wrong app.`, path);
            }
            this.emit("derivation_failure");
            throw new errors_2.HardhatLedgerDerivationPathError(`Could not find a valid derivation path for ${addressToFind}. Paths from ${this._getDerivationPath(0)} to ${this._getDerivationPath(LedgerProvider.MAX_DERIVATION_ACCOUNTS)} were searched.`, path);
        });
    }
    _getDerivationPath(index) {
        if (this.options.derivationFunction === undefined) {
            return `m/44'/60'/${index}'/0/0`;
        }
        else {
            return this.options.derivationFunction(index);
        }
    }
    _withConfirmation(func) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                this.emit("confirmation_start");
                const result = yield func();
                this.emit("confirmation_success");
                return result;
            }
            catch (error) {
                this.emit("confirmation_failure");
                throw new errors_2.HardhatLedgerError(error.message);
            }
        });
    }
    _toRpcSig(signature) {
        return __awaiter(this, void 0, void 0, function* () {
            const { toRpcSig, toBytes } = yield Promise.resolve().then(() => __importStar(require("@ethereumjs/util")));
            return toRpcSig(BigInt(signature.v - 27), toBytes((0, utils_1.toHex)(signature.r)), toBytes((0, utils_1.toHex)(signature.s)));
        });
    }
    _getNonce(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const { bytesToHex } = yield Promise.resolve().then(() => __importStar(require("@ethereumjs/util")));
            const response = (yield this._wrappedProvider.request({
                method: "eth_getTransactionCount",
                params: [bytesToHex(address), "pending"],
            }));
            return (0, base_types_1.rpcQuantityToBigInt)(response);
        });
    }
    _requireControlledInit(address) {
        return __awaiter(this, void 0, void 0, function* () {
            this._requireControlledAddress(address);
            yield this.init();
        });
    }
    _requireControlledAddress(address) {
        const hexAddress = (0, utils_1.toHex)(address).toLowerCase();
        const isControlledAddress = this.options.accounts.includes(hexAddress);
        if (!isControlledAddress) {
            throw new errors_2.HardhatLedgerNotControlledAddressError("Tried to send a transaction with an address we don't control.", hexAddress);
        }
    }
    /**
     * Toggles the provider's output. Use to suppress default feedback and
     * manage it via events.
     */
    _setOutputEnabled(params) {
        const [enabled] = (0, validation_1.validateParams)(params, t.boolean);
        this.isOutputEnabled = enabled;
    }
}
exports.LedgerProvider = LedgerProvider;
LedgerProvider.MAX_DERIVATION_ACCOUNTS = 20;
LedgerProvider.DEFAULT_TIMEOUT = 3000;
