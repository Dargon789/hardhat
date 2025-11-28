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
exports.sendDummyTransaction = void 0;
const base_types_1 = require("../../../../src/internal/core/jsonrpc/types/base-types");
const providers_1 = require("./providers");
function sendDummyTransaction(
  provider,
  nonce,
  {
    from = providers_1.DEFAULT_ACCOUNTS_ADDRESSES[0],
    to = providers_1.DEFAULT_ACCOUNTS_ADDRESSES[1],
    accessList,
    gas = 21000,
  } = {}
) {
  return __awaiter(this, void 0, void 0, function* () {
    const tx = {
      from,
      to,
      nonce: (0, base_types_1.numberToRpcQuantity)(nonce),
      gas: (0, base_types_1.numberToRpcQuantity)(gas),
    };
    if (accessList !== undefined) {
      tx.accessList = accessList;
    }
    return provider.send("eth_sendTransaction", [tx]);
  });
}
exports.sendDummyTransaction = sendDummyTransaction;
