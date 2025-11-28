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
exports.EthereumMockedProvider = exports.MockedProvider = void 0;
const events_1 = require("events");
class MockedProvider extends events_1.EventEmitter {
  constructor() {
    super(...arguments);
    // Record<methodName, value>
    this._returnValues = {};
    // Record<methodName, params>
    this._latestParams = {};
    this._numberOfCalls = {};
  }
  // If a lambda is passed as value, it's return value is used.
  setReturnValue(method, value) {
    this._returnValues[method] = value;
  }
  getNumberOfCalls(method) {
    if (this._numberOfCalls[method] === undefined) {
      return 0;
    }
    return this._numberOfCalls[method];
  }
  getLatestParams(method) {
    return this._latestParams[method];
  }
  getTotalNumberOfCalls() {
    return Object.values(this._numberOfCalls).reduce((p, c) => p + c, 0);
  }
  request({ method, params = [] }) {
    return __awaiter(this, void 0, void 0, function* () {
      // stringify the params to make sure they are serializable
      JSON.stringify(params);
      this._latestParams[method] = params;
      if (this._numberOfCalls[method] === undefined) {
        this._numberOfCalls[method] = 1;
      } else {
        this._numberOfCalls[method] += 1;
      }
      let ret = this._returnValues[method];
      if (ret instanceof Function) {
        ret = ret();
      }
      return ret;
    });
  }
}
exports.MockedProvider = MockedProvider;
class EthereumMockedProvider extends events_1.EventEmitter {
  request(_args) {
    return __awaiter(this, void 0, void 0, function* () {});
  }
  send(_method, _params = []) {
    return __awaiter(this, void 0, void 0, function* () {});
  }
  sendAsync(_payload, callback) {
    callback(null, {}); // this is here just to finish the "async" operation
  }
}
exports.EthereumMockedProvider = EthereumMockedProvider;
