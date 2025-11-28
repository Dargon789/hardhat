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
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const hardhat_ethers_provider_1 = require("../src/internal/hardhat-ethers-provider");
const example_contracts_1 = require("./example-contracts");
const environment_1 = require("./environment");
const helpers_1 = require("./helpers");
(0, chai_1.use)(chai_as_promised_1.default);
describe("hardhat ethers provider", function () {
    (0, environment_1.usePersistentEnvironment)("minimal-project");
    it("can access itself through .provider", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.strictEqual(this.env.ethers.provider, this.env.ethers.provider.provider);
        });
    });
    it("should have a destroy method", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.env.ethers.provider.destroy();
        });
    });
    it("should have a send method for raw JSON-RPC requests", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = yield this.env.ethers.provider.send("eth_accounts");
            chai_1.assert.isArray(accounts);
        });
    });
    describe("getSigner", function () {
        it("should get a signer using an index", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                chai_1.assert.strictEqual(yield signer.getAddress(), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
            });
        });
        it("should get a signer using an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                chai_1.assert.strictEqual(yield signer.getAddress(), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
            });
        });
        it("should get a signer even if the address is all lowercase", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266");
                chai_1.assert.strictEqual(yield signer.getAddress(), "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
            });
        });
        it("should throw if the address checksum is wrong", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.env.ethers.provider.getSigner("0XF39FD6E51AAD88F6F4CE6AB8827279CFFFB92266"), "invalid address");
            });
        });
        it("should throw if the index doesn't match an account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.env.ethers.provider.getSigner(100), "Tried to get account with index 100 but there are 20 accounts");
            });
        });
        it("should work for impersonated accounts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const [s] = yield this.env.ethers.getSigners();
                const randomAddress = "0xe7d45f52130a5634f19346a3e5d32994ad821750";
                yield s.sendTransaction({
                    to: randomAddress,
                    value: this.env.ethers.parseEther("1"),
                });
                yield this.env.ethers.provider.send("hardhat_impersonateAccount", [
                    randomAddress,
                ]);
                const impersonatedSigner = yield this.env.ethers.provider.getSigner(randomAddress);
                // shouldn't revert
                yield impersonatedSigner.sendTransaction({
                    to: s.address,
                    value: this.env.ethers.parseEther("0.1"),
                });
            });
        });
    });
    it("should return the latest block number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const latestBlockNumber = yield this.env.ethers.provider.getBlockNumber();
            chai_1.assert.strictEqual(latestBlockNumber, 0);
            yield this.env.ethers.provider.send("hardhat_mine");
            chai_1.assert.strictEqual(latestBlockNumber, 0);
        });
    });
    it("should return the network", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const network = yield this.env.ethers.provider.getNetwork();
            chai_1.assert.strictEqual(network.name, "hardhat");
            chai_1.assert.strictEqual(network.chainId, 31337n);
        });
    });
    describe("getFeeData", function () {
        it("should return fee data", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const feeData = yield this.env.ethers.provider.getFeeData();
                chai_1.assert.typeOf(feeData.gasPrice, "bigint");
                chai_1.assert.typeOf(feeData.maxFeePerGas, "bigint");
                chai_1.assert.typeOf(feeData.maxPriorityFeePerGas, "bigint");
            });
        });
        // This helper overrides the send method of an EthereumProvider to allow
        // altering the default Hardhat node's reported results.
        function overrideSendOn(provider, sendOveride) {
            return new Proxy(provider, {
                get: (target, prop) => {
                    if (prop === "send") {
                        return (method, params) => __awaiter(this, void 0, void 0, function* () {
                            const result = yield sendOveride(method, params);
                            return result !== null && result !== void 0 ? result : target.send(method, params);
                        });
                    }
                    return target[prop];
                },
            });
        }
        it("should default maxPriorityFeePerGas to 1 gwei (if eth_maxPriorityFeePerGas not supported)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const proxiedProvider = overrideSendOn(this.env.network.provider, (method) => __awaiter(this, void 0, void 0, function* () {
                    if (method !== "eth_maxPriorityFeePerGas") {
                        // rely on default send implementation
                        return undefined;
                    }
                    throw new Error("Method eth_maxPriorityFeePerGas is not supported");
                }));
                const ethersProvider = new hardhat_ethers_provider_1.HardhatEthersProvider(proxiedProvider, this.env.network.name);
                const feeData = yield ethersProvider.getFeeData();
                chai_1.assert.equal(feeData.maxPriorityFeePerGas, 1000000000n);
            });
        });
        it("should default maxPriorityFeePerGas to eth_maxPriorityFeePerGas if available", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const expectedMaxPriorityFeePerGas = 4000000000n;
                const overridenEthereumProvider = overrideSendOn(this.env.network.provider, (method) => __awaiter(this, void 0, void 0, function* () {
                    if (method !== "eth_maxPriorityFeePerGas") {
                        // rely on default send implementation
                        return undefined;
                    }
                    return expectedMaxPriorityFeePerGas.toString();
                }));
                const ethersProvider = new hardhat_ethers_provider_1.HardhatEthersProvider(overridenEthereumProvider, this.env.network.name);
                const feeData = yield ethersProvider.getFeeData();
                chai_1.assert.equal(feeData.maxPriorityFeePerGas, 4000000000n);
            });
        });
    });
    describe("getBalance", function () {
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.network.provider.send("hardhat_reset");
            });
        });
        it("should return the balance of an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const balance = yield this.env.ethers.provider.getBalance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                chai_1.assert.strictEqual(balance, this.env.ethers.parseEther("10000"));
            });
        });
        it("should return the balance of a signer", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const balance = yield this.env.ethers.provider.getBalance(signer);
                chai_1.assert.strictEqual(balance, this.env.ethers.parseEther("10000"));
            });
        });
        it("should accept block numbers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const gasLimit = 21000n;
                const gasPrice = this.env.ethers.parseUnits("100", "gwei");
                const value = this.env.ethers.parseEther("1");
                yield signer.sendTransaction({
                    to: this.env.ethers.ZeroAddress,
                    value,
                    gasLimit,
                    gasPrice,
                });
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const balanceAfter = yield this.env.ethers.provider.getBalance(signer, "latest");
                chai_1.assert.strictEqual(balanceAfter, this.env.ethers.parseEther("10000") - gasLimit * gasPrice - value);
                const balanceBefore = yield this.env.ethers.provider.getBalance(signer, blockNumber - 1);
                chai_1.assert.strictEqual(balanceBefore, this.env.ethers.parseEther("10000"));
            });
        });
        it("should accept block hashes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const balance = yield this.env.ethers.provider.getBalance("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", block.hash);
                chai_1.assert.strictEqual(balance, this.env.ethers.parseEther("10000"));
            });
        });
        it("should return the balance of a contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // deploy a contract with some ETH
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy({
                    value: this.env.ethers.parseEther("0.5"),
                });
                // check the balance of the contract
                const balance = yield this.env.ethers.provider.getBalance(contract);
                chai_1.assert.strictEqual(balance, 5n * 10n ** 17n);
            });
        });
    });
    describe("getTransactionCount", function () {
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.network.provider.send("hardhat_reset");
            });
        });
        it("should return the transaction count of an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const balance = yield this.env.ethers.provider.getTransactionCount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266");
                chai_1.assert.strictEqual(balance, 0);
            });
        });
        it("should return the transaction count of a signer", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const balance = yield this.env.ethers.provider.getTransactionCount(signer);
                chai_1.assert.strictEqual(balance, 0);
            });
        });
        it("should accept block numbers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                yield signer.sendTransaction({
                    to: this.env.ethers.ZeroAddress,
                });
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const transactionCountAfter = yield this.env.ethers.provider.getTransactionCount(signer, "latest");
                chai_1.assert.strictEqual(transactionCountAfter, 1);
                const transactionCountBefore = yield this.env.ethers.provider.getTransactionCount(signer, blockNumber - 1);
                chai_1.assert.strictEqual(transactionCountBefore, 0);
            });
        });
        it("should accept block hashes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const balance = yield this.env.ethers.provider.getTransactionCount("0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266", block.hash);
                chai_1.assert.strictEqual(balance, 0);
            });
        });
    });
    describe("getCode", function () {
        // deploys an empty contract
        const deploymentBytecode = "0x6080604052348015600f57600080fd5b50603f80601d6000396000f3fe6080604052600080fdfea2646970667358221220eeaf807039e8b863535433564733b36afab56700620e89f192795eaf32f272ee64736f6c63430008110033";
        const contractBytecode = "0x6080604052600080fdfea2646970667358221220eeaf807039e8b863535433564733b36afab56700620e89f192795eaf32f272ee64736f6c63430008110033";
        let contract;
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory([], deploymentBytecode, signer);
                contract = yield factory.deploy();
            });
        });
        it("should return the code of an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractAddress = yield contract.getAddress();
                const code = yield this.env.ethers.provider.getCode(contractAddress);
                chai_1.assert.strictEqual(code, contractBytecode);
            });
        });
        it("should return the code of a contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const code = yield this.env.ethers.provider.getCode(contract);
                chai_1.assert.strictEqual(code, contractBytecode);
            });
        });
        it("should accept block numbers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const codeAfter = yield this.env.ethers.provider.getCode(contract, "latest");
                chai_1.assert.strictEqual(codeAfter, contractBytecode);
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const codeBefore = yield this.env.ethers.provider.getCode(contract, blockNumber - 1);
                chai_1.assert.strictEqual(codeBefore, "0x");
            });
        });
        it("should accept block hashes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const code = yield this.env.ethers.provider.getCode(contract, block.hash);
                chai_1.assert.strictEqual(code, contractBytecode);
            });
        });
    });
    describe("getStorage", function () {
        let contract;
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                contract = yield factory.deploy();
            });
        });
        it("should get the storage of an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractAddress = yield contract.getAddress();
                yield contract.inc();
                const value = yield this.env.ethers.provider.getStorage(contractAddress, 0);
                const doubleValue = yield this.env.ethers.provider.getStorage(contractAddress, 1);
                chai_1.assert.strictEqual(value, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(doubleValue, "0x0000000000000000000000000000000000000000000000000000000000000002");
            });
        });
        it("should get the storage of a contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const value = yield this.env.ethers.provider.getStorage(contract, 0);
                const doubleValue = yield this.env.ethers.provider.getStorage(contract, 1);
                chai_1.assert.strictEqual(value, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(doubleValue, "0x0000000000000000000000000000000000000000000000000000000000000002");
            });
        });
        it("should accept block numbers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const storageValueAfter = yield this.env.ethers.provider.getStorage(contract, 0, "latest");
                chai_1.assert.strictEqual(storageValueAfter, "0x0000000000000000000000000000000000000000000000000000000000000001");
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const storageValueBefore = yield this.env.ethers.provider.getStorage(contract, 0, blockNumber - 1);
                chai_1.assert.strictEqual(storageValueBefore, "0x0000000000000000000000000000000000000000000000000000000000000000");
            });
        });
        it("should accept block hashes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const storageValue = yield this.env.ethers.provider.getStorage(contract, 0, block.hash);
                chai_1.assert.strictEqual(storageValue, "0x0000000000000000000000000000000000000000000000000000000000000001");
            });
        });
        it("should accept short hex encode strings as the storage position", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const value = yield this.env.ethers.provider.getStorage(contract, "0x0");
                const doubleValue = yield this.env.ethers.provider.getStorage(contract, "0x1");
                chai_1.assert.strictEqual(value, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(doubleValue, "0x0000000000000000000000000000000000000000000000000000000000000002");
            });
        });
        it("should accept long hex encode strings as the storage position", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const value = yield this.env.ethers.provider.getStorage(contract, "0x0000000000000000000000000000000000000000000000000000000000000000");
                const doubleValue = yield this.env.ethers.provider.getStorage(contract, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(value, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(doubleValue, "0x0000000000000000000000000000000000000000000000000000000000000002");
            });
        });
        it("should accept bigints as the storage position", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield contract.inc();
                const value = yield this.env.ethers.provider.getStorage(contract, 0n);
                const doubleValue = yield this.env.ethers.provider.getStorage(contract, 1n);
                chai_1.assert.strictEqual(value, "0x0000000000000000000000000000000000000000000000000000000000000001");
                chai_1.assert.strictEqual(doubleValue, "0x0000000000000000000000000000000000000000000000000000000000000002");
            });
        });
    });
    describe("estimateGas", function () {
        it("should estimate gas for a value transaction", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const gasEstimation = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: signer.address,
                });
                chai_1.assert.strictEqual(Number(gasEstimation), 21001);
            });
        });
        it("should estimate gas for a contract call", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                const gasEstimation = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0", // inc()
                });
                (0, helpers_1.assertWithin)(Number(gasEstimation), 65000, 70000);
            });
        });
        it("should accept a block number", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const gasEstimationAfter = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0",
                    blockTag: "latest",
                });
                (0, helpers_1.assertWithin)(Number(gasEstimationAfter), 30000, 35000);
                const gasEstimationBefore = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0",
                    blockTag: blockNumber - 1,
                });
                (0, helpers_1.assertWithin)(Number(gasEstimationBefore), 65000, 70000);
            });
        });
        it("should accept a block hash", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const gasEstimation = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0",
                    blockTag: block.hash,
                });
                (0, helpers_1.assertWithin)(Number(gasEstimation), 65000, 70000);
            });
        });
        it("should use the pending block by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                // this estimates the cost of increasing the value from 0 to 1
                const gasEstimationFirstInc = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0", // inc()
                });
                yield this.env.ethers.provider.send("evm_setAutomine", [false]);
                yield contract.inc();
                // if the pending block is used, this should estimate the cost of
                // increasing the value from 1 to 2, and this should be cheaper than
                // increasing it from 0 to 1
                const gasEstimationSecondInc = yield this.env.ethers.provider.estimateGas({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x371303c0", // inc()
                });
                chai_1.assert.isTrue(gasEstimationSecondInc < gasEstimationFirstInc, "Expected second gas estimation to be lower");
                yield this.env.ethers.provider.send("evm_setAutomine", [true]);
            });
        });
    });
    describe("call", function () {
        it("should make a contract call using an address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const result = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: yield contract.getAddress(),
                    data: "0x3fa4f245", // value()
                });
                chai_1.assert.strictEqual(result, "0x0000000000000000000000000000000000000000000000000000000000000001");
            });
        });
        it("should make a contract call using a contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const result = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245", // value()
                });
                chai_1.assert.strictEqual(result, "0x0000000000000000000000000000000000000000000000000000000000000001");
            });
        });
        it("should accept a block number", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const resultAfter = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245",
                    blockTag: "latest",
                });
                chai_1.assert.strictEqual(resultAfter, "0x0000000000000000000000000000000000000000000000000000000000000001");
                const resultBefore = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245",
                    blockTag: blockNumber - 1,
                });
                chai_1.assert.strictEqual(resultBefore, "0x0000000000000000000000000000000000000000000000000000000000000000");
            });
        });
        it("should accept a block number as a bigint", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const resultAfter = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245",
                    blockTag: "latest",
                });
                chai_1.assert.strictEqual(resultAfter, "0x0000000000000000000000000000000000000000000000000000000000000001");
                const resultBefore = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245",
                    blockTag: BigInt(blockNumber - 1),
                });
                chai_1.assert.strictEqual(resultBefore, "0x0000000000000000000000000000000000000000000000000000000000000000");
            });
        });
        it("should accept a block hash", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                (0, helpers_1.assertIsNotNull)(block.hash);
                const result = yield this.env.ethers.provider.call({
                    from: signer.address,
                    to: contract,
                    data: "0x3fa4f245",
                    blockTag: block.hash,
                });
                chai_1.assert.strictEqual(result, "0x0000000000000000000000000000000000000000000000000000000000000001");
            });
        });
    });
    describe("broadcastTransaction", function () {
        it("should send a raw transaction", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.ethers.provider.send("hardhat_reset");
                // private key of the first unlocked account
                const wallet = new this.env.ethers.Wallet("0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80", this.env.ethers.provider);
                const rawTx = yield wallet.signTransaction({
                    to: this.env.ethers.ZeroAddress,
                    chainId: 31337,
                    gasPrice: 100n * 10n ** 9n,
                    gasLimit: 21000,
                });
                const tx = yield this.env.ethers.provider.broadcastTransaction(rawTx);
                chai_1.assert.strictEqual(tx.from, wallet.address);
                chai_1.assert.strictEqual(tx.to, this.env.ethers.ZeroAddress);
                chai_1.assert.strictEqual(tx.gasLimit, 21000n);
            });
        });
    });
    describe("getBlock", function () {
        it("should accept latest and earliest block tags", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.ethers.provider.send("hardhat_reset");
                yield this.env.ethers.provider.send("hardhat_mine");
                yield this.env.ethers.provider.send("hardhat_mine");
                yield this.env.ethers.provider.send("hardhat_mine");
                const latestBlock = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(latestBlock);
                chai_1.assert.strictEqual(latestBlock.number, 3);
                const earliestBlock = yield this.env.ethers.provider.getBlock("earliest");
                (0, helpers_1.assertIsNotNull)(earliestBlock);
                chai_1.assert.strictEqual(earliestBlock.number, 0);
            });
        });
        it("should accept numbers", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.ethers.provider.send("hardhat_reset");
                yield this.env.ethers.provider.send("hardhat_mine");
                yield this.env.ethers.provider.send("hardhat_mine");
                yield this.env.ethers.provider.send("hardhat_mine");
                const latestBlock = yield this.env.ethers.provider.getBlock(3);
                (0, helpers_1.assertIsNotNull)(latestBlock);
                chai_1.assert.strictEqual(latestBlock.number, 3);
                const earliestBlock = yield this.env.ethers.provider.getBlock(1);
                (0, helpers_1.assertIsNotNull)(earliestBlock);
                chai_1.assert.strictEqual(earliestBlock.number, 1);
            });
        });
        it("should accept block hashes", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.ethers.provider.send("hardhat_reset");
                const blockByNumber = yield this.env.ethers.provider.getBlock(0);
                (0, helpers_1.assertIsNotNull)(blockByNumber);
                (0, helpers_1.assertIsNotNull)(blockByNumber.hash);
                const blockByHash = yield this.env.ethers.provider.getBlock(blockByNumber.hash);
                (0, helpers_1.assertIsNotNull)(blockByHash);
                chai_1.assert.strictEqual(blockByNumber.number, blockByHash.number);
                chai_1.assert.strictEqual(blockByNumber.hash, blockByHash.hash);
            });
        });
        it("shouldn't prefetch transactions by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({ to: signer.address });
                const block = yield this.env.ethers.provider.getBlock("latest");
                (0, helpers_1.assertIsNotNull)(block);
                chai_1.assert.lengthOf(block.transactions, 1);
                chai_1.assert.strictEqual(block.transactions[0], tx.hash);
                chai_1.assert.throws(() => block.prefetchedTransactions);
            });
        });
        it("shouldn't prefetch transactions if false is passed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({ to: signer.address });
                const block = yield this.env.ethers.provider.getBlock("latest", false);
                (0, helpers_1.assertIsNotNull)(block);
                chai_1.assert.lengthOf(block.transactions, 1);
                chai_1.assert.strictEqual(block.transactions[0], tx.hash);
                chai_1.assert.throws(() => block.prefetchedTransactions);
            });
        });
        it("should prefetch transactions if true is passed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({ to: signer.address });
                const block = yield this.env.ethers.provider.getBlock("latest", true);
                (0, helpers_1.assertIsNotNull)(block);
                chai_1.assert.lengthOf(block.transactions, 1);
                chai_1.assert.strictEqual(block.transactions[0], tx.hash);
                chai_1.assert.lengthOf(block.prefetchedTransactions, 1);
                chai_1.assert.strictEqual(block.prefetchedTransactions[0].hash, tx.hash);
                chai_1.assert.strictEqual(block.prefetchedTransactions[0].from, signer.address);
            });
        });
    });
    describe("getTransaction", function () {
        it("should get a transaction by its hash", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const sentTx = yield signer.sendTransaction({ to: signer.address });
                const fetchedTx = yield this.env.ethers.provider.getTransaction(sentTx.hash);
                (0, helpers_1.assertIsNotNull)(fetchedTx);
                chai_1.assert.strictEqual(fetchedTx.hash, sentTx.hash);
            });
        });
        it("should return null if the transaction doesn't exist", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield this.env.ethers.provider.getTransaction("0x0000000000000000000000000000000000000000000000000000000000000000");
                chai_1.assert.isNull(tx);
            });
        });
    });
    describe("getTransactionReceipt", function () {
        it("should get a receipt by the transaction hash", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const tx = yield signer.sendTransaction({ to: signer.address });
                const receipt = yield this.env.ethers.provider.getTransactionReceipt(tx.hash);
                (0, helpers_1.assertIsNotNull)(receipt);
                chai_1.assert.strictEqual(receipt.hash, tx.hash);
                chai_1.assert.strictEqual(receipt.status, 1);
            });
        });
        it("should return null if the transaction doesn't exist", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const receipt = yield this.env.ethers.provider.getTransactionReceipt("0x0000000000000000000000000000000000000000000000000000000000000000");
                chai_1.assert.isNull(receipt);
            });
        });
    });
    describe("getLogs", function () {
        // keccak("Inc()")
        const INC_EVENT_TOPIC = "0xccf19ee637b3555bb918b8270dfab3f2b4ec60236d1ab717296aa85d6921224f";
        // keccak("AnotherEvent()")
        const ANOTHER_EVENT_TOPIC = "0x601d819e31a3cd164f83f7a7cf9cb5042ab1acff87b773c68f63d059c0af2dc0";
        it("should get the logs from the latest block by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                const logs = yield this.env.ethers.provider.getLogs({});
                chai_1.assert.lengthOf(logs, 1);
                const log = logs[0];
                chai_1.assert.strictEqual(log.address, yield contract.getAddress());
                chai_1.assert.lengthOf(log.topics, 1);
                chai_1.assert.strictEqual(log.topics[0], INC_EVENT_TOPIC);
            });
        });
        it("should get the logs by block number", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.inc();
                yield this.env.ethers.provider.send("hardhat_mine");
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                // latest block shouldn't have logs
                const latestBlockLogs = yield this.env.ethers.provider.getLogs({
                    fromBlock: blockNumber,
                    toBlock: blockNumber,
                });
                chai_1.assert.lengthOf(latestBlockLogs, 0);
                const logs = yield this.env.ethers.provider.getLogs({
                    fromBlock: blockNumber - 1,
                    toBlock: blockNumber - 1,
                });
                chai_1.assert.lengthOf(logs, 1);
                const log = logs[0];
                chai_1.assert.strictEqual(log.address, yield contract.getAddress());
                chai_1.assert.lengthOf(log.topics, 1);
                chai_1.assert.strictEqual(log.topics[0], INC_EVENT_TOPIC);
            });
        });
        it("should get the logs by address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract1 = yield factory.deploy();
                const contract2 = yield factory.deploy();
                yield contract1.inc();
                yield contract2.inc();
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const logs = yield this.env.ethers.provider.getLogs({
                    fromBlock: blockNumber - 1,
                    toBlock: blockNumber,
                });
                chai_1.assert.lengthOf(logs, 2);
                const logsByAddress = yield this.env.ethers.provider.getLogs({
                    address: yield contract1.getAddress(),
                    fromBlock: blockNumber - 1,
                    toBlock: blockNumber,
                });
                chai_1.assert.lengthOf(logsByAddress, 1);
                chai_1.assert.strictEqual(logsByAddress[0].address, yield contract1.getAddress());
            });
        });
        it("should get the logs by an array of addresses", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract1 = yield factory.deploy();
                const contract2 = yield factory.deploy();
                const contract3 = yield factory.deploy();
                yield contract1.inc();
                yield contract2.inc();
                yield contract3.inc();
                const blockNumber = yield this.env.ethers.provider.getBlockNumber();
                const logs = yield this.env.ethers.provider.getLogs({
                    fromBlock: blockNumber - 2,
                    toBlock: blockNumber,
                });
                chai_1.assert.lengthOf(logs, 3);
                const contract1Address = yield contract1.getAddress();
                const contract2Address = yield contract2.getAddress();
                const logsByAddress = yield this.env.ethers.provider.getLogs({
                    address: [contract1Address, contract2Address],
                    fromBlock: blockNumber - 2,
                    toBlock: blockNumber,
                });
                chai_1.assert.lengthOf(logsByAddress, 2);
                chai_1.assert.strictEqual(logsByAddress[0].address, contract1Address);
                chai_1.assert.strictEqual(logsByAddress[1].address, contract2Address);
            });
        });
        it("should get the logs by topic", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const signer = yield this.env.ethers.provider.getSigner(0);
                const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
                const contract = yield factory.deploy();
                yield contract.emitsTwoEvents();
                const logs = yield this.env.ethers.provider.getLogs({});
                chai_1.assert.lengthOf(logs, 2);
                const incEventLogs = yield this.env.ethers.provider.getLogs({
                    topics: [INC_EVENT_TOPIC],
                });
                chai_1.assert.lengthOf(incEventLogs, 1);
                chai_1.assert.lengthOf(incEventLogs[0].topics, 1);
                chai_1.assert.strictEqual(incEventLogs[0].topics[0], INC_EVENT_TOPIC);
                const anotherEventLogs = yield this.env.ethers.provider.getLogs({
                    topics: [ANOTHER_EVENT_TOPIC],
                });
                chai_1.assert.lengthOf(anotherEventLogs, 1);
                chai_1.assert.lengthOf(anotherEventLogs[0].topics, 1);
                chai_1.assert.strictEqual(anotherEventLogs[0].topics[0], ANOTHER_EVENT_TOPIC);
            });
        });
    });
});
