"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSuccessStatusCode = exports.sendPostRequest = exports.sendGetRequest = void 0;
function sendGetRequest(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const { request } = yield Promise.resolve().then(() => __importStar(require("undici")));
        const dispatcher = getDispatcher();
        return request(url, {
            dispatcher,
            method: "GET",
        });
    });
}
exports.sendGetRequest = sendGetRequest;
function sendPostRequest(url, body, headers = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const { request } = yield Promise.resolve().then(() => __importStar(require("undici")));
        const dispatcher = getDispatcher();
        return request(url, {
            dispatcher,
            method: "POST",
            headers,
            body,
        });
    });
}
exports.sendPostRequest = sendPostRequest;
function getDispatcher() {
    const { ProxyAgent, getGlobalDispatcher } = require("undici");
    if (process.env.http_proxy !== undefined) {
        return new ProxyAgent(process.env.http_proxy);
    }
    return getGlobalDispatcher();
}
function isSuccessStatusCode(statusCode) {
    return statusCode >= 200 && statusCode <= 299;
}
exports.isSuccessStatusCode = isSuccessStatusCode;
