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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JsonRpcNonceManager = void 0;
const errors_1 = require("../../../errors");
const errors_list_1 = require("../../errors-list");
/**
 * An implementation of NonceManager that validates the nonces using
 * the _maxUsedNonce params and a JsonRpcClient.
 */
class JsonRpcNonceManager {
    constructor(_jsonRpcClient, _maxUsedNonce) {
        this._jsonRpcClient = _jsonRpcClient;
        this._maxUsedNonce = _maxUsedNonce;
    }
    getNextNonce(sender) {
        return __awaiter(this, void 0, void 0, function* () {
            const pendingCount = yield this._jsonRpcClient.getTransactionCount(sender, "pending");
            const expectedNonce = this._maxUsedNonce[sender] !== undefined
                ? this._maxUsedNonce[sender] + 1
                : pendingCount;
            if (expectedNonce !== pendingCount) {
                throw new errors_1.IgnitionError(errors_list_1.ERRORS.EXECUTION.INVALID_NONCE, {
                    sender,
                    expectedNonce,
                    pendingCount,
                });
            }
            // The nonce hasn't been used yet, but we update as
            // it will be immediately used.
            this._maxUsedNonce[sender] = expectedNonce;
            return expectedNonce;
        });
    }
    revertNonce(sender) {
        this._maxUsedNonce[sender] -= 1;
    }
}
exports.JsonRpcNonceManager = JsonRpcNonceManager;
