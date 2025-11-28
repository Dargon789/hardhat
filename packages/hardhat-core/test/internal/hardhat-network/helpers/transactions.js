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
exports.deployContract = void 0;
const base_types_1 = require("../../../../src/internal/core/jsonrpc/types/base-types");
const providers_1 = require("./providers");
function deployContract(
  provider,
  deploymentCode,
  from = providers_1.DEFAULT_ACCOUNTS_ADDRESSES[0],
  value = 0
) {
  return __awaiter(this, void 0, void 0, function* () {
    const hash = yield provider.send("eth_sendTransaction", [
      {
        from,
        data: deploymentCode,
        gas: (0, base_types_1.numberToRpcQuantity)(
          providers_1.DEFAULT_BLOCK_GAS_LIMIT
        ),
        value: (0, base_types_1.numberToRpcQuantity)(value),
      },
    ]);
    const { contractAddress } = yield provider.send(
      "eth_getTransactionReceipt",
      [hash]
    );
    return contractAddress;
  });
}
exports.deployContract = deployContract;
