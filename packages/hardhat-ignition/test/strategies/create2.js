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
/* eslint-disable import/no-unused-modules */
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const createX_tx_1 = require("../test-helpers/createX-tx");
const externally_loaded_contract_1 = require("../test-helpers/externally-loaded-contract");
const mine_block_1 = require("../test-helpers/mine-block");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
const wait_for_pending_txs_1 = require("../test-helpers/wait-for-pending-txs");
describe("create2", function () {
    const example32ByteSalt = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const anotherExample32ByteSalt = "0xabcde67890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    const EXPECTED_FOO_CREATE2_ADDRESS = "0xA901a97D596320CC5b4E61f6B315F6128fAfF10B";
    const EXPECTED_BAR_CREATE2_ADDRESS = "0x5985C19bc6ba6f9b3f9350Ba6c8156c8A9876E1a";
    const EXPECTED_CUSTOM_SALT_FOO_CREATE2_ADDRESS = "0x2FbECc7173383C5878FF8EC336da0775CbF77fF7";
    const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
        // Use a known bytecode to ensure the same address is generated
        // via create2
        const foo = m.contract("Foo", externally_loaded_contract_1.externallyLoadedContractArtifact);
        return { foo };
    });
    describe("non-hardhat network", function () {
        describe("preexisting createX contract", function () {
            (0, use_ignition_project_1.useEphemeralIgnitionProject)("create2-exists-chain");
            beforeEach(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield deployCreateXFactory(this.hre);
                });
            });
            [
                "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
                "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
                "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
            ].forEach((accountAddress) => {
                it(`should deploy a contract from account <${accountAddress}> using the createX factory to the expected address`, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                            strategy: "create2",
                            defaultSender: accountAddress,
                            strategyConfig: {
                                salt: example32ByteSalt,
                            },
                        });
                        yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                        yield (0, mine_block_1.mineBlock)(this.hre);
                        const result = yield deployPromise;
                        chai_1.assert.equal(result.foo.address, EXPECTED_FOO_CREATE2_ADDRESS);
                        chai_1.assert.equal(this.hre.network.config.chainId, 1);
                        chai_1.assert.equal(yield result.foo.read.x(), Number(1));
                    });
                });
            });
            it(`should support endowing eth to the deployed contract`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const deployPromise = this.hre.ignition.deploy((0, ignition_core_1.buildModule)("ValueModule", (m) => {
                        const foo = m.contract("Foo", [], {
                            value: 1000000000n,
                        });
                        return { foo };
                    }), {
                        strategy: "create2",
                        strategyConfig: {
                            salt: example32ByteSalt,
                        },
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    const balance = yield this.hre.network.provider.request({
                        method: "eth_getBalance",
                        params: [result.foo.address, "latest"],
                    });
                    chai_1.assert.equal(balance, 1000000000n);
                });
            });
            it(`should throw if you attempt to endow when the constructor isn't payable`, function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield chai_1.assert.isRejected(this.hre.ignition.deploy((0, ignition_core_1.buildModule)("ValueModule", (m) => {
                        const foo = m.contract("Unpayable", [], {
                            value: 1000000000n,
                        });
                        return { foo };
                    }), {
                        strategy: "create2",
                        strategyConfig: {
                            salt: example32ByteSalt,
                        },
                    }), /Simulating the transaction failed with error: Reverted with custom error FailedContractCreation/);
                });
            });
            it("should deploy with a custom salt", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                        strategy: "create2",
                        strategyConfig: {
                            salt: anotherExample32ByteSalt,
                        },
                    });
                    yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                    yield (0, mine_block_1.mineBlock)(this.hre);
                    const result = yield deployPromise;
                    chai_1.assert.equal(result.foo.address, EXPECTED_CUSTOM_SALT_FOO_CREATE2_ADDRESS);
                    chai_1.assert.equal(this.hre.network.config.chainId, 1);
                    chai_1.assert.equal(yield result.foo.read.x(), Number(1));
                });
            });
        });
        describe("no preexisting createX contract", function () {
            (0, use_ignition_project_1.useEphemeralIgnitionProject)("create2-not-exists-chain");
            it("should throw when no createX contract exists on the network", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.equal(this.hre.network.config.chainId, 88888);
                    yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition, {
                        strategy: "create2",
                        strategyConfig: {
                            salt: example32ByteSalt,
                        },
                    }), /CreateX not deployed on current network 88888/);
                });
            });
        });
    });
    describe("hardhat network", function () {
        (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
        it("should deploy a createX factory then use it to deploy the given contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const deployPromise = this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: example32ByteSalt,
                    },
                });
                yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, deployPromise);
                yield (0, mine_block_1.mineBlock)(this.hre);
                const result = yield deployPromise;
                chai_1.assert.equal(result.foo.address, EXPECTED_FOO_CREATE2_ADDRESS);
                chai_1.assert.equal(this.hre.network.config.chainId, 31337);
                chai_1.assert.equal(yield result.foo.read.x(), Number(1));
            });
        });
        it("should use an existing createX factory to deploy the given contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // Run create2 once deploying the factory
                const firstDeployPromise = this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: example32ByteSalt,
                    },
                });
                yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, firstDeployPromise);
                yield (0, mine_block_1.mineBlock)(this.hre);
                yield firstDeployPromise;
                // Run a second deploy, this time leveraging the existing create2 factory
                const secondDeployPromise = this.hre.ignition.deploy((0, ignition_core_1.buildModule)("Second", (m) => {
                    const bar = m.contract("Bar");
                    return { bar };
                }), {
                    strategy: "create2",
                    strategyConfig: {
                        salt: example32ByteSalt,
                    },
                });
                yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this.hre, 1, secondDeployPromise);
                yield (0, mine_block_1.mineBlock)(this.hre);
                const secondDeployResult = yield secondDeployPromise;
                chai_1.assert.equal(secondDeployResult.bar.address, EXPECTED_BAR_CREATE2_ADDRESS);
                (0, chai_1.assert)(yield secondDeployResult.bar.read.isBar());
            });
        });
    });
    describe("config", function () {
        (0, use_ignition_project_1.useFileIgnitionProject)("create2-bad-config", "attempt-bad-config");
        it("should throw if salt is not defined in Hardhat config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({ scope: "ignition", task: "deploy" }, {
                    modulePath: "./ignition/modules/MyModule.js",
                    strategy: "create2",
                }), /IGN1102: Missing required strategy configuration parameter 'salt' for the strategy 'create2'/);
            });
        });
    });
});
function deployCreateXFactory(hre) {
    return __awaiter(this, void 0, void 0, function* () {
        yield hre.network.provider.request({
            method: "hardhat_setBalance",
            params: ["0xeD456e05CaAb11d66C4c797dD6c1D6f9A7F352b5", "0x58D15E176280000"],
        });
        yield hre.network.provider.request({
            method: "eth_sendRawTransaction",
            params: [createX_tx_1.presignedTx],
        });
    });
}
