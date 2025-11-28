"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FixedSenderProvider =
  exports.AutomaticSenderProvider =
  exports.HDWalletProvider =
  exports.LocalAccountsProvider =
    void 0;
const t = __importStar(require("io-ts"));
const errors_1 = require("../errors");
const errors_list_1 = require("../errors-list");
const base_types_1 = require("../jsonrpc/types/base-types");
const transactionRequest_1 = require("../jsonrpc/types/input/transactionRequest");
const validation_1 = require("../jsonrpc/types/input/validation");
const bigInt_1 = require("../../../common/bigInt");
const chainId_1 = require("./chainId");
const util_1 = require("./util");
const wrapper_1 = require("./wrapper");
class LocalAccountsProvider extends chainId_1.ProviderWrapperWithChainId {
  constructor(provider, localAccountsHexPrivateKeys) {
    super(provider);
    this._addressToPrivateKey = new Map();
    this._initializePrivateKeys(localAccountsHexPrivateKeys);
  }
  request(args) {
    return __awaiter(this, void 0, void 0, function* () {
      const {
        ecsign,
        hashPersonalMessage,
        toRpcSig,
        toBytes,
        bytesToHex: bufferToHex,
      } = yield Promise.resolve().then(() =>
        __importStar(require("@ethereumjs/util"))
      );
      const { signTyped } = yield Promise.resolve().then(() =>
        __importStar(require("micro-eth-signer/typed-data"))
      );
      if (
        args.method === "eth_accounts" ||
        args.method === "eth_requestAccounts"
      ) {
        return [...this._addressToPrivateKey.keys()];
      }
      const params = this._getParams(args);
      if (args.method === "eth_sign") {
        if (params.length > 0) {
          const [address, data] = (0, validation_1.validateParams)(
            params,
            base_types_1.rpcAddress,
            base_types_1.rpcData
          );
          if (address !== undefined) {
            if (data === undefined) {
              throw new errors_1.HardhatError(
                errors_list_1.ERRORS.NETWORK.ETHSIGN_MISSING_DATA_PARAM
              );
            }
            const privateKey = this._getPrivateKeyForAddress(address);
            const messageHash = hashPersonalMessage(toBytes(data));
            const signature = ecsign(messageHash, privateKey);
            return toRpcSig(signature.v, signature.r, signature.s);
          }
        }
      }
      if (args.method === "personal_sign") {
        if (params.length > 0) {
          const [data, address] = (0, validation_1.validateParams)(
            params,
            base_types_1.rpcData,
            base_types_1.rpcAddress
          );
          if (data !== undefined) {
            if (address === undefined) {
              throw new errors_1.HardhatError(
                errors_list_1.ERRORS.NETWORK.PERSONALSIGN_MISSING_ADDRESS_PARAM
              );
            }
            const privateKey = this._getPrivateKeyForAddress(address);
            const messageHash = hashPersonalMessage(toBytes(data));
            const signature = ecsign(messageHash, privateKey);
            return toRpcSig(signature.v, signature.r, signature.s);
          }
        }
      }
      if (args.method === "eth_signTypedData_v4") {
        const [address, data] = (0, validation_1.validateParams)(
          params,
          base_types_1.rpcAddress,
          t.any
        );
        if (data === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.ETHSIGN_MISSING_DATA_PARAM
          );
        }
        let typedMessage = data;
        if (typeof data === "string") {
          try {
            typedMessage = JSON.parse(data);
          } catch (_a) {
            throw new errors_1.HardhatError(
              errors_list_1.ERRORS.NETWORK.ETHSIGN_TYPED_DATA_V4_INVALID_DATA_PARAM
            );
          }
        }
        // if we don't manage the address, the method is forwarded
        const privateKey = this._getPrivateKeyForAddressOrNull(address);
        if (privateKey !== null) {
          // Explicitly set extraEntropy to false to make the signing result deterministic
          return signTyped(typedMessage, privateKey, false);
        }
      }
      if (args.method === "eth_sendTransaction" && params.length > 0) {
        const [txRequest] = (0, validation_1.validateParams)(
          params,
          transactionRequest_1.rpcTransactionRequest
        );
        if (txRequest.gas === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY,
            { param: "gas" }
          );
        }
        if (txRequest.from === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY,
            { param: "from" }
          );
        }
        const hasGasPrice = txRequest.gasPrice !== undefined;
        const hasEip1559Fields =
          txRequest.maxFeePerGas !== undefined ||
          txRequest.maxPriorityFeePerGas !== undefined;
        const hasEip7702Fields = txRequest.authorizationList !== undefined;
        if (!hasGasPrice && !hasEip1559Fields) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.MISSING_FEE_PRICE_FIELDS
          );
        }
        if (hasGasPrice && hasEip1559Fields) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.INCOMPATIBLE_FEE_PRICE_FIELDS
          );
        }
        if (hasGasPrice && hasEip7702Fields) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.INCOMPATIBLE_EIP7702_FIELDS
          );
        }
        if (hasEip1559Fields && txRequest.maxFeePerGas === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY,
            { param: "maxFeePerGas" }
          );
        }
        if (hasEip1559Fields && txRequest.maxPriorityFeePerGas === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.MISSING_TX_PARAM_TO_SIGN_LOCALLY,
            { param: "maxPriorityFeePerGas" }
          );
        }
        if (txRequest.to === undefined && txRequest.data === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.DATA_FIELD_CANNOT_BE_NULL_WITH_NULL_ADDRESS
          );
        }
        if (txRequest.nonce === undefined) {
          txRequest.nonce = yield this._getNonce(txRequest.from);
        }
        const privateKey = this._getPrivateKeyForAddress(txRequest.from);
        const chainId = yield this._getChainId();
        const rawTransaction = yield this._getSignedTransaction(
          txRequest,
          chainId,
          privateKey
        );
        return this._wrappedProvider.request({
          method: "eth_sendRawTransaction",
          params: [bufferToHex(rawTransaction)],
        });
      }
      return this._wrappedProvider.request(args);
    });
  }
  _initializePrivateKeys(localAccountsHexPrivateKeys) {
    const {
      bytesToHex: bufferToHex,
      toBytes,
      privateToAddress,
    } = require("@ethereumjs/util");
    const privateKeys = localAccountsHexPrivateKeys.map((h) => toBytes(h));
    for (const pk of privateKeys) {
      const address = bufferToHex(privateToAddress(pk)).toLowerCase();
      this._addressToPrivateKey.set(address, pk);
    }
  }
  _getPrivateKeyForAddress(address) {
    const { bytesToHex: bufferToHex } = require("@ethereumjs/util");
    const pk = this._addressToPrivateKey.get(bufferToHex(address));
    if (pk === undefined) {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.NETWORK.NOT_LOCAL_ACCOUNT,
        {
          account: bufferToHex(address),
        }
      );
    }
    return pk;
  }
  _getPrivateKeyForAddressOrNull(address) {
    try {
      return this._getPrivateKeyForAddress(address);
    } catch (_a) {
      return null;
    }
  }
  _getNonce(address) {
    return __awaiter(this, void 0, void 0, function* () {
      const { bytesToHex: bufferToHex } = yield Promise.resolve().then(() =>
        __importStar(require("@ethereumjs/util"))
      );
      const response = yield this._wrappedProvider.request({
        method: "eth_getTransactionCount",
        params: [bufferToHex(address), "pending"],
      });
      return (0, base_types_1.rpcQuantityToBigInt)(response);
    });
  }
  _getSignedTransaction(transactionRequest, chainId, privateKey) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    return __awaiter(this, void 0, void 0, function* () {
      const { bytesToHex, bytesToInt, bytesToBigInt } =
        yield Promise.resolve().then(() =>
          __importStar(require("@ethereumjs/util"))
        );
      const { addr, Transaction } = yield Promise.resolve().then(() =>
        __importStar(require("micro-eth-signer"))
      );
      const txData = Object.assign(Object.assign({}, transactionRequest), {
        gasLimit: transactionRequest.gas,
      });
      const accessList =
        (_a = txData.accessList) === null || _a === void 0
          ? void 0
          : _a.map(({ address, storageKeys }) => {
              return {
                address: addr.addChecksum(bytesToHex(address)),
                storageKeys:
                  storageKeys !== null
                    ? storageKeys.map((k) => bytesToHex(k))
                    : [],
              };
            });
      const authorizationList =
        (_b = txData.authorizationList) === null || _b === void 0
          ? void 0
          : _b.map(
              ({ chainId: authChainId, address, nonce, yParity, r, s }) => {
                return {
                  chainId: authChainId,
                  address: addr.addChecksum(bytesToHex(address)),
                  nonce,
                  yParity: bytesToInt(yParity),
                  r: bytesToBigInt(r),
                  s: bytesToBigInt(s),
                };
              }
            );
      const checksummedAddress = addr.addChecksum(
        bytesToHex(
          (_c = txData.to) !== null && _c !== void 0 ? _c : new Uint8Array()
        ),
        true
      );
      (0,
      errors_1.assertHardhatInvariant)(txData.nonce !== undefined, "nonce should be defined");
      let transaction;
      const baseTxParams = {
        to: checksummedAddress,
        nonce: txData.nonce,
        chainId:
          (_d = txData.chainId) !== null && _d !== void 0
            ? _d
            : (0, bigInt_1.normalizeToBigInt)(chainId),
        value: (_e = txData.value) !== null && _e !== void 0 ? _e : 0n,
        data: bytesToHex(
          (_f = txData.data) !== null && _f !== void 0 ? _f : new Uint8Array()
        ),
        gasLimit: txData.gasLimit,
      };
      // Disable strict mode for chainIds > 2 ** 32 - 1.
      //
      // micro-eth-signer throws if strict mode is enabled with a chainId above 2 ** 32 - 1
      // (see: https://github.com/paulmillr/micro-eth-signer/blob/baa4b8c922c3253b125e3f46b1fce6dee7c33853/src/tx.ts#L500).
      //
      // As a workaround we disable strict mode for larger chains. This also bypasses
      // other internal checks enforced by the library, which is not ideal.
      const strictMode =
        txData.chainId === undefined || txData.chainId <= BigInt(2 ** 32 - 1);
      if (authorizationList !== undefined) {
        (0, errors_1.assertHardhatInvariant)(
          txData.maxFeePerGas !== undefined,
          "maxFeePerGas should be defined"
        );
        transaction = Transaction.prepare(
          Object.assign(Object.assign({ type: "eip7702" }, baseTxParams), {
            maxFeePerGas: txData.maxFeePerGas,
            maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
            accessList:
              accessList !== null && accessList !== void 0 ? accessList : [],
            authorizationList:
              authorizationList !== null && authorizationList !== void 0
                ? authorizationList
                : [],
          }),
          strictMode
        );
      } else if (txData.maxFeePerGas !== undefined) {
        transaction = Transaction.prepare(
          Object.assign(Object.assign({ type: "eip1559" }, baseTxParams), {
            maxFeePerGas: txData.maxFeePerGas,
            maxPriorityFeePerGas: txData.maxPriorityFeePerGas,
            accessList:
              accessList !== null && accessList !== void 0 ? accessList : [],
          }),
          strictMode
        );
      } else if (accessList !== undefined) {
        transaction = Transaction.prepare(
          Object.assign(Object.assign({ type: "eip2930" }, baseTxParams), {
            gasPrice:
              (_g = txData.gasPrice) !== null && _g !== void 0 ? _g : 0n,
            accessList,
          }),
          strictMode
        );
      } else {
        transaction = Transaction.prepare(
          Object.assign(Object.assign({ type: "legacy" }, baseTxParams), {
            gasPrice:
              (_h = txData.gasPrice) !== null && _h !== void 0 ? _h : 0n,
          }),
          strictMode
        );
      }
      // Explicitly set extraEntropy to false to make the signing result deterministic
      const signedTransaction = transaction.signBy(privateKey, false);
      return signedTransaction.toRawBytes();
    });
  }
}
exports.LocalAccountsProvider = LocalAccountsProvider;
class HDWalletProvider extends LocalAccountsProvider {
  constructor(
    provider,
    mnemonic,
    hdpath = "m/44'/60'/0'/0/",
    initialIndex = 0,
    count = 10,
    passphrase = ""
  ) {
    // NOTE: If mnemonic has space or newline at the beginning or end, it will be trimmed.
    // This is because mnemonic containing them may generate different private keys.
    const trimmedMnemonic = mnemonic.trim();
    const privateKeys = (0, util_1.derivePrivateKeys)(
      trimmedMnemonic,
      hdpath,
      initialIndex,
      count,
      passphrase
    );
    const { bytesToHex: bufferToHex } = require("@ethereumjs/util");
    const privateKeysAsHex = privateKeys.map((pk) => bufferToHex(pk));
    super(provider, privateKeysAsHex);
  }
}
exports.HDWalletProvider = HDWalletProvider;
class SenderProvider extends wrapper_1.ProviderWrapper {
  request(args) {
    return __awaiter(this, void 0, void 0, function* () {
      const method = args.method;
      const params = this._getParams(args);
      if (
        method === "eth_sendTransaction" ||
        method === "eth_call" ||
        method === "eth_estimateGas"
      ) {
        // TODO: Should we validate this type?
        const tx = params[0];
        if (tx !== undefined && tx.from === undefined) {
          const senderAccount = yield this._getSender();
          if (senderAccount !== undefined) {
            tx.from = senderAccount;
          } else if (method === "eth_sendTransaction") {
            throw new errors_1.HardhatError(
              errors_list_1.ERRORS.NETWORK.NO_REMOTE_ACCOUNT_AVAILABLE
            );
          }
        }
      }
      return this._wrappedProvider.request(args);
    });
  }
}
class AutomaticSenderProvider extends SenderProvider {
  _getSender() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._firstAccount === undefined) {
        const accounts = yield this._wrappedProvider.request({
          method: "eth_accounts",
        });
        this._firstAccount = accounts[0];
      }
      return this._firstAccount;
    });
  }
}
exports.AutomaticSenderProvider = AutomaticSenderProvider;
class FixedSenderProvider extends SenderProvider {
  constructor(provider, _sender) {
    super(provider);
    this._sender = _sender;
  }
  _getSender() {
    return __awaiter(this, void 0, void 0, function* () {
      return this._sender;
    });
  }
}
exports.FixedSenderProvider = FixedSenderProvider;
