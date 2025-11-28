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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
const hw_transport_node_hid_1 = __importDefault(require("@ledgerhq/hw-transport-node-hid"));
const hw_transport_1 = __importDefault(require("@ledgerhq/hw-transport"));
const errors_1 = require("@ledgerhq/errors");
const ethWrapper = __importStar(require("../src/internal/wrap-transport"));
const cache = __importStar(require("../src/internal/cache"));
const provider_1 = require("../src/provider");
const errors_2 = require("../src/errors");
const mocks_1 = require("./mocks");
describe("LedgerProvider", () => {
    let accounts;
    let mockedProvider;
    let ethInstanceStub;
    let cacheStub;
    let provider;
    function stubTransport(transport) {
        return sinon_1.default
            .stub(hw_transport_node_hid_1.default, "create")
            .returns(Promise.resolve(transport));
    }
    beforeEach(() => {
        accounts = [
            "0xa809931e3b38059adae9bc5455bc567d0509ab92",
            "0xda6a52afdae5ff66aa786da68754a227331f56e3",
            "0xbc307688a80ec5ed0edc1279c44c1b34f7746bda",
        ];
        mockedProvider = new mocks_1.EthereumMockedProvider();
        ethInstanceStub = sinon_1.default.createStubInstance(hw_app_eth_1.default);
        cacheStub = sinon_1.default.stub(cache);
        sinon_1.default.stub(ethWrapper, "wrapTransport").returns(ethInstanceStub);
        cacheStub.read.returns(Promise.resolve(undefined));
        provider = new provider_1.LedgerProvider({ accounts }, mockedProvider);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    describe("instance", () => {
        it("should lowercase all accounts", () => {
            const uppercaseAccounts = [
                "0xA809931E3B38059ADAE9BC5455BC567D0509AB92",
                "0xDA6A52AFDAE5FF66AA786DA68754A227331F56E3",
                "0xBC307688A80EC5ED0EDC1279C44C1B34F7746BDA",
            ];
            const uppercaseProvider = new provider_1.LedgerProvider({ accounts: uppercaseAccounts }, mockedProvider);
            const lowercasedAccounts = uppercaseAccounts.map((account) => account.toLowerCase());
            chai_1.assert.deepEqual(uppercaseProvider.options.accounts, lowercasedAccounts);
        });
        it("should check for valid ethereum addresses", () => {
            chai_1.assert.throws(() => new provider_1.LedgerProvider({
                accounts: [
                    "0xe149ff2797adc146aa2d68d3df3e819c3c38e762",
                    "0x1",
                    "0x343fe45cd2d785a5F2e97a00de8436f9c42Ef444",
                ],
            }, mockedProvider), "The following ledger address from the config is invalid: 0x1");
        });
    });
    describe("create", () => {
        beforeEach(() => {
            stubTransport(new hw_transport_1.default());
        });
        it("should return a provider instance", () => __awaiter(void 0, void 0, void 0, function* () {
            const newProvider = yield provider_1.LedgerProvider.create({ accounts }, mockedProvider);
            chai_1.assert.instanceOf(newProvider, provider_1.LedgerProvider);
        }));
        it("should init the provider", () => __awaiter(void 0, void 0, void 0, function* () {
            const spy = sinon_1.default.spy(provider_1.LedgerProvider.prototype, "init");
            yield provider_1.LedgerProvider.create({ accounts }, mockedProvider);
            chai_1.assert.isTrue(spy.calledOnce);
        }));
    });
    describe("init", () => {
        let transport;
        let createStub;
        beforeEach(() => {
            transport = new hw_transport_1.default();
            createStub = stubTransport(transport);
        });
        it("should call the create method on TransportNodeHid", () => __awaiter(void 0, void 0, void 0, function* () {
            yield provider.init();
            sinon_1.default.assert.calledOnceWithExactly(createStub, provider_1.LedgerProvider.DEFAULT_TIMEOUT, provider_1.LedgerProvider.DEFAULT_TIMEOUT);
        }));
        it("should only init once on multiple calls", () => __awaiter(void 0, void 0, void 0, function* () {
            yield provider.init();
            yield provider.init();
            yield provider.init();
            sinon_1.default.assert.calledOnceWithExactly(createStub, provider_1.LedgerProvider.DEFAULT_TIMEOUT, provider_1.LedgerProvider.DEFAULT_TIMEOUT);
        }));
        it("should pass the timeout options to the Transport creation", () => __awaiter(void 0, void 0, void 0, function* () {
            const options = {
                accounts,
                openTimeout: 1000,
                connectionTimeout: 5432,
            };
            const newProvider = new provider_1.LedgerProvider(options, mockedProvider);
            yield newProvider.init();
            sinon_1.default.assert.calledOnceWithExactly(createStub, options.openTimeout, options.connectionTimeout);
        }));
        it("should create an eth instance", () => __awaiter(void 0, void 0, void 0, function* () {
            yield provider.init();
            chai_1.assert.instanceOf(provider.eth, hw_app_eth_1.default);
        }));
        it("should throw a ledger provider error if create does", () => __awaiter(void 0, void 0, void 0, function* () {
            const createError = new Error("Test Error");
            createStub.throws(createError);
            try {
                yield provider.init();
            }
            catch (error) {
                if (!errors_2.HardhatLedgerConnectionError.instanceOf(error)) {
                    chai_1.assert.fail("Expected a ConnectionError");
                }
                chai_1.assert.include(error.message, `There was an error trying to establish a connection to the Ledger wallet: "${createError.message}".`);
            }
        }));
        it("should throw an error with the proper explanation if a transport error is thrown", () => __awaiter(void 0, void 0, void 0, function* () {
            const createError = new errors_1.TransportError("Transport Error", "Transport Error Id");
            createStub.throws(createError);
            try {
                yield provider.init();
            }
            catch (error) {
                if (!errors_2.HardhatLedgerConnectionError.instanceOf(error)) {
                    chai_1.assert.fail("Expected a ConnectionError");
                }
                chai_1.assert.include(error.message, `There was an error trying to establish a connection to the Ledger wallet: "${createError.message}".`);
                chai_1.assert.include(error.message, `The error id was: ${createError.id}`);
            }
        }));
        it("should start the paths cache with what the cache returns", () => __awaiter(void 0, void 0, void 0, function* () {
            const newPaths = {
                "0xe149ff2797adc146aa2d68d3df3e819c3c38e762": "m/44'/60'/0'/0/0",
            };
            const oldPaths = Object.assign({}, provider.paths); // new object
            cacheStub.read.returns(Promise.resolve(newPaths));
            yield provider.init();
            chai_1.assert.deepEqual(oldPaths, {});
            chai_1.assert.deepEqual(newPaths, provider.paths);
        }));
        describe("events", () => {
            let emitSpy;
            beforeEach(() => {
                emitSpy = sinon_1.default.spy(provider, "emit");
            });
            it("should emit the connection_start event", () => __awaiter(void 0, void 0, void 0, function* () {
                yield provider.init();
                sinon_1.default.assert.calledWithExactly(emitSpy, "connection_start");
            }));
            it("should emit the connection_success event if everything goes right", () => __awaiter(void 0, void 0, void 0, function* () {
                yield provider.init();
                sinon_1.default.assert.calledWithExactly(emitSpy, "connection_start");
            }));
            it("should emit the connection_failure if the connection fails", () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    createStub.throws(new Error());
                    yield provider.init();
                }
                catch (error) { }
                sinon_1.default.assert.calledWithExactly(emitSpy, "connection_failure");
            }));
        });
    });
    describe("request", () => {
        let path;
        let account;
        let rsv;
        let txRsv;
        let signature;
        let dataToSign;
        let typedMessage;
        let initSpy;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            stubTransport(new hw_transport_1.default());
            initSpy = sinon_1.default.spy(provider, "init");
            path = "m/44'/60'/1'/0/0";
            account = {
                address: accounts[1],
                publicKey: "0x1",
            };
            ethInstanceStub.getAddress.callsFake((searchedPath) => __awaiter(void 0, void 0, void 0, function* () { return searchedPath === path ? account : { address: "0x0", publicKey: "0x0" }; }));
            rsv = {
                v: 55,
                r: "4f4c17305743700648bc4f6cd3038ec6f6af0df73e31757007b7f59df7bee88d",
                s: "7e1941b264348e80c78c4027afc65a87b0a5e43e86742b8ca0823584c6788fd0",
            };
            txRsv = {
                v: "f4f5",
                r: "4ab14d7e96a8bc7390cfffa0260d4b82848428ce7f5b8dd367d13bf31944b6c0",
                s: "3cc226daa6a2f4e22334c59c2e04ac72672af72907ec9c4a601189858ba60069",
            };
            signature =
                "0x4f4c17305743700648bc4f6cd3038ec6f6af0df73e31757007b7f59df7bee88d7e1941b264348e80c78c4027afc65a87b0a5e43e86742b8ca0823584c6788fd01c";
            dataToSign =
                "0x5417aa2a18a44da0675524453ff108c545382f0d7e26605c56bba47c21b5e979";
            typedMessage = {
                types: {
                    EIP712Domain: [
                        { name: "name", type: "string" },
                        { name: "version", type: "string" },
                        { name: "chainId", type: "uint256" },
                        { name: "verifyingContract", type: "address" },
                    ],
                    Person: [
                        { name: "name", type: "string" },
                        { name: "wallet", type: "address" },
                    ],
                    Mail: [
                        { name: "from", type: "Person" },
                        { name: "to", type: "Person" },
                        { name: "contents", type: "string" },
                    ],
                },
                primaryType: "Mail",
                domain: {
                    name: "Ether Mail",
                    version: "1",
                    chainId: 1,
                    verifyingContract: "0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC",
                },
                message: {
                    from: {
                        name: "Cow",
                        wallet: "0xCD2a3d9F938E13CD947Ec05AbC7FE734Df8DD826",
                    },
                    to: {
                        name: "Bob",
                        wallet: "0xbBbBBBBbbBBBbbbBbbBbbbbBBbBbbbbBbBbbBBbB",
                    },
                    contents: "Hello, Bob!",
                },
            };
        }));
        describe("unsupported methods", () => {
            it("should not init the provider if and unsupported JSONRPC method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                sinon_1.default.stub(mockedProvider, "request");
                yield provider.request({ method: "eth_blockNumber" });
                yield provider.request({ method: "eth_getBlockByNumber" });
                yield provider.request({ method: "net_version" });
                sinon_1.default.assert.notCalled(initSpy);
            }));
            it("should forward unsupported JSONRPC methods to the wrapped provider", () => __awaiter(void 0, void 0, void 0, function* () {
                const requestStub = sinon_1.default.stub(mockedProvider, "request");
                const blockNumberArgs = {
                    method: "eth_blockNumber",
                    params: [1, 2, 3],
                };
                yield provider.request(blockNumberArgs);
                const netVersionArgs = {
                    method: "eth_getBlockByNumber",
                    params: ["2.0"],
                };
                yield provider.request(netVersionArgs);
                sinon_1.default.assert.calledTwice(requestStub);
                sinon_1.default.assert.calledWith(requestStub.getCall(0), blockNumberArgs);
                sinon_1.default.assert.calledWith(requestStub.getCall(1), netVersionArgs);
            }));
        });
        describe("supported (sign) methods", () => {
            it("should forward to the wrapped provider if the address doing the signing is not controlled", () => __awaiter(void 0, void 0, void 0, function* () {
                const requestStub = sinon_1.default.stub(mockedProvider, "request");
                // the address is not on the accounts the providers manage
                const uncontrolledAddress = "0x76F8654a8e981A4a5D634c2d3cE56E195a65c319";
                const requestArgs = [
                    {
                        method: "eth_sign",
                        params: [uncontrolledAddress, dataToSign],
                    },
                    {
                        method: "personal_sign",
                        params: [dataToSign, uncontrolledAddress],
                    },
                    {
                        method: "eth_signTypedData_v4",
                        params: [uncontrolledAddress, typedMessage],
                    },
                    {
                        method: "eth_sendTransaction",
                        params: [
                            {
                                from: uncontrolledAddress,
                                to: accounts[1],
                                value: "0x100",
                                gas: "0x1000000",
                                gasPrice: "0x100",
                                gasLimit: "0x1000000",
                            },
                        ],
                    },
                ];
                for (const [index, args] of requestArgs.entries()) {
                    yield provider.request(args);
                    sinon_1.default.assert.calledWithExactly(requestStub.getCall(index), args);
                }
                sinon_1.default.assert.notCalled(initSpy);
            }));
            it("should return the configured and base accounts when the JSONRPC eth_accounts method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                const baseAccounts = [
                    "0x18225dbbd263d5a01ac537db4d1eefc12fae8b24",
                    "0x704ad3adfa9eae2be46c907ef5325d0fabe17353",
                ];
                sinon_1.default.stub(mockedProvider, "request").callsFake((args) => __awaiter(void 0, void 0, void 0, function* () {
                    if (args.method === "eth_accounts") {
                        return baseAccounts;
                    }
                }));
                const resultAccounts = yield provider.request({
                    method: "eth_accounts",
                });
                chai_1.assert.deepEqual([...baseAccounts, ...accounts], resultAccounts);
                sinon_1.default.assert.notCalled(initSpy);
            }));
            it("should call the ledger's signPersonalMessage method when the JSONRPC personal_sign method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                const stub = ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                const resultSignature = yield provider.request({
                    method: "personal_sign",
                    params: [dataToSign, account.address],
                });
                sinon_1.default.assert.calledOnceWithExactly(stub, path, dataToSign.slice(2)); // slices 0x
                chai_1.assert.deepEqual(signature, resultSignature);
                sinon_1.default.assert.calledOnce(initSpy);
            }));
            it("should call the ledger's signPersonalMessage method when the JSONRPC eth_sign method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                const stub = ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                const resultSignature = yield provider.request({
                    method: "eth_sign",
                    params: [account.address, dataToSign],
                });
                sinon_1.default.assert.calledOnceWithExactly(stub, path, dataToSign.slice(2)); // slices 0x
                chai_1.assert.deepEqual(signature, resultSignature);
                sinon_1.default.assert.calledOnce(initSpy);
            }));
            it("should call the ledger's signEIP712Message method when the JSONRPC eth_signTypedData_v4 method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                const stub = ethInstanceStub.signEIP712Message.returns(Promise.resolve(rsv));
                const resultSignature = yield provider.request({
                    method: "eth_signTypedData_v4",
                    params: [account.address, typedMessage],
                });
                sinon_1.default.assert.calledOnceWithExactly(stub, path, typedMessage);
                chai_1.assert.deepEqual(signature, resultSignature);
                sinon_1.default.assert.calledOnce(initSpy);
            }));
            it("should call the ledger's signEIP712HashedMessage method when the JSONRPC eth_signTypedData_v4 method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                ethInstanceStub.signEIP712Message.throws("Unsupported Ledger");
                const stub = ethInstanceStub.signEIP712HashedMessage.returns(Promise.resolve(rsv));
                const resultSignature = yield provider.request({
                    method: "eth_signTypedData_v4",
                    params: [account.address, typedMessage],
                });
                sinon_1.default.assert.calledOnceWithExactly(stub, path, "0xf2cee375fa42b42143804025fc449deafd50cc031ca257e0b194a650a912090f", // hash domain
                "0xc52c0ee5d84264471806290a3f2c4cecfc5490626bf912d01f240d7a274b371e" // hash struct
                );
                chai_1.assert.deepEqual(signature, resultSignature);
                sinon_1.default.assert.calledOnce(initSpy);
            }));
            it("should call the ledger's signTransaction method when the JSONRPC eth_sendTransaction method is called", () => __awaiter(void 0, void 0, void 0, function* () {
                const numberToRpcQuantity = (n) => `0x${n.toString(16)}`;
                const tx = "0xf8626464830f4240949f649fe750340a295dddbbd7e1ec8f378cf24b43648082f4f5a04ab14d7e96a8bc7390cfffa0260d4b82848428ce7f5b8dd367d13bf31944b6c0a03cc226daa6a2f4e22334c59c2e04ac72672af72907ec9c4a601189858ba60069";
                const requestStub = sinon_1.default.stub();
                sinon_1.default.replace(mockedProvider, "request", (args) => __awaiter(void 0, void 0, void 0, function* () {
                    requestStub(args);
                    switch (args.method) {
                        case "eth_chainId":
                            return "0x7a69";
                        case "eth_getTransactionCount":
                            return "0x64";
                        case "eth_sendRawTransaction":
                            return tx;
                    }
                }));
                const signTransactionStub = ethInstanceStub.signTransaction.returns(Promise.resolve(txRsv));
                const resultTx = yield provider.request({
                    method: "eth_sendTransaction",
                    params: [
                        {
                            from: account.address,
                            to: accounts[1],
                            value: numberToRpcQuantity(100),
                            gas: numberToRpcQuantity(1000000),
                            gasPrice: numberToRpcQuantity(100),
                            gasLimit: numberToRpcQuantity(1000000),
                        },
                    ],
                });
                sinon_1.default.assert.calledOnceWithExactly(signTransactionStub, path, "01e1827a696464830f424094da6a52afdae5ff66aa786da68754a227331f56e36480c0", {
                    nfts: [],
                    erc20Tokens: [],
                    externalPlugin: [],
                    plugin: [],
                    domains: [],
                });
                sinon_1.default.assert.calledWithExactly(requestStub.getCall(0), {
                    method: "eth_getTransactionCount",
                    params: [account.address, "pending"],
                });
                sinon_1.default.assert.calledWithExactly(requestStub.getCall(1), {
                    method: "eth_chainId",
                });
                sinon_1.default.assert.calledWithExactly(requestStub.getCall(2), {
                    method: "eth_sendRawTransaction",
                    params: [
                        "0x01f864827a696464830f424094da6a52afdae5ff66aa786da68754a227331f56e36480c080a04ab14d7e96a8bc7390cfffa0260d4b82848428ce7f5b8dd367d13bf31944b6c0a03cc226daa6a2f4e22334c59c2e04ac72672af72907ec9c4a601189858ba60069",
                    ],
                });
                chai_1.assert.equal(tx, resultTx);
                sinon_1.default.assert.calledOnce(initSpy);
            }));
        });
        describe("path derivation", () => {
            function requestPersonalSign() {
                return __awaiter(this, void 0, void 0, function* () {
                    ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                    yield provider.request({
                        method: "personal_sign",
                        params: [dataToSign, account.address],
                    });
                });
            }
            it("should cache the derived path from the supplied accounts", () => __awaiter(void 0, void 0, void 0, function* () {
                yield requestPersonalSign();
                yield requestPersonalSign();
                yield requestPersonalSign();
                yield requestPersonalSign();
                sinon_1.default.assert.calledTwice(ethInstanceStub.getAddress);
                sinon_1.default.assert.calledWith(ethInstanceStub.getAddress, "m/44'/60'/0'/0/0");
                sinon_1.default.assert.calledWith(ethInstanceStub.getAddress, "m/44'/60'/1'/0/0");
            }));
            it("should cache the path per address on the paths property", () => __awaiter(void 0, void 0, void 0, function* () {
                yield requestPersonalSign();
                yield requestPersonalSign();
                chai_1.assert.deepEqual(provider.paths, { [accounts[1]]: path });
            }));
            it("should write the cache with the new paths", () => __awaiter(void 0, void 0, void 0, function* () {
                yield requestPersonalSign();
                yield requestPersonalSign();
                yield requestPersonalSign();
                sinon_1.default.assert.calledOnceWithExactly(cacheStub.write, {
                    [accounts[1]]: path,
                });
            }));
            it("should not break if caching fails", () => __awaiter(void 0, void 0, void 0, function* () {
                cacheStub.write.returns(Promise.reject(new Error("Write error")));
                let hasThrown = false;
                try {
                    yield requestPersonalSign();
                }
                catch (error) {
                    console.log(error);
                    hasThrown = true;
                }
                chai_1.assert.isFalse(hasThrown);
            }));
            it("should throw a DerivationPathError if trying to get the address fails", () => __awaiter(void 0, void 0, void 0, function* () {
                const errorMessage = "Getting the address broke";
                ethInstanceStub.getAddress.throws(new Error(errorMessage));
                try {
                    yield requestPersonalSign();
                }
                catch (error) {
                    const errorPath = "m/44'/60'/0'/0/0";
                    if (!errors_2.HardhatLedgerDerivationPathError.instanceOf(error)) {
                        chai_1.assert.fail("Expected a DerivationPathError");
                    }
                    chai_1.assert.equal(error.path, errorPath);
                    chai_1.assert.equal(error.message, `There was an error trying to derivate path ${errorPath}: "${errorMessage}". The wallet might be connected but locked or in the wrong app.`);
                }
            }));
            it("should throw a DerivationPathError if the max number of derivations is searched without a result", () => __awaiter(void 0, void 0, void 0, function* () {
                try {
                    ethInstanceStub.getAddress.callsFake(() => __awaiter(void 0, void 0, void 0, function* () {
                        return ({
                            address: "0x0",
                            publicKey: "0x0",
                        });
                    }));
                    yield requestPersonalSign();
                }
                catch (error) {
                    const errorPath = `m/44'/60'/${provider_1.LedgerProvider.MAX_DERIVATION_ACCOUNTS}'/0/0`;
                    if (!errors_2.HardhatLedgerDerivationPathError.instanceOf(error)) {
                        chai_1.assert.fail("Expected a DerivationPathError");
                    }
                    chai_1.assert.equal(error.path, errorPath);
                    chai_1.assert.equal(error.message, `Could not find a valid derivation path for ${accounts[1]}. Paths from m/44'/60'/0'/0/0 to ${errorPath} were searched.`);
                }
            }));
        });
        describe("events", () => {
            let emitSpy;
            beforeEach(() => {
                emitSpy = sinon_1.default.spy(provider, "emit");
            });
            describe("confirmation", () => {
                it("should emit the confirmation_start event when a request for signing is made", () => __awaiter(void 0, void 0, void 0, function* () {
                    ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                    yield provider.request({
                        method: "personal_sign",
                        params: [dataToSign, account.address],
                    });
                    sinon_1.default.assert.calledWithExactly(emitSpy, "confirmation_start");
                }));
                it("should emit the confirmation_success event when a request for signing goes OK", () => __awaiter(void 0, void 0, void 0, function* () {
                    ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                    yield provider.request({
                        method: "eth_sign",
                        params: [account.address, dataToSign],
                    });
                    sinon_1.default.assert.calledWithExactly(emitSpy, "confirmation_success");
                }));
                it("should emit the confirmation_failure event when a request for signing breaks", () => __awaiter(void 0, void 0, void 0, function* () {
                    ethInstanceStub.signEIP712Message.throws(new Error());
                    ethInstanceStub.signEIP712HashedMessage.throws(new Error());
                    try {
                        yield provider.request({
                            method: "eth_signTypedData_v4",
                            params: [account.address, typedMessage],
                        });
                    }
                    catch (error) { }
                    sinon_1.default.assert.calledWithExactly(emitSpy, "confirmation_failure");
                }));
            });
            describe("derivation", () => {
                function requestSign() {
                    return __awaiter(this, void 0, void 0, function* () {
                        ethInstanceStub.signPersonalMessage.returns(Promise.resolve(rsv));
                        yield provider.request({
                            method: "eth_sign",
                            params: [account.address, dataToSign],
                        });
                    });
                }
                it("should emit the derivation_start event when a request for signing is made", () => __awaiter(void 0, void 0, void 0, function* () {
                    yield requestSign();
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_start");
                }));
                it("should emit the derivation_progress event with the derived paths when a request for signing is made", () => __awaiter(void 0, void 0, void 0, function* () {
                    yield requestSign();
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_progress", "m/44'/60'/0'/0/0", 0);
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_progress", "m/44'/60'/1'/0/0", 1);
                }));
                it("should emit the derivation_success event with the path when a request for signing is made and succeeds", () => __awaiter(void 0, void 0, void 0, function* () {
                    yield requestSign();
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_success", "m/44'/60'/1'/0/0");
                }));
                it("should emit the derivation_failure event when a request for signing is made and breaks", () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        ethInstanceStub.getAddress.throws(new Error());
                        yield requestSign();
                    }
                    catch (error) { }
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_failure");
                }));
                it("should emit the derivation_failure event when a request for signing is made and can't find a valid path", () => __awaiter(void 0, void 0, void 0, function* () {
                    try {
                        ethInstanceStub.getAddress.callsFake(() => __awaiter(void 0, void 0, void 0, function* () {
                            return ({
                                address: "0x0",
                                publicKey: "0x0",
                            });
                        }));
                        yield requestSign();
                    }
                    catch (error) { }
                    sinon_1.default.assert.calledWithExactly(emitSpy, "derivation_failure");
                }));
            });
            describe("eth_accounts", () => {
                beforeEach(() => {
                    // eth_accounts will be called to merge the accounts
                    sinon_1.default.stub(mockedProvider, "request").returns(Promise.resolve([]));
                });
                it("should not emit a connection or derivation event with eth_accounts", () => __awaiter(void 0, void 0, void 0, function* () {
                    yield provider.request({ method: "eth_accounts" });
                    sinon_1.default.assert.notCalled(emitSpy);
                }));
            });
        });
    });
});
