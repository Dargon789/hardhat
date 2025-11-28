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
const util_1 = require("util");
const backwards_compatibility_1 = require("../../../../src/internal/core/providers/backwards-compatibility");
const mocks_1 = require("./mocks");
describe("BackwardsCompatibilityProviderAdapter", function () {
  let mock;
  let provider;
  beforeEach(function () {
    mock = new mocks_1.MockedProvider();
    provider =
      new backwards_compatibility_1.BackwardsCompatibilityProviderAdapter(mock);
  });
  describe("send", function () {
    it("Should forward send calls to request", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield provider.send("m", [1, 2, 3]);
        yield provider.send("m2", ["asd"]);
        chai_1.assert.deepEqual(mock.getLatestParams("m"), [1, 2, 3]);
        chai_1.assert.deepEqual(mock.getLatestParams("m2"), ["asd"]);
      });
    });
    it("Should return the same than request", function () {
      return __awaiter(this, void 0, void 0, function* () {
        mock.setReturnValue("m", 123);
        const ret = yield provider.send("m");
        chai_1.assert.equal(ret, 123);
      });
    });
  });
  describe("sendAsync", function () {
    describe("Single request", function () {
      it("Should forward it to request", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const sendAsync = (0, util_1.promisify)(
            provider.sendAsync.bind(provider)
          );
          yield sendAsync({
            id: 123,
            jsonrpc: "2.0",
            method: "m",
            params: [1, 2, 3],
          });
          chai_1.assert.deepEqual(mock.getLatestParams("m"), [1, 2, 3]);
        });
      });
      it("Should return the same than request", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const sendAsync = (0, util_1.promisify)(
            provider.sendAsync.bind(provider)
          );
          mock.setReturnValue("m", 123456);
          const res = yield sendAsync({
            id: 123,
            jsonrpc: "2.0",
            method: "m",
            params: [1, 2, 3],
          });
          chai_1.assert.equal(res.id, 123);
          chai_1.assert.equal(res.jsonrpc, "2.0");
          chai_1.assert.equal(res.result, 123456);
          chai_1.assert.equal(res.error, null);
        });
      });
    });
  });
});
