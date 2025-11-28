"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wrapTransport = void 0;
const hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
function wrapTransport(transport) {
    return new hw_app_eth_1.default(transport);
}
exports.wrapTransport = wrapTransport;
