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
const chai_1 = require("chai");
const abi_1 = require("../../../../src/internal/execution/abi");
const jsonrpc_client_1 = require("../../../../src/internal/execution/jsonrpc-client");
const jsonrpc_1 = require("../../../../src/internal/execution/types/jsonrpc");
const assertions_1 = require("../../../../src/internal/utils/assertions");
const hardhat_projects_1 = require("../../../helpers/hardhat-projects");
describe("JSON-RPC client", function () {
    describe("With default hardhat project", function () {
        (0, hardhat_projects_1.useHardhatProject)("default");
        let client;
        before("Creating client", function () {
            client = new jsonrpc_client_1.EIP1193JsonRpcClient(this.hre.network.provider);
        });
        function deployContract({ hre, accounts, }) {
            return __awaiter(this, void 0, void 0, function* () {
                const artifact = yield hre.artifacts.readArtifact("C");
                const fees = yield client.getNetworkFees();
                const tx = yield client.sendTransaction({
                    data: (0, abi_1.encodeArtifactDeploymentData)(artifact, [], {}),
                    value: 0n,
                    from: accounts[0],
                    nonce: 0,
                    fees,
                    gasLimit: 1000000n,
                });
                const receipt = yield client.getTransactionReceipt(tx);
                chai_1.assert.isDefined(receipt);
                chai_1.assert.equal(receipt.status, jsonrpc_1.TransactionReceiptStatus.SUCCESS);
                chai_1.assert.isDefined(receipt.contractAddress);
                return { artifact, address: receipt.contractAddress };
            });
        }
        describe("getChainId", function () {
            it("Should return the chainId as number", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const chainId = yield client.getChainId();
                    chai_1.assert.equal(chainId, 31337);
                });
            });
        });
        describe("getLatestBlock", function () {
            it("Should return the first block in the correct format", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const block = yield client.getLatestBlock();
                    chai_1.assert.equal(block.number, 0);
                    chai_1.assert.isString(block.hash);
                    chai_1.assert.typeOf(block.baseFeePerGas, "bigint");
                });
            });
            it("Should return the second block in the correct format", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.hre.network.provider.send("evm_mine");
                    const block = yield client.getLatestBlock();
                    chai_1.assert.equal(block.number, 1);
                    chai_1.assert.isString(block.hash);
                    chai_1.assert.typeOf(block.baseFeePerGas, "bigint");
                });
            });
        });
        describe("getNetworkFees", function () {
            describe("With an EIP-1559 network (i.e. Hardhat Network)", function () {
                it("Should return information about EIP-1559 fees", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const fees = yield client.getNetworkFees();
                        (0, chai_1.assert)("maxFeePerGas" in fees);
                        (0, chai_1.assert)("maxPriorityFeePerGas" in fees);
                        chai_1.assert.typeOf(fees.maxFeePerGas, "bigint");
                        chai_1.assert.typeOf(fees.maxPriorityFeePerGas, "bigint");
                        chai_1.assert.isTrue(fees.maxFeePerGas > fees.maxPriorityFeePerGas);
                    });
                });
                it('Should throw if the "maxFeePerGas" exceeds the configured limit', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const failClient = new jsonrpc_client_1.EIP1193JsonRpcClient(this.hre.network.provider, {
                            maxFeePerGasLimit: 1n,
                        });
                        yield chai_1.assert.isRejected(failClient.getNetworkFees(), /IGN407: The calculated max fee per gas exceeds the configured limit./);
                    });
                });
                it("Should use the configured maxPriorityFeePerGas", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const maxFeeClient = new jsonrpc_client_1.EIP1193JsonRpcClient(this.hre.network.provider, {
                            maxPriorityFeePerGas: 1n,
                        });
                        const fees = yield maxFeeClient.getNetworkFees();
                        (0, chai_1.assert)("maxPriorityFeePerGas" in fees);
                        chai_1.assert.equal(fees.maxPriorityFeePerGas, 1n);
                    });
                });
                it("Should use return legacy fees when deploying to polygon network (chainId 137)", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const polygonClient = new jsonrpc_client_1.EIP1193JsonRpcClient({
                            request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_chainId") {
                                    return "0x89"; // 137
                                }
                                if (req.method === "eth_getBlockByNumber") {
                                    return {
                                        number: "0x0",
                                        hash: "0x0",
                                    };
                                }
                                if (req.method === "eth_gasPrice") {
                                    return "0x1";
                                }
                                throw new Error(`Unimplemented mock for ${req.method}`);
                            }),
                        }, {
                            maxPriorityFeePerGas: 1n,
                        });
                        const fees = yield polygonClient.getNetworkFees();
                        (0, chai_1.assert)("gasPrice" in fees);
                        chai_1.assert.equal(fees.gasPrice, 1n);
                    });
                });
                it("Should return zero gas fees when deploying to a network with a zero base fee per gas (e.g. private Besu instances)", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const besuClient = new jsonrpc_client_1.EIP1193JsonRpcClient({
                            request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_chainId") {
                                    return "0x42";
                                }
                                if (req.method === "eth_getBlockByNumber") {
                                    return {
                                        number: "0x0",
                                        hash: "0x0",
                                        baseFeePerGas: "0x0", // Set the base fee to zero
                                    };
                                }
                                if (req.method === "eth_gasPrice") {
                                    return "0x1";
                                }
                                throw new Error(`Unimplemented mock for ${req.method}`);
                            }),
                        });
                        const fees = yield besuClient.getNetworkFees();
                        chai_1.assert.deepStrictEqual(fees, {
                            maxFeePerGas: 0n,
                            maxPriorityFeePerGas: 0n,
                        });
                    });
                });
                it("Should not return zero gas fees for BNB Chain even with a zero base fee", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const bnbClient = new jsonrpc_client_1.EIP1193JsonRpcClient({
                            request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_chainId") {
                                    return "0x38"; // BNB Chain ID
                                }
                                if (req.method === "eth_getBlockByNumber") {
                                    return {
                                        number: "0x0",
                                        hash: "0x0",
                                        baseFeePerGas: "0x0", // Set the base fee to zero, testing the exception
                                    };
                                }
                                if (req.method === "eth_gasPrice") {
                                    return "0x1";
                                }
                                throw new Error(`Unimplemented mock for ${req.method}`);
                            }),
                        });
                        const fees = yield bnbClient.getNetworkFees();
                        chai_1.assert.deepStrictEqual(fees, {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1000000000n,
                        }, "Both max fee and max priority fee should be 1 gwei, as the base fee is 0 for BNB Chain");
                    });
                });
                it("Should not return zero gas fees for BNB Test Chain even with a zero base fee", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const bnbTestClient = new jsonrpc_client_1.EIP1193JsonRpcClient({
                            request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_chainId") {
                                    return "0x61"; // BNB Test Chain ID
                                }
                                if (req.method === "eth_getBlockByNumber") {
                                    return {
                                        number: "0x0",
                                        hash: "0x0",
                                        baseFeePerGas: "0x0", // Set the base fee to zero, testing the exception
                                    };
                                }
                                if (req.method === "eth_gasPrice") {
                                    return "0x1";
                                }
                                throw new Error(`Unimplemented mock for ${req.method}`);
                            }),
                        });
                        const fees = yield bnbTestClient.getNetworkFees();
                        chai_1.assert.deepStrictEqual(fees, {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1000000000n,
                        }, "Both max fee and max priority fee should be 1 gwei, as the base fee is 0 for BNB Test Chain");
                    });
                });
                it("Should use the `maxPriorityFeePerGas` from the node if `eth_maxPriorityFeePerGas` is present (and there is no config)", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        // TODO: Hardhat does not support `eth_maxPriorityFeePerGas` yet, when it does, this
                        // can be removed.
                        const proxiedProvider = Object.assign(Object.assign({}, this.hre.network.provider), { request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_maxPriorityFeePerGas") {
                                    return "2000000000";
                                }
                                return this.hre.network.provider.request(req);
                            }) });
                        const maxFeeClient = new jsonrpc_client_1.EIP1193JsonRpcClient(proxiedProvider, {
                            maxPriorityFeePerGas: undefined, // no config set for maxPriorityFeePerGas
                        });
                        const fees = yield maxFeeClient.getNetworkFees();
                        (0, chai_1.assert)("maxPriorityFeePerGas" in fees);
                        chai_1.assert.equal(fees.maxPriorityFeePerGas, 2000000000n);
                    });
                });
                it("Should default to 1gwei for maxPriorityFeePerGas if `eth_maxPriorityFeePerGas` is not available and no config set", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const proxiedProvider = Object.assign(Object.assign({}, this.hre.network.provider), { request: (req) => __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_maxPriorityFeePerGas") {
                                    throw new Error("Method eth_maxPriorityFeePerGas is not supported");
                                }
                                return this.hre.network.provider.request(req);
                            }) });
                        const maxFeeClient = new jsonrpc_client_1.EIP1193JsonRpcClient(proxiedProvider, {
                            maxPriorityFeePerGas: undefined, // no config set for maxPriorityFeePerGas
                        });
                        const fees = yield maxFeeClient.getNetworkFees();
                        (0, chai_1.assert)("maxPriorityFeePerGas" in fees);
                        chai_1.assert.equal(fees.maxPriorityFeePerGas, 1000000000n);
                    });
                });
            });
        });
        describe("call", function () {
            it("Should return the raw result in succesful deployment calls", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const artifact = yield this.hre.artifacts.readArtifact("C");
                    const result = yield client.call({
                        data: (0, abi_1.encodeArtifactDeploymentData)(artifact, [], {}),
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest");
                    chai_1.assert.isTrue(result.success);
                    chai_1.assert.notEqual(result.returnData, "0x");
                    chai_1.assert.isFalse(result.customErrorReported);
                });
            });
            it("Should return the raw result in succesful non-deployment calls", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { artifact, address } = yield deployContract(this);
                    const result = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "returnString", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "latest");
                    // The ABI encoded representation of "hello"
                    const abiEncodedHello = "0x0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000000568656c6c6f000000000000000000000000000000000000000000000000000000";
                    chai_1.assert.isTrue(result.success);
                    chai_1.assert.equal(result.returnData, abiEncodedHello);
                    chai_1.assert.isFalse(result.customErrorReported);
                });
            });
            it("Should not throw on execution failures, but return a result", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // We send an invalid deployment transaction
                    const result = yield client.call({
                        data: "0x1234123120",
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest");
                    chai_1.assert.isFalse(result.success);
                    chai_1.assert.equal(result.returnData, "0x");
                    chai_1.assert.isFalse(result.customErrorReported);
                });
            });
            it("Should return the returnData on execution failures", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { artifact, address } = yield deployContract(this);
                    const result = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithReasonMessage", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "latest");
                    // The ABI encoded representation of Error("reason")
                    const abiEncodedHello = "0x08c379a000000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000006726561736f6e0000000000000000000000000000000000000000000000000000";
                    chai_1.assert.isFalse(result.success);
                    chai_1.assert.equal(result.returnData, abiEncodedHello);
                    chai_1.assert.isFalse(result.customErrorReported);
                });
            });
            it("[Geth specific] Should return an empty returnData even when geth doesn't return it", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // **NOTE**: This tests is mocked with the error messages that Geth returns
                    let formatNumber = 0;
                    class MockProvider {
                        request(req) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_call") {
                                    formatNumber++;
                                    if (formatNumber === 1) {
                                        // Geth error message for reverts without reason
                                        throw new Error("execution reverted");
                                    }
                                    // Geth error message for invalid opcodes
                                    throw new Error("invalid opcode: INVALID");
                                }
                                (0, assertions_1.assertIgnitionInvariant)(false, `Unimplemented mock for ${req.method}`);
                            });
                        }
                    }
                    const mockClient = new jsonrpc_client_1.EIP1193JsonRpcClient(new MockProvider());
                    const result1 = yield mockClient.call({
                        data: "0x",
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest");
                    chai_1.assert.isFalse(result1.success);
                    chai_1.assert.equal(result1.returnData, "0x");
                    chai_1.assert.isFalse(result1.customErrorReported);
                    const result2 = yield mockClient.call({
                        data: "0x",
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest");
                    chai_1.assert.isFalse(result2.success);
                    chai_1.assert.equal(result2.returnData, "0x");
                    chai_1.assert.isFalse(result2.customErrorReported);
                });
            });
            it("[Other nodes] Should return an empty returnData if the error message indicates a revert", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    class MockProvider {
                        request(req) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_call") {
                                    throw new Error("something revert something");
                                }
                                (0, assertions_1.assertIgnitionInvariant)(false, `Unimplemented mock for ${req.method}`);
                            });
                        }
                    }
                    const mockClient = new jsonrpc_client_1.EIP1193JsonRpcClient(new MockProvider());
                    const result1 = yield mockClient.call({
                        data: "0x",
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest");
                    chai_1.assert.isFalse(result1.success);
                    chai_1.assert.equal(result1.returnData, "0x");
                    chai_1.assert.isFalse(result1.customErrorReported);
                });
            });
            it("Should rethrow an IgnitionError if the error message indicates an incorrectly configured base gas fee versus the node's block gas limit", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    class MockProvider {
                        request(req) {
                            return __awaiter(this, void 0, void 0, function* () {
                                if (req.method === "eth_call") {
                                    throw new Error("base fee exceeds gas limit");
                                }
                                (0, assertions_1.assertIgnitionInvariant)(false, `Unimplemented mock for ${req.method}`);
                            });
                        }
                    }
                    const mockClient = new jsonrpc_client_1.EIP1193JsonRpcClient(new MockProvider());
                    yield chai_1.assert.isRejected(mockClient.call({
                        data: "0x",
                        value: 0n,
                        from: this.accounts[0],
                    }, "latest"), /IGN406\: The configured base fee exceeds the block gas limit\. Please reduce the configured base fee or increase the block gas limit\./);
                });
            });
            it("Should return customErrorReported true when the server reports a custom error", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { artifact, address } = yield deployContract(this);
                    const result = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithUnknownCustomError", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "latest");
                    chai_1.assert.isFalse(result.success);
                    chai_1.assert.notEqual(result.returnData, "0x");
                    chai_1.assert.isTrue(result.customErrorReported);
                });
            });
            it("Should return customErrorReported false when the server does not reports a custom error", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { artifact, address } = yield deployContract(this);
                    const result = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithInvalidData", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "latest");
                    chai_1.assert.isFalse(result.success);
                    chai_1.assert.notEqual(result.returnData, "0x");
                    chai_1.assert.isFalse(result.customErrorReported);
                });
            });
            it("Should accept pending as blockTag", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // We disable automining, so the transaction is pending
                    // and calls differt between latest and pending
                    yield this.hre.network.provider.send("evm_setAutomine", [false]);
                    const artifact = yield this.hre.artifacts.readArtifact("C");
                    const fees = yield client.getNetworkFees();
                    yield client.sendTransaction({
                        data: (0, abi_1.encodeArtifactDeploymentData)(artifact, [], {}),
                        value: 0n,
                        from: this.accounts[0],
                        nonce: 0,
                        fees,
                        gasLimit: 1000000n,
                    });
                    // We know the address from other tests doing the same
                    const address = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
                    const resultLatest = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithInvalidData", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "latest");
                    chai_1.assert.isTrue(resultLatest.success);
                    chai_1.assert.equal(resultLatest.returnData, "0x");
                    chai_1.assert.isFalse(resultLatest.customErrorReported);
                    const resultPending = yield client.call({
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithInvalidData", []),
                        value: 0n,
                        from: this.accounts[0],
                        to: address,
                    }, "pending");
                    chai_1.assert.isFalse(resultPending.success);
                    chai_1.assert.notEqual(resultPending.returnData, "0x");
                    chai_1.assert.isFalse(resultPending.customErrorReported);
                });
            });
            // TODO: Should we test that eth_call validates the account balance?
            // TODO: Should we test that eth_call validates the nonce, maxFeePerGas, and maxPriorityFeePerGas?
        });
        describe("sendTransaction", function () {
            let fees;
            before("Fetching fees", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    fees = yield client.getNetworkFees();
                });
            });
            it("Should return the tx hash, even on execution failures", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // We send an invalid deployment transaction
                    const result = yield client.sendTransaction({
                        data: "0x1234123120",
                        value: 0n,
                        from: this.accounts[0],
                        nonce: 0,
                        gasLimit: 5000000n,
                        fees,
                    });
                    chai_1.assert.isString(result);
                });
            });
            it("Should return the tx hash in a network without automining", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // We disable the automining first
                    yield this.hre.network.provider.send("evm_setAutomine", [false]);
                    const result = yield client.sendTransaction({
                        to: this.accounts[0],
                        data: "0x",
                        value: 0n,
                        from: this.accounts[0],
                        nonce: 0,
                        gasLimit: 5000000n,
                        fees,
                    });
                    chai_1.assert.isString(result);
                });
            });
        });
        describe("getBalance", function () {
            it("Should return the latest balance of an account", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const defaultHardhatNetworkBalance = 10n ** 18n * 10000n;
                    const nextBlockBaseFee = 875000000n;
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: nextBlockBaseFee,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 0,
                    });
                    const balance = yield client.getBalance(this.accounts[0], "latest");
                    chai_1.assert.equal(balance, defaultHardhatNetworkBalance - 21000n * nextBlockBaseFee - 1n);
                });
            });
            // Skipped because Hardhat Network doesn't implement this correctly and
            // always returns the latest balance.
            it.skip("Should return the pending balance of an account", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // We disable the automining first
                    yield this.hre.network.provider.send("evm_setAutomine", [false]);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 0,
                    });
                    const defaultHardhatNetworkBalance = 10n ** 18n * 10000n;
                    const balance = yield client.getBalance(this.accounts[0], "pending");
                    chai_1.assert.equal(balance, defaultHardhatNetworkBalance - 21000n * 1n - 1n);
                });
            });
        });
        describe("setBalance", function () {
            it("Should allow setting an account balance against a local hardhat node", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // Arrange
                    const balanceBefore = yield client.getBalance(this.accounts[19], "latest");
                    chai_1.assert.equal(balanceBefore, 10000000000000000000000n);
                    // Act
                    yield client.setBalance(this.accounts[19], 99999n);
                    // Assert
                    const balanceAfter = yield client.getBalance(this.accounts[19], "latest");
                    chai_1.assert.equal(balanceAfter, 99999n);
                });
            });
            it("Should allow setting an account balance against an anvil node", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // Arrange
                    // we create a fake anvil client that will
                    // correctly set a balance but return null rather
                    // than a boolean.
                    const fakeAnvilClient = new jsonrpc_client_1.EIP1193JsonRpcClient({
                        request: (req) => __awaiter(this, void 0, void 0, function* () {
                            if (req.method === "hardhat_setBalance") {
                                // Apply setBalance
                                yield this.hre.network.provider.request(req);
                                // but return null as anvil would
                                return null;
                            }
                            return this.hre.network.provider.request(req);
                        }),
                    });
                    const balanceBefore = yield fakeAnvilClient.getBalance(this.accounts[19], "latest");
                    chai_1.assert.equal(balanceBefore, 10000000000000000000000n);
                    // Act
                    yield fakeAnvilClient.setBalance(this.accounts[19], 99999n);
                    // Assert
                    const balanceAfter = yield fakeAnvilClient.getBalance(this.accounts[19], "latest");
                    chai_1.assert.equal(balanceAfter, 99999n);
                });
            });
        });
        describe("estimateGas", function () {
            it("Should return the estimate gas if the tx would succeed", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const estimation = yield client.estimateGas({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        data: "0x",
                        nonce: 0,
                    });
                    // The 1n comes from a bug in hardhat network
                    chai_1.assert.equal(estimation, 21000n + 1n);
                });
            });
            it("Should throw if the tx would not succeed", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { artifact, address } = yield deployContract(this);
                    yield chai_1.assert.isRejected(client.estimateGas({
                        to: address,
                        from: this.accounts[0],
                        data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "revertWithReasonMessage", []),
                        nonce: 0,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        value: 0n,
                    }));
                });
            });
        });
        describe("getTransactionCount", function () {
            it("`latest` should return the amount of confirmed transactions", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    let count = yield client.getTransactionCount(this.accounts[0], "latest");
                    chai_1.assert.equal(count, 0);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 0,
                    });
                    count = yield client.getTransactionCount(this.accounts[0], "latest");
                    chai_1.assert.equal(count, 1);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 1,
                    });
                    count = yield client.getTransactionCount(this.accounts[0], "latest");
                    chai_1.assert.equal(count, 2);
                });
            });
            it("`pending` should return the amount of unconfirmed transactions", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.hre.network.provider.send("evm_setAutomine", [false]);
                    let latestCount = yield client.getTransactionCount(this.accounts[0], "latest");
                    let pendingCount = yield client.getTransactionCount(this.accounts[0], "pending");
                    chai_1.assert.equal(latestCount, 0);
                    chai_1.assert.equal(pendingCount, 0);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 0,
                    });
                    latestCount = yield client.getTransactionCount(this.accounts[0], "latest");
                    pendingCount = yield client.getTransactionCount(this.accounts[0], "pending");
                    chai_1.assert.equal(latestCount, 0);
                    chai_1.assert.equal(pendingCount, 1);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 1,
                    });
                    latestCount = yield client.getTransactionCount(this.accounts[0], "latest");
                    pendingCount = yield client.getTransactionCount(this.accounts[0], "pending");
                    chai_1.assert.equal(latestCount, 0);
                    chai_1.assert.equal(pendingCount, 2);
                });
            });
            it("using a number should return the amount of confirmed transactions up to and including that block", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 0,
                    });
                    let latestCount = yield client.getTransactionCount(this.accounts[0], "latest");
                    let blockOneCount = yield client.getTransactionCount(this.accounts[0], 1);
                    chai_1.assert.equal(latestCount, 1);
                    chai_1.assert.equal(blockOneCount, 1);
                    yield client.sendTransaction({
                        to: this.accounts[1],
                        from: this.accounts[0],
                        value: 1n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                        gasLimit: 21000n,
                        data: "0x",
                        nonce: 1,
                    });
                    latestCount = yield client.getTransactionCount(this.accounts[0], "latest");
                    blockOneCount = yield client.getTransactionCount(this.accounts[0], 1);
                    chai_1.assert.equal(latestCount, 2);
                    chai_1.assert.equal(blockOneCount, 1);
                });
            });
        });
        describe("getTransaction", function () {
            describe("On a EIP-1559 network", function () {
                describe("Confirmed transactions", function () {
                    it("Should return its hash, network fees, blockNumber and blockHash", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const req = {
                                to: this.accounts[1],
                                from: this.accounts[0],
                                value: 1n,
                                fees: {
                                    maxFeePerGas: 1000000000n,
                                    maxPriorityFeePerGas: 1n,
                                },
                                gasLimit: 21000n,
                                data: "0x",
                                nonce: 0,
                            };
                            const hash = yield client.sendTransaction(req);
                            const tx = yield client.getTransaction(hash);
                            chai_1.assert.isDefined(tx);
                            chai_1.assert.equal(tx.hash, hash);
                            (0, chai_1.assert)("maxFeePerGas" in tx.fees);
                            (0, chai_1.assert)("maxPriorityFeePerGas" in tx.fees);
                            (0, chai_1.assert)("maxFeePerGas" in tx.fees);
                            (0, chai_1.assert)("maxPriorityFeePerGas" in tx.fees);
                            chai_1.assert.equal(tx.fees.maxFeePerGas, req.fees.maxFeePerGas);
                            chai_1.assert.equal(tx.fees.maxPriorityFeePerGas, req.fees.maxPriorityFeePerGas);
                        });
                    });
                });
                describe("Pending transactions", function () {
                    it("Should the tx if it is in the mempool", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield this.hre.network.provider.send("evm_setAutomine", [false]);
                            const req = {
                                to: this.accounts[1],
                                from: this.accounts[0],
                                value: 1n,
                                fees: {
                                    maxFeePerGas: 1000000000n,
                                    maxPriorityFeePerGas: 1n,
                                },
                                gasLimit: 21000n,
                                data: "0x",
                                nonce: 0,
                            };
                            const hash = yield client.sendTransaction(req);
                            const tx = yield client.getTransaction(hash);
                            chai_1.assert.isDefined(tx);
                            chai_1.assert.equal(tx.hash, hash);
                            (0, chai_1.assert)("maxFeePerGas" in tx.fees);
                            (0, chai_1.assert)("maxPriorityFeePerGas" in tx.fees);
                            chai_1.assert.equal(tx.fees.maxFeePerGas, req.fees.maxFeePerGas);
                            chai_1.assert.equal(tx.fees.maxPriorityFeePerGas, req.fees.maxPriorityFeePerGas);
                        });
                    });
                    it("Should return undefined if the transaction was never sent", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const tx = yield client.getTransaction("0x0000000000000000000000000000000000000000000000000000000000000001");
                            chai_1.assert.isUndefined(tx);
                        });
                    });
                    it("Should return undefined if the transaction was replaced by a different one", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield this.hre.network.provider.send("evm_setAutomine", [false]);
                            const firstReq = {
                                to: this.accounts[1],
                                from: this.accounts[0],
                                value: 1n,
                                fees: {
                                    maxFeePerGas: 1000000000n,
                                    maxPriorityFeePerGas: 1n,
                                },
                                gasLimit: 21000n,
                                data: "0x",
                                nonce: 0,
                            };
                            const firstTxHash = yield client.sendTransaction(firstReq);
                            const secondReq = Object.assign(Object.assign({}, firstReq), { fees: {
                                    maxFeePerGas: 2000000000n,
                                    maxPriorityFeePerGas: 2n,
                                } });
                            yield client.sendTransaction(secondReq);
                            const tx = yield client.getTransaction(firstTxHash);
                            chai_1.assert.isUndefined(tx);
                        });
                    });
                    it("Should return undefined if the transaction was dropped", function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield this.hre.network.provider.send("evm_setAutomine", [false]);
                            const txHash = yield client.sendTransaction({
                                to: this.accounts[1],
                                from: this.accounts[0],
                                value: 1n,
                                fees: {
                                    maxFeePerGas: 1000000000n,
                                    maxPriorityFeePerGas: 1n,
                                },
                                gasLimit: 21000n,
                                data: "0x",
                                nonce: 0,
                            });
                            yield this.hre.network.provider.send("hardhat_dropTransaction", [
                                txHash,
                            ]);
                            const tx = yield client.getTransaction(txHash);
                            chai_1.assert.isUndefined(tx);
                        });
                    });
                });
            });
        });
        describe("getTransactionReceipt", function () {
            describe("Confirmed transactions", function () {
                it("Should return the receipt if the transaction was successful", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const hash = yield client.sendTransaction({
                            to: this.accounts[1],
                            from: this.accounts[0],
                            value: 1n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                            gasLimit: 21000n,
                            data: "0x",
                            nonce: 0,
                        });
                        const block = yield client.getLatestBlock();
                        const receipt = yield client.getTransactionReceipt(hash);
                        chai_1.assert.isDefined(receipt);
                        chai_1.assert.equal(receipt.blockHash, block.hash);
                        chai_1.assert.equal(receipt.blockNumber, block.number);
                        chai_1.assert.equal(receipt.status, jsonrpc_1.TransactionReceiptStatus.SUCCESS);
                        chai_1.assert.isUndefined(receipt.contractAddress);
                        chai_1.assert.deepEqual(receipt.logs, []);
                    });
                });
                it("Should return the contract address for successful deployment transactions", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const artifact = yield this.hre.artifacts.readArtifact("C");
                        const hash = yield client.sendTransaction({
                            from: this.accounts[0],
                            value: 0n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                            gasLimit: 1000000n,
                            data: (0, abi_1.encodeArtifactDeploymentData)(artifact, [], {}),
                            nonce: 0,
                        });
                        const block = yield client.getLatestBlock();
                        const receipt = yield client.getTransactionReceipt(hash);
                        chai_1.assert.isDefined(receipt);
                        chai_1.assert.equal(receipt.blockHash, block.hash);
                        chai_1.assert.equal(receipt.blockNumber, block.number);
                        chai_1.assert.equal(receipt.status, jsonrpc_1.TransactionReceiptStatus.SUCCESS);
                        chai_1.assert.isDefined(receipt.contractAddress);
                        chai_1.assert.deepEqual(receipt.logs, []);
                    });
                });
                it("Should return the receipt for reverted transactions", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const hash = yield client.sendTransaction({
                            data: "0x1234123120",
                            value: 0n,
                            from: this.accounts[0],
                            nonce: 0,
                            gasLimit: 5000000n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                        });
                        const block = yield client.getLatestBlock();
                        const receipt = yield client.getTransactionReceipt(hash);
                        chai_1.assert.isDefined(receipt);
                        chai_1.assert.equal(receipt.blockHash, block.hash);
                        chai_1.assert.equal(receipt.blockNumber, block.number);
                        chai_1.assert.equal(receipt.status, jsonrpc_1.TransactionReceiptStatus.FAILURE);
                        chai_1.assert.isUndefined(receipt.contractAddress);
                        chai_1.assert.deepEqual(receipt.logs, []);
                    });
                });
                it("Should return the right logs", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { artifact, address } = yield deployContract(this);
                        const hash = yield client.sendTransaction({
                            to: address,
                            data: (0, abi_1.encodeArtifactFunctionCall)(artifact, "events", []),
                            value: 0n,
                            from: this.accounts[0],
                            nonce: 1,
                            gasLimit: 5000000n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                        });
                        const block = yield client.getLatestBlock();
                        const receipt = yield client.getTransactionReceipt(hash);
                        chai_1.assert.isDefined(receipt);
                        chai_1.assert.equal(receipt.blockHash, block.hash);
                        chai_1.assert.equal(receipt.blockNumber, block.number);
                        chai_1.assert.equal(receipt.status, jsonrpc_1.TransactionReceiptStatus.SUCCESS);
                        chai_1.assert.isUndefined(receipt.contractAddress);
                        chai_1.assert.isArray(receipt.logs);
                        chai_1.assert.lengthOf(receipt.logs, 2);
                        const event0 = receipt.logs[0];
                        const event1 = receipt.logs[1];
                        chai_1.assert.equal(event0.address, address);
                        chai_1.assert.notEqual(event1.address, address);
                        chai_1.assert.equal(event0.logIndex, 0);
                        chai_1.assert.equal(event1.logIndex, 1);
                        chai_1.assert.notEqual(event0.data, "0x");
                        chai_1.assert.notEqual(event1.data, "0x");
                        chai_1.assert.isDefined(event0.topics[0]);
                        chai_1.assert.notEqual(event0.topics[0], "0x");
                        chai_1.assert.isDefined(event1.topics[0]);
                        chai_1.assert.notEqual(event1.topics[0], "0x");
                        chai_1.assert.notEqual(event0.topics[0], event1.topics[0]);
                    });
                });
            });
            describe("Pending transactions", function () {
                it("Should return undefined if the transaction is in the mempool", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        const hash = yield client.sendTransaction({
                            to: this.accounts[1],
                            from: this.accounts[0],
                            value: 1n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                            gasLimit: 21000n,
                            data: "0x",
                            nonce: 0,
                        });
                        const receipt = yield client.getTransactionReceipt(hash);
                        chai_1.assert.isUndefined(receipt);
                    });
                });
                it("Should return undefined if the transaction was never sent", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const receipt = yield client.getTransactionReceipt("0x0000000000000000000000000000000000000000000000000000000000000001");
                        chai_1.assert.isUndefined(receipt);
                    });
                });
                it("Should return undefined if the transaction was replaced by a different one", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        const firstReq = {
                            to: this.accounts[1],
                            from: this.accounts[0],
                            value: 1n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                            gasLimit: 21000n,
                            data: "0x",
                            nonce: 0,
                        };
                        const firstTxHash = yield client.sendTransaction(firstReq);
                        const secondReq = Object.assign(Object.assign({}, firstReq), { fees: {
                                maxFeePerGas: 2000000000n,
                                maxPriorityFeePerGas: 2n,
                            } });
                        yield client.sendTransaction(secondReq);
                        const receipt = yield client.getTransactionReceipt(firstTxHash);
                        chai_1.assert.isUndefined(receipt);
                    });
                });
                it("Should return undefined if the transaction was dropped", function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield this.hre.network.provider.send("evm_setAutomine", [false]);
                        const txHash = yield client.sendTransaction({
                            to: this.accounts[1],
                            from: this.accounts[0],
                            value: 1n,
                            fees: {
                                maxFeePerGas: 1000000000n,
                                maxPriorityFeePerGas: 1n,
                            },
                            gasLimit: 21000n,
                            data: "0x",
                            nonce: 0,
                        });
                        yield this.hre.network.provider.send("hardhat_dropTransaction", [
                            txHash,
                        ]);
                        const receipt = yield client.getTransactionReceipt(txHash);
                        chai_1.assert.isUndefined(receipt);
                    });
                });
            });
        });
    });
    describe("With a hardhat network that doesn't throw on transaction errors", function () {
        (0, hardhat_projects_1.useHardhatProject)("dont-throw-on-reverts");
        describe("sendTransaction", function () {
            it("Should return the tx hash, even on execution failures", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const client = new jsonrpc_client_1.EIP1193JsonRpcClient(this.hre.network.provider);
                    // We send an invalid deployment transaction
                    const result = yield client.sendTransaction({
                        data: "0x1234123120",
                        value: 0n,
                        from: this.accounts[0],
                        nonce: 0,
                        gasLimit: 5000000n,
                        fees: {
                            maxFeePerGas: 1000000000n,
                            maxPriorityFeePerGas: 1n,
                        },
                    });
                    chai_1.assert.isString(result);
                });
            });
        });
    });
});
