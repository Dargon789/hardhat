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
exports.useHelpers = void 0;
const chai_1 = require("chai");
const base_types_1 = require("../../../../src/internal/core/jsonrpc/types/base-types");
const providers_1 = require("./providers");
/**
 * @deprecated
 */
function useHelpers() {
  beforeEach("Initialize helpers", function () {
    return __awaiter(this, void 0, void 0, function* () {
      if (this.provider === undefined) {
        throw new Error("useHelpers has to be called after useProvider");
      }
      this.sendTx = ({
        from = providers_1.DEFAULT_ACCOUNTS_ADDRESSES[1],
        to = providers_1.DEFAULT_ACCOUNTS_ADDRESSES[2],
        gas = 21000,
        gasPrice,
        data,
        nonce,
        value,
      } = {}) =>
        __awaiter(this, void 0, void 0, function* () {
          const price =
            gasPrice !== null && gasPrice !== void 0
              ? gasPrice
              : (0, base_types_1.rpcQuantityToBigInt)(
                  yield this.provider.send("eth_gasPrice", [])
                );
          return this.provider.send("eth_sendTransaction", [
            {
              from,
              to,
              gas: (0, base_types_1.numberToRpcQuantity)(gas),
              gasPrice: (0, base_types_1.numberToRpcQuantity)(price),
              data,
              nonce:
                nonce !== undefined
                  ? (0, base_types_1.numberToRpcQuantity)(nonce)
                  : undefined,
              value:
                value !== undefined
                  ? (0, base_types_1.numberToRpcQuantity)(value)
                  : undefined,
            },
          ]);
        });
      this.assertLatestBlockTxs = (txs) =>
        __awaiter(this, void 0, void 0, function* () {
          const latestBlock = yield this.provider.send("eth_getBlockByNumber", [
            "latest",
            false,
          ]);
          chai_1.assert.sameMembers(txs, latestBlock.transactions);
        });
      this.assertPendingTxs = (txs) =>
        __awaiter(this, void 0, void 0, function* () {
          const pendingTxs = yield this.provider.send(
            "eth_pendingTransactions"
          );
          const pendingTxsHashes = pendingTxs.map((x) => x.hash);
          chai_1.assert.sameMembers(txs, pendingTxsHashes);
        });
      this.mine = () =>
        __awaiter(this, void 0, void 0, function* () {
          yield this.provider.send("evm_mine");
        });
    });
  });
  afterEach("Remove helpers", function () {
    return __awaiter(this, void 0, void 0, function* () {
      delete this.sendTx;
      delete this.assertLatestBlockTxs;
      delete this.assertPendingTxs;
      delete this.mine;
    });
  });
}
exports.useHelpers = useHelpers;
