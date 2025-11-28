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
exports.getBalances = exports.getAddresses = void 0;
const account_1 = require("./account");
function getAddresses(accounts) {
    return Promise.all(accounts.map((account) => (0, account_1.getAddressOf)(account)));
}
exports.getAddresses = getAddresses;
function getBalances(accounts, blockNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const { toBigInt } = yield Promise.resolve().then(() => __importStar(require("ethers")));
        const hre = yield Promise.resolve().then(() => __importStar(require("hardhat")));
        const provider = hre.ethers.provider;
        return Promise.all(accounts.map((account) => __awaiter(this, void 0, void 0, function* () {
            var _a;
            const address = yield (0, account_1.getAddressOf)(account);
            const result = yield provider.send("eth_getBalance", [
                address,
                `0x${(_a = blockNumber === null || blockNumber === void 0 ? void 0 : blockNumber.toString(16)) !== null && _a !== void 0 ? _a : 0}`,
            ]);
            return toBigInt(result);
        })));
    });
}
exports.getBalances = getBalances;
