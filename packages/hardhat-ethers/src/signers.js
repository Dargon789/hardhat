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
exports.SignerWithAddress = exports.HardhatEthersSigner = void 0;
const ethers_1 = require("ethers");
const ethers_utils_1 = require("./internal/ethers-utils");
const errors_1 = require("./internal/errors");
class HardhatEthersSigner {
    static create(provider, address) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const hre = yield Promise.resolve().then(() => __importStar(require("hardhat")));
            // depending on the config, we set a fixed gas limit for all transactions
            let gasLimit;
            if (hre.network.name === "hardhat") {
                // If we are connected to the in-process hardhat network and the config
                // has a fixed number as the gas config, we use that.
                // Hardhat core already sets this value to the block gas limit when the
                // user doesn't specify a number.
                if (hre.network.config.gas !== "auto") {
                    gasLimit = hre.network.config.gas;
                }
            }
            else if (hre.network.name === "localhost") {
                const configuredGasLimit = hre.config.networks.localhost.gas;
                if (configuredGasLimit !== "auto") {
                    // if the resolved gas config is a number, we use that
                    gasLimit = configuredGasLimit;
                }
                else {
                    // if the resolved gas config is "auto", we need to check that
                    // the user config is undefined, because that's the default value;
                    // otherwise explicitly setting the gas to "auto" would have no effect
                    if (((_b = (_a = hre.userConfig.networks) === null || _a === void 0 ? void 0 : _a.localhost) === null || _b === void 0 ? void 0 : _b.gas) === undefined) {
                        // finally, we check if we are connected to a hardhat network
                        let isHardhatNetwork = false;
                        try {
                            yield hre.network.provider.send("hardhat_metadata");
                            isHardhatNetwork = true;
                        }
                        catch (_c) { }
                        if (isHardhatNetwork) {
                            // WARNING: this assumes that the hardhat node is being run in the
                            // same project which might be wrong
                            gasLimit = hre.config.networks.hardhat.blockGasLimit;
                        }
                    }
                }
            }
            return new HardhatEthersSigner(address, provider, gasLimit);
        });
    }
    constructor(address, _provider, _gasLimit) {
        this._gasLimit = _gasLimit;
        this.address = (0, ethers_1.getAddress)(address);
        this.provider = _provider;
    }
    connect(provider) {
        return new HardhatEthersSigner(this.address, provider);
    }
    getNonce(blockTag) {
        return this.provider.getTransactionCount(this.address, blockTag);
    }
    populateCall(tx) {
        return populate(this, tx);
    }
    populateTransaction(tx) {
        return this.populateCall(tx);
    }
    estimateGas(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.estimateGas(yield this.populateCall(tx));
        });
    }
    call(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.provider.call(yield this.populateCall(tx));
        });
    }
    resolveName(name) {
        return this.provider.resolveName(name);
    }
    signTransaction(_tx) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO if we split the signer for the in-process and json-rpc networks,
            // we can enable this method when using the in-process network or when the
            // json-rpc network has a private key
            throw new errors_1.NotImplementedError("HardhatEthersSigner.signTransaction");
        });
    }
    sendTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            // This cannot be mined any earlier than any recent block
            const blockNumber = yield this.provider.getBlockNumber();
            // Send the transaction
            const hash = yield this._sendUncheckedTransaction(tx);
            // Unfortunately, JSON-RPC only provides and opaque transaction hash
            // for a response, and we need the actual transaction, so we poll
            // for it; it should show up very quickly
            return new Promise((resolve) => {
                const timeouts = [1000, 100];
                const checkTx = () => __awaiter(this, void 0, void 0, function* () {
                    var _a;
                    // Try getting the transaction
                    const txPolled = yield this.provider.getTransaction(hash);
                    if (txPolled !== null) {
                        resolve(txPolled.replaceableTransaction(blockNumber));
                        return;
                    }
                    // Wait another 4 seconds
                    setTimeout(() => {
                        // eslint-disable-next-line @typescript-eslint/no-floating-promises
                        checkTx();
                    }, (_a = timeouts.pop()) !== null && _a !== void 0 ? _a : 4000);
                });
                // eslint-disable-next-line @typescript-eslint/no-floating-promises
                checkTx();
            });
        });
    }
    signMessage(message) {
        const resolvedMessage = typeof message === "string" ? (0, ethers_1.toUtf8Bytes)(message) : message;
        return this.provider.send("personal_sign", [
            (0, ethers_1.hexlify)(resolvedMessage),
            this.address.toLowerCase(),
        ]);
    }
    signTypedData(domain, types, value) {
        return __awaiter(this, void 0, void 0, function* () {
            const copiedValue = deepCopy(value);
            // Populate any ENS names (in-place)
            const populated = yield ethers_1.TypedDataEncoder.resolveNames(domain, types, copiedValue, (v) => __awaiter(this, void 0, void 0, function* () {
                return v;
            }));
            return this.provider.send("eth_signTypedData_v4", [
                this.address.toLowerCase(),
                JSON.stringify(ethers_1.TypedDataEncoder.getPayload(populated.domain, types, populated.value), (_k, v) => {
                    if (typeof v === "bigint") {
                        return v.toString();
                    }
                    return v;
                }),
            ]);
        });
    }
    getAddress() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.address;
        });
    }
    toJSON() {
        return `<SignerWithAddress ${this.address}>`;
    }
    _sendUncheckedTransaction(tx) {
        return __awaiter(this, void 0, void 0, function* () {
            const resolvedTx = deepCopy(tx);
            const promises = [];
            // Make sure the from matches the sender
            if (resolvedTx.from !== null && resolvedTx.from !== undefined) {
                const _from = resolvedTx.from;
                promises.push((() => __awaiter(this, void 0, void 0, function* () {
                    const from = yield (0, ethers_1.resolveAddress)(_from, this.provider);
                    (0, ethers_1.assertArgument)(from !== null &&
                        from !== undefined &&
                        from.toLowerCase() === this.address.toLowerCase(), "from address mismatch", "transaction", tx);
                    resolvedTx.from = from;
                }))());
            }
            else {
                resolvedTx.from = this.address;
            }
            if (resolvedTx.gasLimit === null || resolvedTx.gasLimit === undefined) {
                if (this._gasLimit !== undefined) {
                    resolvedTx.gasLimit = this._gasLimit;
                }
                else {
                    promises.push((() => __awaiter(this, void 0, void 0, function* () {
                        resolvedTx.gasLimit = yield this.provider.estimateGas(Object.assign(Object.assign({}, resolvedTx), { from: this.address }));
                    }))());
                }
            }
            // The address may be an ENS name or Addressable
            if (resolvedTx.to !== null && resolvedTx.to !== undefined) {
                const _to = resolvedTx.to;
                promises.push((() => __awaiter(this, void 0, void 0, function* () {
                    resolvedTx.to = yield (0, ethers_1.resolveAddress)(_to, this.provider);
                }))());
            }
            // Wait until all of our properties are filled in
            if (promises.length > 0) {
                yield Promise.all(promises);
            }
            const hexTx = (0, ethers_utils_1.getRpcTransaction)(resolvedTx);
            return this.provider.send("eth_sendTransaction", [hexTx]);
        });
    }
}
exports.HardhatEthersSigner = HardhatEthersSigner;
exports.SignerWithAddress = HardhatEthersSigner;
function populate(signer, tx) {
    return __awaiter(this, void 0, void 0, function* () {
        const pop = (0, ethers_utils_1.copyRequest)(tx);
        if (pop.to !== null && pop.to !== undefined) {
            pop.to = (0, ethers_1.resolveAddress)(pop.to, signer);
        }
        if (pop.from !== null && pop.from !== undefined) {
            const from = pop.from;
            pop.from = Promise.all([
                signer.getAddress(),
                (0, ethers_1.resolveAddress)(from, signer),
            ]).then(([address, resolvedFrom]) => {
                (0, ethers_1.assertArgument)(address.toLowerCase() === resolvedFrom.toLowerCase(), "transaction from mismatch", "tx.from", resolvedFrom);
                return address;
            });
        }
        else {
            pop.from = signer.getAddress();
        }
        return (0, ethers_utils_1.resolveProperties)(pop);
    });
}
const Primitive = "bigint,boolean,function,number,string,symbol".split(/,/g);
function deepCopy(value) {
    if (value === null ||
        value === undefined ||
        Primitive.indexOf(typeof value) >= 0) {
        return value;
    }
    // Keep any Addressable
    if (typeof value.getAddress === "function") {
        return value;
    }
    if (Array.isArray(value)) {
        return value.map(deepCopy);
    }
    if (typeof value === "object") {
        return Object.keys(value).reduce((accum, key) => {
            accum[key] = value[key];
            return accum;
        }, {});
    }
    throw new errors_1.HardhatEthersError(`Assertion error: ${value} (${typeof value})`);
}
