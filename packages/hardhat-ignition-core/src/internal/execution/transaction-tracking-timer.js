"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionTrackingTimer = void 0;
/**
 * This class is used to track the time that we have been waiting for
 * a transaction to confirm since it was either sent, or since Ignition started
 * and it was already sent.
 *
 * Note: This class doesn't have a method to clear the timer for a transaction
 * but it shouldn't be problematic.
 */
class TransactionTrackingTimer {
    constructor() {
        this._defaultStart = Date.now();
        this._transactionTrackingTimes = {};
    }
    /**
     * Adds a new transaction to track.
     */
    addTransaction(txHash) {
        this._transactionTrackingTimes[txHash] = Date.now();
    }
    /**
     * Returns the time that we have been waiting for a transaction to confirm
     */
    getTransactionTrackingTime(txHash) {
        var _a;
        const start = (_a = this._transactionTrackingTimes[txHash]) !== null && _a !== void 0 ? _a : this._defaultStart;
        return Date.now() - start;
    }
}
exports.TransactionTrackingTimer = TransactionTrackingTimer;
