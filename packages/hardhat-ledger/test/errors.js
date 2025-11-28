"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const errors_1 = require("../src/errors");
describe("HardhatLedgerError", () => {
    it("should set the plugin name of the error", () => {
        const error = new errors_1.HardhatLedgerError("");
        chai_1.assert.equal(error.pluginName, "@nomicfoundation/hardhat-ledger");
    });
    it("should set the message of the error", () => {
        const message = "Some message";
        const error = new errors_1.HardhatLedgerError(message);
        chai_1.assert.equal(error.message, message);
    });
});
describe("HardhatLedgerNotControlledAddressError", () => {
    it("should set the message of the error", () => {
        const message = "Look, a message";
        const error = new errors_1.HardhatLedgerNotControlledAddressError(message, "");
        chai_1.assert.equal(error.message, message);
    });
    it("should store the address", () => {
        const address = "0x3d6e2674e40ea221b4a48663d28eff77af564a50";
        const error = new errors_1.HardhatLedgerNotControlledAddressError("", address);
        chai_1.assert.equal(error.address, address);
    });
    it("should detect a HardhatLedgerNotControlledAddressError", () => {
        chai_1.assert.isFalse(errors_1.HardhatLedgerNotControlledAddressError.instanceOf(new Error()));
        chai_1.assert.isTrue(errors_1.HardhatLedgerNotControlledAddressError.instanceOf(new errors_1.HardhatLedgerNotControlledAddressError("", "")));
    });
});
describe("HardhatLedgerDerivationPathError", () => {
    it("should set the message of the error", () => {
        const message = "Yet another message";
        const error = new errors_1.HardhatLedgerDerivationPathError(message, "");
        chai_1.assert.equal(error.message, message);
    });
    it("should store the path", () => {
        const path = "m/44'/60'/0'/0/0";
        const error = new errors_1.HardhatLedgerDerivationPathError("", path);
        chai_1.assert.equal(error.path, path);
    });
    it("should detect a HardhatLedgerDerivationPathError", () => {
        chai_1.assert.isFalse(errors_1.HardhatLedgerDerivationPathError.instanceOf(new Error()));
        chai_1.assert.isTrue(errors_1.HardhatLedgerDerivationPathError.instanceOf(new errors_1.HardhatLedgerDerivationPathError("", "")));
    });
});
describe("HardhatLedgerConnectionError", () => {
    it("should detect a HardhatLegerConnectionError", () => {
        chai_1.assert.isFalse(errors_1.HardhatLedgerConnectionError.instanceOf(new Error()));
        chai_1.assert.isTrue(errors_1.HardhatLedgerConnectionError.instanceOf(new errors_1.HardhatLedgerConnectionError(new Error(""))));
    });
});
