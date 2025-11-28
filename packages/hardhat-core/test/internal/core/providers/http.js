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
const undici_1 = require("undici");
const http_1 = require("../../../../src/internal/core/providers/http");
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const errors_1 = require("../../../helpers/errors");
const errors_2 = require("../../../../src/internal/core/providers/errors");
const TOO_MANY_REQUEST_STATUS = 429;
function makeMockPool(url) {
  const agent = new undici_1.MockAgent({
    // as advised by https://undici.nodejs.org/#/docs/best-practices/writing-tests
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10, // milliseconds
  });
  // throw when requests are not matched in a MockAgent intercept
  agent.disableNetConnect();
  return new undici_1.MockPool(url, { agent });
}
describe("HttpProvider", function () {
  const url = "http://some.node";
  const networkName = "NetworkName";
  const successResponse = {
    jsonrpc: "2.0",
    id: 1,
    result: "whatever",
  };
  describe("constructor()", function () {
    it("should throw an error if network or forking URL is an empty string", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0, errors_1.expectHardhatError)(() => {
          const emptyURL = "";
          new http_1.HttpProvider(emptyURL, networkName, {}, 20000);
        }, errors_list_1.ERRORS.NETWORK.EMPTY_URL);
        (0, errors_1.expectHardhatError)(() => {
          const emptyURLwithWhitespace = " ";
          new http_1.HttpProvider(
            emptyURLwithWhitespace,
            networkName,
            {},
            20000
          );
        }, errors_list_1.ERRORS.NETWORK.EMPTY_URL);
      });
    });
  });
  describe("request()", function () {
    it("should call mock pool's request()", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mockPool = makeMockPool(url);
        mockPool
          .intercept({ method: "POST", path: "/" })
          .reply(200, successResponse);
        const provider = new http_1.HttpProvider(
          url,
          networkName,
          {},
          20000,
          mockPool
        );
        const result = yield provider.request({ method: "net_version" });
        chai_1.assert.equal(result, successResponse.result);
      });
    });
    it("should retry even if the rate-limit response lacks a retry-after header", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mockPool = makeMockPool(url);
        let tooManyRequestsReturned = false;
        mockPool.intercept({ method: "POST", path: "/" }).reply(() => {
          tooManyRequestsReturned = true;
          return {
            statusCode: TOO_MANY_REQUEST_STATUS,
            data: "",
            responseOptions: { headers: {} },
          };
        });
        mockPool
          .intercept({ method: "POST", path: "/" })
          .reply(200, successResponse);
        const provider = new http_1.HttpProvider(
          url,
          networkName,
          {},
          20000,
          mockPool
        );
        const result = yield provider.request({ method: "net_version" });
        chai_1.assert.equal(result, successResponse.result);
        (0, chai_1.assert)(tooManyRequestsReturned);
      });
    });
    it("should retry upon receiving a rate-limit response that includes a retry-after header", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mockPool = makeMockPool(url);
        let tooManyRequestsReturned = false;
        mockPool.intercept({ method: "POST", path: "/" }).reply(() => {
          tooManyRequestsReturned = true;
          return {
            statusCode: TOO_MANY_REQUEST_STATUS,
            data: "",
            responseOptions: { headers: { "retry-after": "1" } },
          };
        });
        mockPool
          .intercept({ method: "POST", path: "/" })
          .reply(200, successResponse);
        const provider = new http_1.HttpProvider(
          url,
          networkName,
          {},
          20000,
          mockPool
        );
        const result = yield provider.request({ method: "net_version" });
        chai_1.assert.equal(result, successResponse.result);
        (0, chai_1.assert)(tooManyRequestsReturned);
      });
    });
    it("should throw an error if it receives hardhat_setLedgerOutputEnabled as a method", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mockPool = makeMockPool(url);
        mockPool
          .intercept({ method: "POST", path: "/" })
          .reply(200, successResponse);
        const provider = new http_1.HttpProvider(
          url,
          networkName,
          {},
          20000,
          mockPool
        );
        yield (0, chai_1.expect)(
          provider.request({ method: "hardhat_setLedgerOutputEnabled" })
        ).to.be.eventually.rejectedWith(
          errors_2.ProviderError,
          "hardhat_setLedgerOutputEnabled - Method not supported"
        );
      });
    });
  });
});
