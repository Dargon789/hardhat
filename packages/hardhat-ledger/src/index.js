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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
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
const config_1 = require("hardhat/config");
require("./type-extensions");
__exportStar(require("./errors"), exports);
(0, config_1.extendConfig)((config, userConfig) => {
    var _a, _b, _c;
    // set ledgerAccounts to the user configured value, or to [] if there isn't any
    for (const networkName of Object.keys(config.networks)) {
        config.networks[networkName].ledgerAccounts =
            (_c = (_b = (_a = userConfig.networks) === null || _a === void 0 ? void 0 : _a[networkName]) === null || _b === void 0 ? void 0 : _b.ledgerAccounts) !== null && _c !== void 0 ? _c : [];
    }
});
(0, config_1.extendProvider)((provider, config, network) => __awaiter(void 0, void 0, void 0, function* () {
    const { createLedgerProvider } = yield Promise.resolve().then(() => __importStar(require("./internal/create-ledger-provider")));
    const networkConfig = config.networks[network];
    return createLedgerProvider(provider, networkConfig);
}));
