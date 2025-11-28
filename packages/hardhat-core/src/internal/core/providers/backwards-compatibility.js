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
exports.BackwardsCompatibilityProviderAdapter = void 0;
const util_1 = __importDefault(require("util"));
const event_emitter_1 = require("../../util/event-emitter");
/**
 * Hardhat predates the EIP1193 (Javascript Ethereum Provider) standard. It was
 * built following a draft of that spec, but then it changed completely. We
 * still need to support the draft api, but internally we use EIP1193. So we
 * use BackwardsCompatibilityProviderAdapter to wrap EIP1193 providers before
 * exposing them to the user.
 */
class BackwardsCompatibilityProviderAdapter extends event_emitter_1.EventEmitterWrapper {
  constructor(_provider) {
    super(_provider);
    this._provider = _provider;
    // We bind everything here because some test suits break otherwise
    this.sendAsync = this.sendAsync.bind(this);
    this.send = this.send.bind(this);
    this._sendJsonRpcRequest = this._sendJsonRpcRequest.bind(this);
  }
  request(args) {
    return this._provider.request(args);
  }
  send(method, params) {
    return this._provider.request({ method, params });
  }
  sendAsync(payload, callback) {
    util_1.default.callbackify(() => this._sendJsonRpcRequest(payload))(
      callback
    );
  }
  _sendJsonRpcRequest(request) {
    return __awaiter(this, void 0, void 0, function* () {
      const response = {
        id: request.id,
        jsonrpc: "2.0",
      };
      try {
        response.result = yield this._provider.request({
          method: request.method,
          params: request.params,
        });
      } catch (error) {
        if (error.code === undefined) {
          // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
          throw error;
        }
        response.error = {
          // This might be a mistake, but I'm leaving it as is just in case,
          // because it's not obvious what we should do here.
          // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
          code: error.code ? +error.code : -1,
          message: error.message,
          data: {
            stack: error.stack,
            name: error.name,
          },
        };
      }
      return response;
    });
  }
}
exports.BackwardsCompatibilityProviderAdapter =
  BackwardsCompatibilityProviderAdapter;
