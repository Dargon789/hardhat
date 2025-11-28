"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatLedgerDerivationPathError = exports.HardhatLedgerConnectionError = exports.HardhatLedgerNotControlledAddressError = exports.HardhatLedgerError = void 0;
const plugins_1 = require("hardhat/plugins");
class HardhatLedgerError extends plugins_1.NomicLabsHardhatPluginError {
    constructor(message, parent) {
        super("@nomicfoundation/hardhat-ledger", message, parent);
    }
}
exports.HardhatLedgerError = HardhatLedgerError;
class HardhatLedgerNotControlledAddressError extends HardhatLedgerError {
    static instanceOf(other) {
        return (other !== undefined &&
            other !== null &&
            other._isNotControlledAddressError === true);
    }
    constructor(message, address) {
        super(message);
        this.address = address;
        this._isNotControlledAddressError = true;
    }
}
exports.HardhatLedgerNotControlledAddressError = HardhatLedgerNotControlledAddressError;
class HardhatLedgerConnectionError extends HardhatLedgerError {
    static instanceOf(other) {
        return (other !== undefined && other !== null && other._isConnectionError === true);
    }
    constructor(error) {
        super(`There was an error trying to establish a connection to the Ledger wallet: "${error.message}".

Make sure your Ledger is connected and unlocked, and that the Ethereum app is open.
`);
        this._isConnectionError = true;
        if (error.name === "TransportError") {
            const transportError = error;
            this.message += `
The error id was: ${transportError.id}
`;
        }
    }
}
exports.HardhatLedgerConnectionError = HardhatLedgerConnectionError;
class HardhatLedgerDerivationPathError extends HardhatLedgerError {
    static instanceOf(other) {
        return (other !== undefined &&
            other !== null &&
            other._isDerivationPathError === true);
    }
    constructor(message, path) {
        super(message);
        this.path = path;
        this._isDerivationPathError = true;
    }
}
exports.HardhatLedgerDerivationPathError = HardhatLedgerDerivationPathError;
