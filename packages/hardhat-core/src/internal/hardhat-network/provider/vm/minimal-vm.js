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
exports.getMinimalEthereumJsVm =
  exports.MinimalEthereumJsEvmEventEmitter =
  exports.MinimalEthereumJsVmEventEmitter =
    void 0;
const util_1 = require("@ethereumjs/util");
class MinimalEthereumJsVmEventEmitter extends util_1.AsyncEventEmitter {}
exports.MinimalEthereumJsVmEventEmitter = MinimalEthereumJsVmEventEmitter;
class MinimalEthereumJsEvmEventEmitter extends util_1.AsyncEventEmitter {}
exports.MinimalEthereumJsEvmEventEmitter = MinimalEthereumJsEvmEventEmitter;
function getMinimalEthereumJsVm(provider) {
  const minimalEthereumJsVm = {
    events: new MinimalEthereumJsVmEventEmitter(),
    evm: {
      events: new MinimalEthereumJsEvmEventEmitter(),
    },
    stateManager: {
      putContractCode: (address, code) =>
        __awaiter(this, void 0, void 0, function* () {
          yield provider.handleRequest(
            JSON.stringify({
              method: "hardhat_setCode",
              params: [address.toString(), `0x${code.toString("hex")}`],
            })
          );
        }),
      getContractStorage: (address, slotHash) =>
        __awaiter(this, void 0, void 0, function* () {
          const responseObject = yield provider.handleRequest(
            JSON.stringify({
              method: "eth_getStorageAt",
              params: [address.toString(), `0x${slotHash.toString("hex")}`],
            })
          );
          let response;
          if (typeof responseObject.data === "string") {
            response = JSON.parse(responseObject.data);
          } else {
            response = responseObject.data;
          }
          return Buffer.from(response.result.slice(2), "hex");
        }),
      putContractStorage: (address, slotHash, slotValue) =>
        __awaiter(this, void 0, void 0, function* () {
          yield provider.handleRequest(
            JSON.stringify({
              method: "hardhat_setStorageAt",
              params: [
                address.toString(),
                `0x${slotHash.toString("hex")}`,
                `0x${slotValue.toString("hex")}`,
              ],
            })
          );
        }),
    },
  };
  return minimalEthereumJsVm;
}
exports.getMinimalEthereumJsVm = getMinimalEthereumJsVm;
