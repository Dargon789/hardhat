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
exports.setupFutureProcessor = void 0;
const future_processor_1 = require("../../../src/internal/execution/future-processor/future-processor");
const transaction_tracking_timer_1 = require("../../../src/internal/execution/transaction-tracking-timer");
const get_default_sender_1 = require("../../../src/internal/execution/utils/get-default-sender");
const memory_journal_1 = require("../../../src/internal/journal/memory-journal");
const assertions_1 = require("../../../src/internal/utils/assertions");
const basic_strategy_1 = require("../../../src/strategies/basic-strategy");
const helpers_1 = require("../../helpers");
function setupFutureProcessor(sendTransaction, transactions) {
    return __awaiter(this, void 0, void 0, function* () {
        const storedDeployedAddresses = {};
        const mockDeploymentLoader = (0, helpers_1.setupMockDeploymentLoader)(new memory_journal_1.MemoryJournal(), storedDeployedAddresses);
        const mockArtifactResolver = (0, helpers_1.setupMockArtifactResolver)();
        const mockJsonRpcClient = setupMockJsonRpcClient(sendTransaction, transactions);
        const basicExecutionStrategy = new basic_strategy_1.BasicStrategy();
        yield basicExecutionStrategy.init(mockDeploymentLoader, mockJsonRpcClient);
        const transactionTrackingTimer = new transaction_tracking_timer_1.TransactionTrackingTimer();
        const mockNonceManager = setupMockNonceManager();
        const processor = new future_processor_1.FutureProcessor(mockDeploymentLoader, mockArtifactResolver, basicExecutionStrategy, mockJsonRpcClient, transactionTrackingTimer, mockNonceManager, 1, // required confirmations
        10, // millisecondBeforeBumpingFees
        100, // maxFeeBumps
        helpers_1.exampleAccounts, {}, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts), false // disableFeeBumping
        );
        return { processor, storedDeployedAddresses };
    });
}
exports.setupFutureProcessor = setupFutureProcessor;
function setupMockNonceManager() {
    let nonceCount = 0;
    return {
        getNextNonce: (_sender) => __awaiter(this, void 0, void 0, function* () {
            return nonceCount++;
        }),
        revertNonce: (_sender) => {
            nonceCount--;
        },
    };
}
function setupMockJsonRpcClient(sendTransaction, transactions) {
    const client = new MockJsonRpcClient(sendTransaction, transactions);
    return client;
}
class MockJsonRpcClient {
    constructor(_sendTransaction, _transactions) {
        this._sendTransaction = _sendTransaction;
        this._transactions = _transactions;
        this._blockNumber = 10;
    }
    getChainId() {
        return __awaiter(this, void 0, void 0, function* () {
            return 31337;
        });
    }
    getNetworkFees() {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                gasPrice: 1000n,
            };
        });
    }
    getLatestBlock() {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumber = this._blockNumber++;
            return {
                hash: `0xblockhash-${blockNumber}`,
                number: blockNumber,
            };
        });
    }
    getBalance(_address, _blockTag) {
        throw new Error("Method not implemented.");
    }
    setBalance(_address, _balance) {
        throw new Error("Method not implemented.");
    }
    call(_callParams, _blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                success: true,
                customErrorReported: false,
                returnData: "0x",
            };
        });
    }
    estimateGas(_transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return 100n;
        });
    }
    sendTransaction(transactionParams) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._sendTransaction(transactionParams);
        });
    }
    sendRawTransaction(_presignedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    getTransactionCount(_address, _blockTag) {
        throw new Error("Method not implemented.");
    }
    getTransaction(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            return {
                hash: txHash,
                fees: {
                    gasPrice: 1000n,
                },
            };
        });
    }
    getTransactionReceipt(txHash) {
        return __awaiter(this, void 0, void 0, function* () {
            (0, assertions_1.assertIgnitionInvariant)(txHash in this._transactions, `No transaction registered in test for the hash ${txHash}`);
            return this._transactions[txHash];
        });
    }
    getCode(_address) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
