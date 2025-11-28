"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Web3HTTPProviderAdapter = void 0;
const plugins_1 = require("hardhat/plugins");
const util_1 = __importDefault(require("util"));
class Web3HTTPProviderAdapter {
    constructor(provider) {
        this._provider = provider;
        // We bind everything here because some test suits break otherwise
        this.sendAsync = this.sendAsync.bind(this);
        this.send = this.send.bind(this);
        this.isConnected = this.isConnected.bind(this);
        this._sendJsonRpcRequest = this._sendJsonRpcRequest.bind(this);
    }
    send(payload) {
        if (payload !== undefined && payload.method !== undefined) {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-web3-legacy", `Trying to call RPC method ${payload.method}, but synchronous requests are not supported, use pweb3 instead`);
        }
        throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-web3-legacy", "Synchronous requests are not supported, use pweb3 instead");
    }
    sendAsync(payload, callback) {
        if (!Array.isArray(payload)) {
            util_1.default.callbackify(() => this._sendJsonRpcRequest(payload))(callback);
            return;
        }
        util_1.default.callbackify(() => __awaiter(this, void 0, void 0, function* () {
            const responses = [];
            for (const request of payload) {
                const response = yield this._sendJsonRpcRequest(request);
                responses.push(response);
                if (response.error !== undefined) {
                    break;
                }
            }
            return responses;
        }))(callback);
    }
    isConnected() {
        return true;
    }
    _sendJsonRpcRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            const response = {
                id: request.id,
                jsonrpc: "2.0",
            };
            try {
                const result = yield this._provider.send(request.method, request.params);
                response.result = result;
            }
            catch (error) {
                if (error.code === undefined) {
                    throw error;
                }
                response.error = {
                    // This might be a mistake, but I'm leaving it as is just in case,
                    // because it's not obvious what we should do here.
                    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
                    code: error.code ? +error.code : 404,
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
exports.Web3HTTPProviderAdapter = Web3HTTPProviderAdapter;
