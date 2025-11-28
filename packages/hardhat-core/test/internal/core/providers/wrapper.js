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
const wrapper_1 = require("../../../../src/internal/core/providers/wrapper");
const errors_1 = require("../../../../src/internal/core/providers/errors");
const mocks_1 = require("./mocks");
describe("ProviderWrapper", () => {
  class WrappedProvider extends wrapper_1.ProviderWrapper {
    request(args) {
      return __awaiter(this, void 0, void 0, function* () {
        return this._wrappedProvider.request(args);
      });
    }
    getParams(args) {
      return this._getParams(args);
    }
  }
  let mock;
  let provider;
  beforeEach(function () {
    mock = new mocks_1.MockedProvider();
    provider = new WrappedProvider(mock);
  });
  describe("EventEmitter", () => {
    let callTimes;
    function eventHandler() {
      callTimes += 1;
    }
    beforeEach(() => {
      callTimes = 0;
    });
    it("it should work as an emitter", () => {
      provider.on("event", eventHandler);
      provider.on("otherevent", eventHandler);
      provider.once("onceevent", eventHandler);
      provider.emit("event"); // 1
      provider.emit("otherevent"); // 2
      provider.emit("onceevent"); // 3
      provider.emit("onceevent"); // 3
      provider.off("otherevent", eventHandler);
      provider.emit("otherevent"); // 3
      chai_1.assert.equal(callTimes, 3);
    });
  });
  describe("get params", () => {
    it("should parse the params and return an array", () => {
      const params = [1, "2", 3, "4"];
      const providerParams = provider.getParams({ method: "amethod", params });
      chai_1.assert.deepEqual(params, providerParams);
    });
    it("should throw if the params are an object", () => {
      const params = { invalid: "params" };
      chai_1.assert.throw(
        () => provider.getParams({ method: "amethod", params }),
        errors_1.InvalidInputError,
        "Hardhat Network doesn't support JSON-RPC params sent as an object"
      );
    });
  });
});
