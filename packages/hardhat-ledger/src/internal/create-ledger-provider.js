"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createLedgerProvider = void 0;
const provider_1 = require("../provider");
const with_spinners_1 = require("./with-spinners");
function createLedgerProvider(provider, networkConfig) {
    var _a;
    const accounts = networkConfig.ledgerAccounts;
    const derivationFunction = (_a = networkConfig.ledgerOptions) === null || _a === void 0 ? void 0 : _a.derivationFunction;
    const ledgerProvider = new provider_1.LedgerProvider({ accounts, derivationFunction }, provider);
    return (0, with_spinners_1.withSpinners)(ledgerProvider);
}
exports.createLedgerProvider = createLedgerProvider;
