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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const base_types_1 = require("../../../../src/internal/core/jsonrpc/types/base-types");
const contracts_1 = require("../../hardhat-network/helpers/contracts");
const transactions_1 = require("../../hardhat-network/helpers/transactions");
const providers_1 = require("../../hardhat-network/helpers/providers");
describe("provider errors", function () {
  providers_1.PROVIDERS.forEach(({ name, useProvider }) => {
    describe(`${name} provider`, function () {
      useProvider();
      it("should show the right error message for revert reason strings", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const contractAddress = yield (0, transactions_1.deployContract)(
            this.provider,
            `0x${contracts_1.EXAMPLE_REVERT_CONTRACT.bytecode.object}`
          );
          yield chai_1.assert.isRejected(
            this.provider.send("eth_sendTransaction", [
              {
                from: providers_1.DEFAULT_ACCOUNTS_ADDRESSES[0],
                to: contractAddress,
                data: `${contracts_1.EXAMPLE_REVERT_CONTRACT.selectors.revertsWithReasonString}`,
              },
            ]),
            "reverted with reason string 'a reason'"
          );
        });
      });
      it("should show the right error message for out of gas errors", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const contractAddress = yield (0, transactions_1.deployContract)(
            this.provider,
            `0x${contracts_1.EXAMPLE_CONTRACT.bytecode.object}`
          );
          yield chai_1.assert.isRejected(
            this.provider.send("eth_sendTransaction", [
              {
                from: providers_1.DEFAULT_ACCOUNTS_ADDRESSES[0],
                to: contractAddress,
                data: `${contracts_1.EXAMPLE_CONTRACT.selectors.modifiesState}0000000000000000000000000000000000000000000000000000000000000001`,
                gas: (0, base_types_1.numberToRpcQuantity)(21204),
              },
            ]),
            "Transaction ran out of gas"
          );
        });
      });
      it("should include the right file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          // This test should prevents us from accidentally breaking the async stack
          // trace when using an http provider.
          const contractAddress = yield (0, transactions_1.deployContract)(
            this.provider,
            `0x${contracts_1.EXAMPLE_REVERT_CONTRACT.bytecode.object}`
          );
          let error;
          try {
            yield this.provider.send("eth_sendTransaction", [
              {
                from: providers_1.DEFAULT_ACCOUNTS_ADDRESSES[0],
                to: contractAddress,
                data: `${contracts_1.EXAMPLE_REVERT_CONTRACT.selectors.revertsWithReasonString}`,
              },
            ]);
          } catch (e) {
            error = e;
          }
          chai_1.assert.isDefined(error);
          chai_1.assert.include(
            error.stack,
            path_1.default.join(
              "test",
              "internal",
              "core",
              "providers",
              "errors.ts"
            )
          );
        });
      });
    });
  });
});
