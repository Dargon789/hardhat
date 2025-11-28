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
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const viem_1 = require("viem");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const contracts_1 = require("../src/internal/contracts");
const provider_1 = require("./mocks/provider");
const helpers_1 = require("./helpers");
describe("Integration tests", function () {
    afterEach(function () {
        sinon_1.default.restore();
    });
    describe("Hardhat Runtime Environment extension", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        it("should add the viem object and it's properties", function () {
            (0, chai_1.expect)(this.hre.viem)
                .to.be.an("object")
                .that.has.all.keys([
                "getPublicClient",
                "getWalletClients",
                "getWalletClient",
                "getTestClient",
                "deployContract",
                "sendDeploymentTransaction",
                "getContractAt",
            ]);
        });
    });
    describe("Viem plugin", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_COMPILE, { quiet: true });
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_CLEAN);
            });
        });
        beforeEach(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.network.provider.send("hardhat_reset");
            });
        });
        describe("Clients", function () {
            it("should be able to query the blockchain using the public client", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const client = yield this.hre.viem.getPublicClient();
                    const blockNumber = yield client.getBlockNumber();
                    chai_1.assert.equal(blockNumber, 0n);
                });
            });
            it("should be able to query the blockchain using the wallet client", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    const [fromWalletClient, toWalletClient] = yield this.hre.viem.getWalletClients();
                    const fromAddress = fromWalletClient.account.address;
                    const toAddress = toWalletClient.account.address;
                    const fromBalanceBefore = yield publicClient.getBalance({
                        address: fromAddress,
                    });
                    const toBalanceBefore = yield publicClient.getBalance({
                        address: toAddress,
                    });
                    const etherAmount = (0, viem_1.parseEther)("0.0001");
                    const hash = yield fromWalletClient.sendTransaction({
                        to: toAddress,
                        value: etherAmount,
                    });
                    const receipt = yield publicClient.waitForTransactionReceipt({ hash });
                    const transactionFee = receipt.gasUsed * receipt.effectiveGasPrice;
                    const fromBalanceAfter = yield publicClient.getBalance({
                        address: fromAddress,
                    });
                    const toBalanceAfter = yield publicClient.getBalance({
                        address: toAddress,
                    });
                    chai_1.assert.isDefined(receipt);
                    chai_1.assert.equal(receipt.status, "success");
                    chai_1.assert.equal(fromBalanceAfter, fromBalanceBefore - etherAmount - transactionFee);
                    chai_1.assert.equal(toBalanceAfter, toBalanceBefore + etherAmount);
                });
            });
            it("should be able to query the blockchain using the test client", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    const testClient = yield this.hre.viem.getTestClient();
                    yield testClient.mine({
                        blocks: 1000000,
                    });
                    const blockNumber = yield publicClient.getBlockNumber();
                    chai_1.assert.equal(blockNumber, 1000000n);
                });
            });
        });
        describe("deployContract", function () {
            it("should be able to deploy a contract without constructor args", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const contract = yield this.hre.viem.deployContract("WithoutConstructorArgs");
                    yield contract.write.setData([50n]);
                    const data = yield contract.read.getData();
                    chai_1.assert.equal(data, 50n);
                });
            });
            it("should be able to deploy a contract with constructor args", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [defaultWalletClient] = yield this.hre.viem.getWalletClients();
                    const contract = yield this.hre.viem.deployContract("WithConstructorArgs", [50n]);
                    let data = yield contract.read.getData();
                    chai_1.assert.equal(data, 50n);
                    const owner = yield contract.read.getOwner();
                    chai_1.assert.equal(owner, (0, viem_1.getAddress)(defaultWalletClient.account.address));
                    yield contract.write.setData([100n]);
                    data = yield contract.read.getData();
                    chai_1.assert.equal(data, 100n);
                });
            });
            it("should be able to deploy a contract with a different wallet client", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [_, secondWalletClient] = yield this.hre.viem.getWalletClients();
                    const contract = yield this.hre.viem.deployContract("WithoutConstructorArgs", [], { client: { wallet: secondWalletClient } });
                    const owner = yield contract.read.getOwner();
                    chai_1.assert.equal(owner, (0, viem_1.getAddress)(secondWalletClient.account.address));
                });
            });
            it("should be able to deploy a contract with initial ETH", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    const [defaultWalletClient] = yield this.hre.viem.getWalletClients();
                    const ownerBalanceBefore = yield publicClient.getBalance({
                        address: defaultWalletClient.account.address,
                    });
                    const etherAmount = (0, viem_1.parseEther)("0.0001");
                    const contract = yield this.hre.viem.deployContract("WithoutConstructorArgs", [], { value: etherAmount });
                    const ownerBalanceAfter = yield publicClient.getBalance({
                        address: defaultWalletClient.account.address,
                    });
                    const contractBalance = yield publicClient.getBalance({
                        address: contract.address,
                    });
                    const block = yield publicClient.getBlock({
                        includeTransactions: true,
                    });
                    const receipt = yield publicClient.getTransactionReceipt({
                        hash: block.transactions[0].hash,
                    });
                    const transactionFee = receipt.gasUsed * receipt.effectiveGasPrice;
                    chai_1.assert.equal(contractBalance, etherAmount);
                    chai_1.assert.equal(ownerBalanceAfter, ownerBalanceBefore - etherAmount - transactionFee);
                });
            });
            it("should be able to deploy a contract with normal library linked", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const normalLibContract = yield this.hre.viem.deployContract("NormalLib");
                    const contract = yield this.hre.viem.deployContract("OnlyNormalLib", [], {
                        libraries: {
                            NormalLib: normalLibContract.address,
                        },
                    });
                    yield (0, chai_1.expect)(contract.read.getNumber([2n])).to.eventually.equal(4n);
                });
            });
            it("should be able to deploy a contract with constructor library linked", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const ctorLibContract = yield this.hre.viem.deployContract("contracts/WithLibs.sol:ConstructorLib");
                    const contract = yield this.hre.viem.deployContract("OnlyConstructorLib", [2n], {
                        libraries: {
                            ConstructorLib: ctorLibContract.address,
                        },
                    });
                    yield (0, chai_1.expect)(contract.read.getNumber([])).to.eventually.equal(8n);
                });
            });
            it("should be able to deploy a contract with both normal and constructor libraries linked", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const [ctorLibContract, normalLibContract] = yield Promise.all([
                        this.hre.viem.deployContract("contracts/WithLibs.sol:ConstructorLib"),
                        this.hre.viem.deployContract("NormalLib"),
                    ]);
                    const contract = yield this.hre.viem.deployContract("BothLibs", [3n], {
                        libraries: {
                            ConstructorLib: ctorLibContract.address,
                            NormalLib: normalLibContract.address,
                        },
                    });
                    yield (0, chai_1.expect)(contract.read.getNumber([])).to.eventually.equal(12n);
                    yield (0, chai_1.expect)(contract.read.getNumber([5n])).to.eventually.equal(10n);
                });
            });
            it("should throw an error if the contract address can't be retrieved", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    sinon_1.default.stub(publicClient, "waitForTransactionReceipt").returns(Promise.resolve({
                        contractAddress: null,
                    }));
                    const [walletClient] = yield this.hre.viem.getWalletClients();
                    const contractArtifact = yield this.hre.artifacts.readArtifact("WithoutConstructorArgs");
                    yield (0, chai_1.expect)((0, contracts_1.innerDeployContract)(publicClient, walletClient, contractArtifact.abi, contractArtifact.bytecode, [])).to.be.rejectedWith(/The deployment transaction '0x[a-fA-F0-9]{64}' was mined in block '\d+' but its receipt doesn't contain a contract address/);
                });
            });
            it("should throw an error if no accounts are configured for the network", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const provider = new provider_1.EthereumMockedProvider();
                    const sendStub = sinon_1.default.stub(provider, "send");
                    sendStub.withArgs("eth_accounts").returns(Promise.resolve([]));
                    const hre = Object.assign(Object.assign({}, this.hre), { network: Object.assign(Object.assign({}, this.hre.network), { provider }) });
                    yield (0, chai_1.expect)((0, contracts_1.deployContract)(hre, "WithoutConstructorArgs")).to.be.rejectedWith(/Default wallet client not found. This can happen if no accounts were configured for this network/);
                });
            });
            it("should wait for confirmations", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    const testClient = yield this.hre.viem.getTestClient();
                    const sleepingTime = 2 * publicClient.pollingInterval;
                    yield testClient.setAutomine(false);
                    let contractPromiseResolved = false;
                    const contractPromise = this.hre.viem
                        .deployContract("WithoutConstructorArgs", [], {
                        confirmations: 5,
                    })
                        .then(() => {
                        contractPromiseResolved = true;
                    });
                    yield (0, helpers_1.sleep)(sleepingTime);
                    chai_1.assert.isFalse(contractPromiseResolved);
                    yield testClient.mine({
                        blocks: 3,
                    });
                    yield (0, helpers_1.sleep)(sleepingTime);
                    chai_1.assert.isFalse(contractPromiseResolved);
                    yield testClient.mine({
                        blocks: 1,
                    });
                    yield (0, helpers_1.sleep)(sleepingTime);
                    chai_1.assert.isFalse(contractPromiseResolved);
                    yield testClient.mine({
                        blocks: 1,
                    });
                    yield contractPromise;
                    chai_1.assert.isTrue(contractPromiseResolved);
                });
            });
            it("should throw if the confirmations parameter is less than 0", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("WithoutConstructorArgs", [], {
                        confirmations: -1,
                    })).to.be.rejectedWith("Confirmations must be greater than 0.");
                });
            });
            it("should throw if the confirmations parameter is 0", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("WithoutConstructorArgs", [], {
                        confirmations: 0,
                    })).to.be.rejectedWith("deployContract does not support 0 confirmations. Use sendDeploymentTransaction if you want to handle the deployment transaction yourself.");
                });
            });
            it("should throw if there are any missing libraries", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("OnlyNormalLib", [], {})).to.be.rejectedWith(`The libraries needed are:\n\t* "contracts/WithLibs.sol:NormalLib"\nPlease deploy them first and link them while deploying "OnlyNormalLib"`);
                });
            });
            it("should throw if there are libraries that are not needed", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const ctorLibContract = yield this.hre.viem.deployContract("contracts/WithLibs.sol:ConstructorLib");
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("NormalLib", [], {
                        libraries: {
                            ConstructorLib: ctorLibContract.address,
                        },
                    })).to.be.rejectedWith(`The library name "ConstructorLib" was linked but it's not referenced by the "NormalLib" contract.`);
                    const numberLibContract = yield this.hre.viem.deployContract("NormalLib");
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("OnlyConstructorLib", [], {
                        libraries: {
                            ConstructorLib: ctorLibContract.address,
                            NormalLib: numberLibContract.address,
                        },
                    })).to.be.rejectedWith(`The library name "NormalLib" was linked but it's not referenced by the "OnlyConstructorLib" contract.`);
                });
            });
            it("should throw if there are too ambiguous libraries linked", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const externalCtorLibContract = yield this.hre.viem.deployContract("contracts/ConstructorLib.sol:ConstructorLib");
                    const ctorLibContract = yield this.hre.viem.deployContract("contracts/WithLibs.sol:ConstructorLib");
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("BothConstructorLibs", [1n], {
                        libraries: {
                            ConstructorLib: ctorLibContract.address,
                        },
                    })).to.be.rejectedWith(`The library name "ConstructorLib" is ambiguous for the contract "BothConstructorLibs".
It may resolve to one of the following libraries:

\t* contracts/ConstructorLib.sol:ConstructorLib,
\t* contracts/WithLibs.sol:ConstructorLib

To fix this, choose one of these fully qualified library names and replace where appropriate.`);
                    yield (0, chai_1.expect)(this.hre.viem.deployContract("BothConstructorLibs", [1n], {
                        libraries: {
                            "contracts/ConstructorLib.sol:ConstructorLib": externalCtorLibContract.address,
                            ConstructorLib: ctorLibContract.address,
                        },
                    })).to.be
                        .rejectedWith(`The library name "ConstructorLib" is ambiguous for the contract "BothConstructorLibs".
It may resolve to one of the following libraries:

\t* contracts/ConstructorLib.sol:ConstructorLib,
\t* contracts/WithLibs.sol:ConstructorLib

To fix this, choose one of these fully qualified library names and replace where appropriate.`);
                    const contract = yield this.hre.viem.deployContract("BothConstructorLibs", [2n], {
                        libraries: {
                            "contracts/ConstructorLib.sol:ConstructorLib": externalCtorLibContract.address,
                            "contracts/WithLibs.sol:ConstructorLib": ctorLibContract.address,
                        },
                    });
                    yield (0, chai_1.expect)(contract.read.getNumber([])).to.eventually.equal(64n);
                });
            });
        });
        describe("sendDeploymentTransaction", function () {
            it("should return the contract and the deployment transaction", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const publicClient = yield this.hre.viem.getPublicClient();
                    const { contract, deploymentTransaction } = yield this.hre.viem.sendDeploymentTransaction("WithoutConstructorArgs");
                    chai_1.assert.exists(contract);
                    chai_1.assert.exists(deploymentTransaction);
                    const { contractAddress } = yield publicClient.waitForTransactionReceipt({
                        hash: deploymentTransaction.hash,
                    });
                    chai_1.assert.equal(contract.address, (0, viem_1.getAddress)(contractAddress));
                    yield contract.write.setData([50n]);
                    const data = yield contract.read.getData();
                    chai_1.assert.equal(data, 50n);
                });
            });
        });
        it("should return the contract with linked libraries and the deployment transaction", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const publicClient = yield this.hre.viem.getPublicClient();
                const normalLib = yield this.hre.viem.sendDeploymentTransaction("NormalLib", []);
                const { contractAddress: libContractAddress } = yield publicClient.waitForTransactionReceipt({
                    hash: normalLib.deploymentTransaction.hash,
                });
                chai_1.assert.isNotNull(libContractAddress, "library contract should be deployed");
                const { contract, deploymentTransaction } = yield this.hre.viem.sendDeploymentTransaction("OnlyNormalLib", [], {
                    libraries: { NormalLib: libContractAddress },
                });
                chai_1.assert.exists(contract);
                chai_1.assert.exists(deploymentTransaction);
                const { contractAddress } = yield publicClient.waitForTransactionReceipt({
                    hash: deploymentTransaction.hash,
                });
                chai_1.assert.equal(contract.address, (0, viem_1.getAddress)(contractAddress));
                yield (0, chai_1.expect)(contract.read.getNumber([50n])).to.eventually.equal(100n);
            });
        });
    });
    describe("Contract type generation", function () {
        (0, helpers_1.useEnvironment)("type-generation");
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_COMPILE, { quiet: true });
            });
        });
        after(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run(task_names_1.TASK_CLEAN);
            });
        });
        it("should generate artifacts.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "artifacts.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "artifacts.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/A.sol/A.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "A.sol", "A.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "A.sol", "A.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/A.sol/B.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "A.sol", "B.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "A.sol", "B.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/A.sol/artifacts.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "A.sol", "artifacts.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "A.sol", "artifacts.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/C.sol/B.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "C.sol", "B.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "C.sol", "B.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/C.sol/C.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "C.sol", "C.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "C.sol", "C.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
        it("should generate contracts/C.sol/artifacts.d.ts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const snapshotPath = path_1.default.join("snapshots", "contracts", "C.sol", "artifacts.d.ts");
                const generatedFilePath = path_1.default.join("artifacts", "contracts", "C.sol", "artifacts.d.ts");
                yield (0, helpers_1.assertSnapshotMatch)(snapshotPath, generatedFilePath);
            });
        });
    });
});
