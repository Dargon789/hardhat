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
const chai_1 = require("chai");
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const base_types_1 = require("../../../../src/internal/core/jsonrpc/types/base-types");
const chainId_1 = require("../../../../src/internal/core/providers/chainId");
const errors_1 = require("../../../helpers/errors");
const mocks_1 = require("./mocks");
describe("ChainIdValidatorProvider", () => {
  it("should fail when configured chain id dont match the real chain id", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const mock = new mocks_1.MockedProvider();
      mock.setReturnValue("eth_chainId", "0xabcabc");
      const wrapper = new chainId_1.ChainIdValidatorProvider(mock, 66666);
      yield (0,
      errors_1.expectHardhatErrorAsync)(() => wrapper.request({ method: "eth_getAccounts", params: [] }), errors_list_1.ERRORS.NETWORK.INVALID_GLOBAL_CHAIN_ID);
    }));
});
class TestProvider extends chainId_1.ProviderWrapperWithChainId {
  request(args) {
    return __awaiter(this, void 0, void 0, function* () {
      return this._wrappedProvider.request(args);
    });
  }
  getChainId() {
    return __awaiter(this, void 0, void 0, function* () {
      return this._getChainId();
    });
  }
}
describe("ProviderWrapperWithChainId", function () {
  it("Should call the provider only once", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const mockedProvider = new mocks_1.MockedProvider();
      mockedProvider.setReturnValue(
        "eth_chainId",
        (0, base_types_1.numberToRpcQuantity)(1)
      );
      mockedProvider.setReturnValue("net_version", "2");
      const testProvider = new TestProvider(mockedProvider);
      chai_1.assert.equal(mockedProvider.getTotalNumberOfCalls(), 0);
      yield testProvider.getChainId();
      chai_1.assert.equal(mockedProvider.getTotalNumberOfCalls(), 1);
      yield testProvider.getChainId();
      chai_1.assert.equal(mockedProvider.getTotalNumberOfCalls(), 1);
      yield testProvider.getChainId();
      chai_1.assert.equal(mockedProvider.getTotalNumberOfCalls(), 1);
      const mockedProvider2 = new mocks_1.MockedProvider();
      mockedProvider2.setReturnValue("net_version", "2");
      const testProvider2 = new TestProvider(mockedProvider2);
      chai_1.assert.equal(mockedProvider2.getTotalNumberOfCalls(), 0);
      yield testProvider2.getChainId();
      // First eth_chainId is called, then net_version, hence 2
      chai_1.assert.equal(mockedProvider2.getTotalNumberOfCalls(), 2);
      yield testProvider2.getChainId();
      chai_1.assert.equal(mockedProvider2.getTotalNumberOfCalls(), 2);
      yield testProvider2.getChainId();
      chai_1.assert.equal(mockedProvider2.getTotalNumberOfCalls(), 2);
    });
  });
  it("Should use eth_chainId if supported", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const mockedProvider = new mocks_1.MockedProvider();
      mockedProvider.setReturnValue(
        "eth_chainId",
        (0, base_types_1.numberToRpcQuantity)(1)
      );
      mockedProvider.setReturnValue("net_version", "2");
      const testProvider = new TestProvider(mockedProvider);
      chai_1.assert.equal(yield testProvider.getChainId(), 1);
    });
  });
  it("Should use net_version if eth_chainId is not supported", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const mockedProvider = new mocks_1.MockedProvider();
      mockedProvider.setReturnValue("net_version", "2");
      const testProvider = new TestProvider(mockedProvider);
      chai_1.assert.equal(yield testProvider.getChainId(), 2);
    });
  });
  it("Should throw if both eth_chainId and net_version fail", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const mockedProvider = new mocks_1.MockedProvider();
      mockedProvider.setReturnValue("eth_chainId", () => {
        throw new Error("Unsupported method");
      });
      mockedProvider.setReturnValue("net_version", () => {
        throw new Error("Unsupported method");
      });
      const testProvider = new TestProvider(mockedProvider);
      try {
        yield testProvider.getChainId();
      } catch (_a) {
        return;
      }
      chai_1.assert.fail("Expected exception not thrown");
    });
  });
});
