"use strict";
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
exports.ChainIdValidatorProvider = exports.ProviderWrapperWithChainId = void 0;
const errors_1 = require("../errors");
const errors_list_1 = require("../errors-list");
const base_types_1 = require("../jsonrpc/types/base-types");
const wrapper_1 = require("./wrapper");
class ProviderWrapperWithChainId extends wrapper_1.ProviderWrapper {
  _getChainId() {
    return __awaiter(this, void 0, void 0, function* () {
      if (this._chainId === undefined) {
        try {
          this._chainId = yield this._getChainIdFromEthChainId();
        } catch (_a) {
          // If eth_chainId fails we default to net_version
          this._chainId = yield this._getChainIdFromEthNetVersion();
        }
      }
      return this._chainId;
    });
  }
  _getChainIdFromEthChainId() {
    return __awaiter(this, void 0, void 0, function* () {
      const id = yield this._wrappedProvider.request({
        method: "eth_chainId",
      });
      return (0, base_types_1.rpcQuantityToNumber)(id);
    });
  }
  _getChainIdFromEthNetVersion() {
    return __awaiter(this, void 0, void 0, function* () {
      const id = yield this._wrappedProvider.request({
        method: "net_version",
      });
      // There's a node returning this as decimal instead of QUANTITY.
      // TODO: Document here which node does that
      return id.startsWith("0x")
        ? (0, base_types_1.rpcQuantityToNumber)(id)
        : parseInt(id, 10);
    });
  }
}
exports.ProviderWrapperWithChainId = ProviderWrapperWithChainId;
class ChainIdValidatorProvider extends ProviderWrapperWithChainId {
  constructor(provider, _expectedChainId) {
    super(provider);
    this._expectedChainId = _expectedChainId;
    this._alreadyValidated = false;
  }
  request(args) {
    return __awaiter(this, void 0, void 0, function* () {
      if (!this._alreadyValidated) {
        const actualChainId = yield this._getChainId();
        if (actualChainId !== this._expectedChainId) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.NETWORK.INVALID_GLOBAL_CHAIN_ID,
            {
              configChainId: this._expectedChainId,
              connectionChainId: actualChainId,
            }
          );
        }
        this._alreadyValidated = true;
      }
      return this._wrappedProvider.request(args);
    });
  }
}
exports.ChainIdValidatorProvider = ChainIdValidatorProvider;
