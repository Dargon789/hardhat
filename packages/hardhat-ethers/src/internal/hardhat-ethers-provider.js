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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HardhatEthersProvider = void 0;
const debug_1 = __importDefault(require("debug"));
const ethers_1 = require("ethers");
const signers_1 = require("../signers");
const ethers_utils_1 = require("./ethers-utils");
const errors_1 = require("./errors");
const log = (0, debug_1.default)("hardhat:hardhat-ethers:provider");
class HardhatEthersProvider {
    constructor(_hardhatProvider, _networkName) {
        this._hardhatProvider = _hardhatProvider;
        this._networkName = _networkName;
        this._blockListeners = [];
        this._transactionHashListeners = new Map();
        this._eventListeners = [];
    }
    get provider() {
        return this;
    }
    destroy() { }
    send(method, params) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._hardhatProvider.send(method, params);
        });
    }
    getSigner(address) {
        return __awaiter(this, void 0, void 0, function* () {
            if (address === null || address === undefined) {
                address = 0;
            }
            const accountsPromise = this.send("eth_accounts", []);
            // Account index
            if (typeof address === "number") {
                const accounts = yield accountsPromise;
                if (address >= accounts.length) {
                    throw new errors_1.AccountIndexOutOfRange(address, accounts.length);
                }
                return signers_1.HardhatEthersSigner.create(this, accounts[address]);
            }
            if (typeof address === "string") {
                return signers_1.HardhatEthersSigner.create(this, address);
            }
            throw new errors_1.HardhatEthersError(`Couldn't get account ${address}`);
        });
    }
    getBlockNumber() {
        return __awaiter(this, void 0, void 0, function* () {
            const blockNumber = yield this._hardhatProvider.send("eth_blockNumber");
            return Number(blockNumber);
        });
    }
    getNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            const chainId = yield this._hardhatProvider.send("eth_chainId");
            return new ethers_1.Network(this._networkName, Number(chainId));
        });
    }
    getFeeData() {
        return __awaiter(this, void 0, void 0, function* () {
            let gasPrice;
            let maxFeePerGas;
            let maxPriorityFeePerGas;
            try {
                gasPrice = BigInt(yield this._hardhatProvider.send("eth_gasPrice"));
            }
            catch (_a) { }
            const latestBlock = yield this.getBlock("latest");
            const baseFeePerGas = latestBlock === null || latestBlock === void 0 ? void 0 : latestBlock.baseFeePerGas;
            if (baseFeePerGas !== undefined && baseFeePerGas !== null) {
                try {
                    maxPriorityFeePerGas = BigInt(yield this._hardhatProvider.send("eth_maxPriorityFeePerGas"));
                }
                catch (_b) {
                    // the max priority fee RPC call is not supported by
                    // this chain
                }
                maxPriorityFeePerGas = maxPriorityFeePerGas !== null && maxPriorityFeePerGas !== void 0 ? maxPriorityFeePerGas : 1000000000n;
                maxFeePerGas = 2n * baseFeePerGas + maxPriorityFeePerGas;
            }
            return new ethers_1.FeeData(gasPrice, maxFeePerGas, maxPriorityFeePerGas);
        });
    }
    getBalance(address, blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedAddress = yield this._getAddress(address);
            const resolvedBlockTag = yield this._getBlockTag(blockTag);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            const balance = yield this._hardhatProvider.send("eth_getBalance", [
                resolvedAddress,
                rpcBlockTag,
            ]);
            return BigInt(balance);
        });
    }
    getTransactionCount(address, blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedAddress = yield this._getAddress(address);
            const resolvedBlockTag = yield this._getBlockTag(blockTag);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            const transactionCount = yield this._hardhatProvider.send("eth_getTransactionCount", [resolvedAddress, rpcBlockTag]);
            return Number(transactionCount);
        });
    }
    getCode(address, blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedAddress = yield this._getAddress(address);
            const resolvedBlockTag = yield this._getBlockTag(blockTag);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            return this._hardhatProvider.send("eth_getCode", [
                resolvedAddress,
                rpcBlockTag,
            ]);
        });
    }
    getStorage(address, position, blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedAddress = yield this._getAddress(address);
            const resolvedPosition = (0, ethers_1.getBigInt)(position, "position");
            const resolvedBlockTag = yield this._getBlockTag(blockTag);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            return this._hardhatProvider.send("eth_getStorageAt", [
                resolvedAddress,
                `0x${resolvedPosition.toString(16)}`,
                rpcBlockTag,
            ]);
        });
    }
    estimateGas(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const blockTag = tx.blockTag === undefined ? "pending" : this._getBlockTag(tx.blockTag);
            const [resolvedTx, resolvedBlockTag] = yield Promise.all([
                this._getTransactionRequest(tx),
                blockTag,
            ]);
            const rpcTransaction = (0, ethers_utils_1.getRpcTransaction)(resolvedTx);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            const gasEstimation = yield this._hardhatProvider.send("eth_estimateGas", [
                rpcTransaction,
                rpcBlockTag,
            ]);
            return BigInt(gasEstimation);
        });
    }
    call(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const [resolvedTx, resolvedBlockTag] = yield Promise.all([
                this._getTransactionRequest(tx),
                this._getBlockTag(tx.blockTag),
            ]);
            const rpcTransaction = (0, ethers_utils_1.getRpcTransaction)(resolvedTx);
            const rpcBlockTag = this._getRpcBlockTag(resolvedBlockTag);
            return this._hardhatProvider.send("eth_call", [
                rpcTransaction,
                rpcBlockTag,
            ]);
        });
    }
    broadcastTransaction(signedTx) {
        return __awaiter(this, void 0, void 0, function* () {
            const hashPromise = this._hardhatProvider.send("eth_sendRawTransaction", [
                signedTx,
            ]);
            const [hash, blockNumber] = yield Promise.all([
                hashPromise,
                this.getBlockNumber(),
            ]);
            const tx = ethers_1.Transaction.from(signedTx);
            if (tx.hash === null) {
                throw new errors_1.HardhatEthersError("Assertion error: hash of signed tx shouldn't be null");
            }
            if (tx.hash !== hash) {
                throw new errors_1.BroadcastedTxDifferentHash(tx.hash, hash);
            }
            return this._wrapTransactionResponse(tx).replaceableTransaction(blockNumber);
        });
    }
    getBlock(blockHashOrBlockTag, prefetchTxs) {
        return __awaiter(this, void 0, void 0, function* () {
            const block = yield this._getBlock(blockHashOrBlockTag, prefetchTxs !== null && prefetchTxs !== void 0 ? prefetchTxs : false);
            // eslint-disable-next-line eqeqeq
            if (block == null) {
                return null;
            }
            return this._wrapBlock(block);
        });
    }
    getTransaction(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const transaction = yield this._hardhatProvider.send("eth_getTransactionByHash", [hash]);
            // eslint-disable-next-line eqeqeq
            if (transaction == null) {
                return null;
            }
            return this._wrapTransactionResponse((0, ethers_utils_1.formatTransactionResponse)(transaction));
        });
    }
    getTransactionReceipt(hash) {
        return __awaiter(this, void 0, void 0, function* () {
            const receipt = yield this._hardhatProvider.send("eth_getTransactionReceipt", [hash]);
            // eslint-disable-next-line eqeqeq
            if (receipt == null) {
                return null;
            }
            return this._wrapTransactionReceipt(receipt);
        });
    }
    getTransactionResult(_hash) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new errors_1.NotImplementedError("HardhatEthersProvider.getTransactionResult");
        });
    }
    getLogs(filter) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedFilter = yield this._getFilter(filter);
            const logs = yield this._hardhatProvider.send("eth_getLogs", [
                resolvedFilter,
            ]);
            return logs.map((l) => this._wrapLog((0, ethers_utils_1.formatLog)(l)));
        });
    }
    resolveName(_ensName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new errors_1.NotImplementedError("HardhatEthersProvider.resolveName");
        });
    }
    lookupAddress(_address) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new errors_1.NotImplementedError("HardhatEthersProvider.lookupAddress");
        });
    }
    waitForTransaction(_hash, _confirms, _timeout) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new errors_1.NotImplementedError("HardhatEthersProvider.waitForTransaction");
        });
    }
    waitForBlock(_blockTag) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new errors_1.NotImplementedError("HardhatEthersProvider.waitForBlock");
        });
    }
    // -------------------------------------- //
    // event-emitter related public functions //
    // -------------------------------------- //
    on(ethersEvent, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = ethersToHardhatEvent(ethersEvent);
            if (event.kind === "block") {
                yield this._onBlock(listener, { once: false });
            }
            else if (event.kind === "transactionHash") {
                yield this._onTransactionHash(event.txHash, listener, { once: false });
            }
            else if (event.kind === "event") {
                const { eventFilter } = event;
                const blockListener = this._getBlockListenerForEvent(eventFilter, listener);
                this._addEventListener(eventFilter, listener, blockListener);
                yield this.on("block", blockListener);
            }
            else {
                const _exhaustiveCheck = event;
            }
            return this;
        });
    }
    once(ethersEvent, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = ethersToHardhatEvent(ethersEvent);
            if (event.kind === "block") {
                yield this._onBlock(listener, { once: true });
            }
            else if (event.kind === "transactionHash") {
                yield this._onTransactionHash(event.txHash, listener, { once: true });
            }
            else if (event.kind === "event") {
                const { eventFilter } = event;
                const blockListener = this._getBlockListenerForEvent(eventFilter, listener);
                this._addEventListener(eventFilter, listener, blockListener);
                yield this.once("block", blockListener);
            }
            else {
                const _exhaustiveCheck = event;
            }
            return this;
        });
    }
    emit(ethersEvent, ...args) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = ethersToHardhatEvent(ethersEvent);
            if (event.kind === "block") {
                return this._emitBlock(...args);
            }
            else if (event.kind === "transactionHash") {
                return this._emitTransactionHash(event.txHash, ...args);
            }
            else if (event.kind === "event") {
                throw new errors_1.NotImplementedError("emit(event)");
            }
            else {
                const _exhaustiveCheck = event;
                return _exhaustiveCheck;
            }
        });
    }
    listenerCount(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const listeners = yield this.listeners(event);
            return listeners.length;
        });
    }
    listeners(ethersEvent) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            if (ethersEvent === undefined) {
                throw new errors_1.NotImplementedError("listeners()");
            }
            const event = ethersToHardhatEvent(ethersEvent);
            if (event.kind === "block") {
                return this._blockListeners.map(({ listener }) => listener);
            }
            else if (event.kind === "transactionHash") {
                return ((_b = (_a = this._transactionHashListeners
                    .get(event.txHash)) === null || _a === void 0 ? void 0 : _a.map(({ listener }) => listener)) !== null && _b !== void 0 ? _b : []);
            }
            else if (event.kind === "event") {
                const isEqual = require("lodash.isequal");
                const eventListener = this._eventListeners.find((item) => isEqual(item.event, event));
                if (eventListener === undefined) {
                    return [];
                }
                return [...eventListener.listenersMap.keys()];
            }
            else {
                const _exhaustiveCheck = event;
                return _exhaustiveCheck;
            }
        });
    }
    off(ethersEvent, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = ethersToHardhatEvent(ethersEvent);
            if (event.kind === "block") {
                this._clearBlockListeners(listener);
            }
            else if (event.kind === "transactionHash") {
                this._clearTransactionHashListeners(event.txHash, listener);
            }
            else if (event.kind === "event") {
                const { eventFilter } = event;
                if (listener === undefined) {
                    yield this._clearEventListeners(eventFilter);
                }
                else {
                    yield this._removeEventListener(eventFilter, listener);
                }
            }
            else {
                const _exhaustiveCheck = event;
            }
            return this;
        });
    }
    removeAllListeners(ethersEvent) {
        return __awaiter(this, void 0, void 0, function* () {
            const event = ethersEvent !== undefined ? ethersToHardhatEvent(ethersEvent) : undefined;
            if (event === undefined || event.kind === "block") {
                this._clearBlockListeners();
            }
            if (event === undefined || event.kind === "transactionHash") {
                this._clearTransactionHashListeners(event === null || event === void 0 ? void 0 : event.txHash);
            }
            if (event === undefined || event.kind === "event") {
                yield this._clearEventListeners(event === null || event === void 0 ? void 0 : event.eventFilter);
            }
            if (event !== undefined &&
                event.kind !== "block" &&
                event.kind !== "transactionHash" &&
                event.kind !== "event") {
                // this check is only to remember to add a proper if block
                // in this method's implementation if we add support for a
                // new kind of event
                const _exhaustiveCheck = event;
            }
            return this;
        });
    }
    addListener(event, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.on(event, listener);
        });
    }
    removeListener(event, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.off(event, listener);
        });
    }
    toJSON() {
        return "<EthersHardhatProvider>";
    }
    _getAddress(address) {
        return (0, ethers_1.resolveAddress)(address, this);
    }
    _getBlockTag(blockTag) {
        // eslint-disable-next-line eqeqeq
        if (blockTag == null) {
            return "latest";
        }
        switch (blockTag) {
            case "earliest":
                return "0x0";
            case "latest":
            case "pending":
            case "safe":
            case "finalized":
                return blockTag;
        }
        if ((0, ethers_1.isHexString)(blockTag)) {
            if ((0, ethers_1.isHexString)(blockTag, 32)) {
                return blockTag;
            }
            return (0, ethers_1.toQuantity)(blockTag);
        }
        if (typeof blockTag === "number") {
            if (blockTag >= 0) {
                return (0, ethers_1.toQuantity)(blockTag);
            }
            return this.getBlockNumber().then((b) => (0, ethers_1.toQuantity)(b + blockTag));
        }
        if (typeof blockTag === "bigint") {
            if (blockTag >= 0n) {
                return (0, ethers_1.toQuantity)(blockTag);
            }
            return this.getBlockNumber().then((b) => (0, ethers_1.toQuantity)(b + Number(blockTag)));
        }
        throw new errors_1.HardhatEthersError(`Invalid blockTag: ${blockTag}`);
    }
    _getTransactionRequest(_request) {
        const request = (0, ethers_utils_1.copyRequest)(_request);
        const promises = [];
        ["to", "from"].forEach((key) => {
            if (request[key] === null ||
                request[key] === undefined) {
                return;
            }
            const addr = (0, ethers_1.resolveAddress)(request[key]);
            if (isPromise(addr)) {
                promises.push((function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        request[key] = yield addr;
                    });
                })());
            }
            else {
                request[key] = addr;
            }
        });
        if (request.blockTag !== null && request.blockTag !== undefined) {
            const blockTag = this._getBlockTag(request.blockTag);
            if (isPromise(blockTag)) {
                promises.push((function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        request.blockTag = yield blockTag;
                    });
                })());
            }
            else {
                request.blockTag = blockTag;
            }
        }
        if (promises.length > 0) {
            return (function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield Promise.all(promises);
                    return request;
                });
            })();
        }
        return request;
    }
    _wrapTransactionResponse(tx) {
        return new ethers_1.TransactionResponse(tx, this);
    }
    _getBlock(block, includeTransactions) {
        return __awaiter(this, void 0, void 0, function* () {
            if ((0, ethers_1.isHexString)(block, 32)) {
                return this._hardhatProvider.send("eth_getBlockByHash", [
                    block,
                    includeTransactions,
                ]);
            }
            let blockTag = this._getBlockTag(block);
            if (typeof blockTag !== "string") {
                blockTag = yield blockTag;
            }
            return this._hardhatProvider.send("eth_getBlockByNumber", [
                blockTag,
                includeTransactions,
            ]);
        });
    }
    _wrapBlock(value) {
        return new ethers_1.Block((0, ethers_utils_1.formatBlock)(value), this);
    }
    _wrapTransactionReceipt(value) {
        return new ethers_1.TransactionReceipt((0, ethers_utils_1.formatTransactionReceipt)(value), this);
    }
    _getFilter(filter) {
        var _a;
        // Create a canonical representation of the topics
        const topics = ((_a = filter.topics) !== null && _a !== void 0 ? _a : []).map((topic) => {
            // eslint-disable-next-line eqeqeq
            if (topic == null) {
                return null;
            }
            if (Array.isArray(topic)) {
                return concisify(topic.map((t) => t.toLowerCase()));
            }
            return topic.toLowerCase();
        });
        const blockHash = "blockHash" in filter ? filter.blockHash : undefined;
        const resolve = (_address, fromBlock, toBlock) => {
            let resolvedAddress;
            switch (_address.length) {
                case 0:
                    break;
                case 1:
                    resolvedAddress = _address[0];
                    break;
                default:
                    _address.sort();
                    resolvedAddress = _address;
            }
            if (blockHash !== undefined) {
                // eslint-disable-next-line eqeqeq
                if (fromBlock != null || toBlock != null) {
                    throw new errors_1.HardhatEthersError("invalid filter");
                }
            }
            const resolvedFilter = {};
            if (resolvedAddress !== undefined) {
                resolvedFilter.address = resolvedAddress;
            }
            if (topics.length > 0) {
                resolvedFilter.topics = topics;
            }
            if (fromBlock !== undefined) {
                resolvedFilter.fromBlock = fromBlock;
            }
            if (toBlock !== undefined) {
                resolvedFilter.toBlock = toBlock;
            }
            if (blockHash !== undefined) {
                resolvedFilter.blockHash = blockHash;
            }
            return resolvedFilter;
        };
        // Addresses could be async (ENS names or Addressables)
        const address = [];
        if (filter.address !== undefined) {
            if (Array.isArray(filter.address)) {
                for (const addr of filter.address) {
                    address.push(this._getAddress(addr));
                }
            }
            else {
                address.push(this._getAddress(filter.address));
            }
        }
        let resolvedFromBlock;
        if ("fromBlock" in filter) {
            resolvedFromBlock = this._getBlockTag(filter.fromBlock);
        }
        let resolvedToBlock;
        if ("toBlock" in filter) {
            resolvedToBlock = this._getBlockTag(filter.toBlock);
        }
        if (address.filter((a) => typeof a !== "string").length > 0 ||
            // eslint-disable-next-line eqeqeq
            (resolvedFromBlock != null && typeof resolvedFromBlock !== "string") ||
            // eslint-disable-next-line eqeqeq
            (resolvedToBlock != null && typeof resolvedToBlock !== "string")) {
            return Promise.all([
                Promise.all(address),
                resolvedFromBlock,
                resolvedToBlock,
            ]).then((result) => {
                return resolve(result[0], result[1], result[2]);
            });
        }
        return resolve(address, resolvedFromBlock, resolvedToBlock);
    }
    _wrapLog(value) {
        return new ethers_1.Log((0, ethers_utils_1.formatLog)(value), this);
    }
    _getRpcBlockTag(blockTag) {
        if ((0, ethers_1.isHexString)(blockTag, 32)) {
            return { blockHash: blockTag };
        }
        return blockTag;
    }
    _isHardhatNetwork() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._isHardhatNetworkCached === undefined) {
                this._isHardhatNetworkCached = false;
                try {
                    yield this._hardhatProvider.send("hardhat_metadata");
                    this._isHardhatNetworkCached = true;
                }
                catch (_a) { }
            }
            return this._isHardhatNetworkCached;
        });
    }
    // ------------------------------------- //
    // event-emitter related private helpers //
    // ------------------------------------- //
    _onTransactionHash(transactionHash, listener, { once }) {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            const listeners = (_a = this._transactionHashListeners.get(transactionHash)) !== null && _a !== void 0 ? _a : [];
            listeners.push({ listener, once });
            this._transactionHashListeners.set(transactionHash, listeners);
            yield this._startTransactionHashPolling();
        });
    }
    _clearTransactionHashListeners(transactionHash, listener) {
        if (transactionHash === undefined) {
            this._transactionHashListeners = new Map();
        }
        else if (listener === undefined) {
            this._transactionHashListeners.delete(transactionHash);
        }
        else {
            const listeners = this._transactionHashListeners.get(transactionHash);
            if (listeners !== undefined) {
                const listenerIndex = listeners.findIndex((item) => item.listener === listener);
                if (listenerIndex >= 0) {
                    listeners.splice(listenerIndex, 1);
                }
                if (listeners.length === 0) {
                    this._transactionHashListeners.delete(transactionHash);
                }
            }
        }
        if (this._transactionHashListeners.size === 0) {
            this._stopTransactionHashPolling();
        }
    }
    _startTransactionHashPolling() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._pollTransactionHashes();
        });
    }
    _stopTransactionHashPolling() {
        clearTimeout(this._transactionHashPollingTimeout);
        this._transactionHashPollingTimeout = undefined;
    }
    /**
     * Traverse all the registered transaction hashes and check if they were mined.
     *
     * This function should NOT throw.
     */
    _pollTransactionHashes() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const listenersToRemove = [];
                for (const [transactionHash, listeners,] of this._transactionHashListeners.entries()) {
                    const receipt = yield this.getTransactionReceipt(transactionHash);
                    if (receipt !== null) {
                        for (const { listener, once } of listeners) {
                            listener(receipt);
                            if (once) {
                                listenersToRemove.push([transactionHash, listener]);
                            }
                        }
                    }
                }
                for (const [transactionHash, listener] of listenersToRemove) {
                    this._clearTransactionHashListeners(transactionHash, listener);
                }
            }
            catch (e) {
                log(`Error during transaction hash polling: ${e.message}`);
            }
            finally {
                // it's possible that the first poll cleans all the listeners,
                // in that case we don't set the timeout
                if (this._transactionHashListeners.size > 0) {
                    const _isHardhatNetwork = yield this._isHardhatNetwork();
                    const timeout = _isHardhatNetwork ? 50 : 500;
                    clearTimeout(this._transactionHashPollingTimeout);
                    this._transactionHashPollingTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        yield this._pollTransactionHashes();
                    }), timeout);
                }
            }
        });
    }
    _startBlockPolling() {
        return __awaiter(this, void 0, void 0, function* () {
            this._latestBlockNumberPolled = yield this.getBlockNumber();
            yield this._pollBlocks();
        });
    }
    _stopBlockPolling() {
        clearInterval(this._blockPollingTimeout);
        this._blockPollingTimeout = undefined;
    }
    _pollBlocks() {
        var _a;
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const currentBlockNumber = yield this.getBlockNumber();
                const previousBlockNumber = (_a = this._latestBlockNumberPolled) !== null && _a !== void 0 ? _a : 0;
                if (currentBlockNumber === previousBlockNumber) {
                    // Don't do anything, there are no new blocks
                    return;
                }
                else if (currentBlockNumber < previousBlockNumber) {
                    // This can happen if there was a reset or a snapshot was reverted.
                    // We don't know which number the network was reset to, so we update
                    // the latest block number seen and do nothing else.
                    this._latestBlockNumberPolled = currentBlockNumber;
                    return;
                }
                this._latestBlockNumberPolled = currentBlockNumber;
                for (let blockNumber = previousBlockNumber + 1; blockNumber <= this._latestBlockNumberPolled; blockNumber++) {
                    const listenersToRemove = [];
                    for (const { listener, once } of this._blockListeners) {
                        listener(blockNumber);
                        if (once) {
                            listenersToRemove.push(listener);
                        }
                    }
                    for (const listener of listenersToRemove) {
                        this._clearBlockListeners(listener);
                    }
                }
            }
            catch (e) {
                log(`Error during block polling: ${e.message}`);
            }
            finally {
                // it's possible that the first poll cleans all the listeners,
                // in that case we don't set the timeout
                if (this._blockListeners.length > 0) {
                    const _isHardhatNetwork = yield this._isHardhatNetwork();
                    const timeout = _isHardhatNetwork ? 50 : 500;
                    clearTimeout(this._blockPollingTimeout);
                    this._blockPollingTimeout = setTimeout(() => __awaiter(this, void 0, void 0, function* () {
                        yield this._pollBlocks();
                    }), timeout);
                }
            }
        });
    }
    _emitTransactionHash(transactionHash, ...args) {
        const listeners = this._transactionHashListeners.get(transactionHash);
        const listenersToRemove = [];
        if (listeners === undefined) {
            return false;
        }
        for (const { listener, once } of listeners) {
            listener(...args);
            if (once) {
                listenersToRemove.push(listener);
            }
        }
        for (const listener of listenersToRemove) {
            this._clearTransactionHashListeners(transactionHash, listener);
        }
        return true;
    }
    _emitBlock(...args) {
        const listeners = this._blockListeners;
        const listenersToRemove = [];
        for (const { listener, once } of listeners) {
            listener(...args);
            if (once) {
                listenersToRemove.push(listener);
            }
        }
        for (const listener of listenersToRemove) {
            this._clearBlockListeners(listener);
        }
        return true;
    }
    _onBlock(listener, { once }) {
        return __awaiter(this, void 0, void 0, function* () {
            const listeners = this._blockListeners;
            listeners.push({ listener, once });
            this._blockListeners = listeners;
            yield this._startBlockPolling();
        });
    }
    _clearBlockListeners(listener) {
        if (listener === undefined) {
            this._blockListeners = [];
            this._stopBlockPolling();
        }
        else {
            const listenerIndex = this._blockListeners.findIndex((item) => item.listener === listener);
            if (listenerIndex >= 0) {
                this._blockListeners.splice(listenerIndex, 1);
            }
            if (this._blockListeners.length === 0) {
                this._stopBlockPolling();
            }
        }
    }
    _getBlockListenerForEvent(event, listener) {
        return (blockNumber) => __awaiter(this, void 0, void 0, function* () {
            const eventLogs = yield this.getLogs({
                fromBlock: blockNumber,
                toBlock: blockNumber,
            });
            const matchingLogs = eventLogs.filter((e) => {
                if (event.address !== undefined && e.address !== event.address) {
                    return false;
                }
                if (event.topics !== undefined) {
                    const topicsToMatch = event.topics;
                    // the array of topics to match can be smaller than the actual
                    // array of topics; in that case only those first topics are
                    // checked
                    const topics = e.topics.slice(0, topicsToMatch.length);
                    const topicsMatch = topics.every((topic, i) => {
                        const topicToMatch = topicsToMatch[i];
                        if (topicToMatch === null) {
                            return true;
                        }
                        if (typeof topicToMatch === "string") {
                            return topic === topicsToMatch[i];
                        }
                        return topicToMatch.includes(topic);
                    });
                    return topicsMatch;
                }
                return true;
            });
            for (const matchingLog of matchingLogs) {
                listener(matchingLog);
            }
        });
    }
    _addEventListener(event, listener, blockListener) {
        const isEqual = require("lodash.isequal");
        const eventListener = this._eventListeners.find((item) => isEqual(item.event, event));
        if (eventListener === undefined) {
            const listenersMap = new Map();
            listenersMap.set(listener, blockListener);
            this._eventListeners.push({ event, listenersMap });
        }
        else {
            eventListener.listenersMap.set(listener, blockListener);
        }
    }
    _clearEventListeners(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEqual = require("lodash.isequal");
            const blockListenersToRemove = [];
            if (event === undefined) {
                for (const eventListener of this._eventListeners) {
                    for (const blockListener of eventListener.listenersMap.values()) {
                        blockListenersToRemove.push(blockListener);
                    }
                }
                this._eventListeners = [];
            }
            else {
                const index = this._eventListeners.findIndex((item) => isEqual(item.event, event));
                if (index === -1) {
                    const { listenersMap } = this._eventListeners[index];
                    this._eventListeners.splice(index, 1);
                    for (const blockListener of listenersMap.values()) {
                        blockListenersToRemove.push(blockListener);
                    }
                }
            }
            for (const blockListener of blockListenersToRemove) {
                yield this.off("block", blockListener);
            }
        });
    }
    _removeEventListener(event, listener) {
        return __awaiter(this, void 0, void 0, function* () {
            const isEqual = require("lodash.isequal");
            const index = this._eventListeners.findIndex((item) => isEqual(item.event, event));
            if (index === -1) {
                // nothing to do
                return;
            }
            const { listenersMap } = this._eventListeners[index];
            const blockListener = listenersMap.get(listener);
            listenersMap.delete(listener);
            if (blockListener === undefined) {
                // nothing to do
                return;
            }
            yield this.off("block", blockListener);
        });
    }
}
exports.HardhatEthersProvider = HardhatEthersProvider;
function isPromise(value) {
    return Boolean(value) && typeof value.then === "function";
}
function concisify(items) {
    items = Array.from(new Set(items).values());
    items.sort();
    return items;
}
function isTransactionHash(x) {
    return x.startsWith("0x") && x.length === 66;
}
function isEventFilter(x) {
    if (typeof x !== "string" && !Array.isArray(x) && !("orphan" in x)) {
        return true;
    }
    return false;
}
function ethersToHardhatEvent(event) {
    if (typeof event === "string") {
        if (event === "block") {
            return { kind: "block" };
        }
        else if (isTransactionHash(event)) {
            return { kind: "transactionHash", txHash: event };
        }
        else {
            throw new errors_1.UnsupportedEventError(event);
        }
    }
    else if (isEventFilter(event)) {
        return { kind: "event", eventFilter: event };
    }
    else {
        throw new errors_1.UnsupportedEventError(event);
    }
}
