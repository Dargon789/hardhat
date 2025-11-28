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
exports.TestChainHelper = exports.useFileIgnitionProject = exports.useEphemeralIgnitionProject = void 0;
const fs_extra_1 = require("fs-extra");
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
const clear_pending_transactions_from_memory_pool_1 = require("./clear-pending-transactions-from-memory-pool");
const test_ignition_helper_1 = require("./test-ignition-helper");
const wait_for_pending_txs_1 = require("./wait-for-pending-txs");
const defaultTestConfig = {
    maxFeeBumps: 5,
    timeBeforeBumpingFees: 3 * 60 * 1000,
    blockPollingInterval: 200,
    requiredConfirmations: 1,
    disableFeeBumping: false,
};
function useEphemeralIgnitionProject(fixtureProjectName) {
    beforeEach("Load environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.join(__dirname, "../fixture-projects", fixtureProjectName));
            const hre = require("hardhat");
            yield hre.network.provider.send("evm_setAutomine", [true]);
            yield hre.run("compile", { quiet: true });
            this.hre = hre;
            this.hre.originalIgnition = this.hre.ignition;
            this.hre.ignition = new test_ignition_helper_1.TestIgnitionHelper(hre);
            this.deploymentDir = undefined;
        });
    });
    afterEach("reset hardhat context", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
}
exports.useEphemeralIgnitionProject = useEphemeralIgnitionProject;
function useFileIgnitionProject(fixtureProjectName, deploymentId, config) {
    beforeEach("Load environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.join(__dirname, "../fixture-projects", fixtureProjectName));
            const hre = require("hardhat");
            const deploymentDir = path_1.default.join(path_1.default.resolve(__dirname, `../fixture-projects/${fixtureProjectName}/ignition`), "deployments", deploymentId);
            this.hre = hre;
            this.hre.ignition = new test_ignition_helper_1.TestIgnitionHelper(hre);
            this.deploymentDir = deploymentDir;
            yield hre.run("compile", { quiet: true });
            const testConfig = Object.assign(Object.assign({}, defaultTestConfig), config);
            this.config = testConfig;
            (0, fs_extra_1.ensureDirSync)(deploymentDir);
            this.runControlledDeploy = (ignitionModule, chainUpdates = () => __awaiter(this, void 0, void 0, function* () { })) => {
                return runDeploy(deploymentDir, ignitionModule, { hre, config: testConfig }, chainUpdates);
            };
        });
    });
    afterEach("reset hardhat context", function () {
        (0, plugins_testing_1.resetHardhatContext)();
        if (this.deploymentDir === undefined) {
            throw new Error("Deployment dir not set during cleanup of file based project");
        }
        (0, fs_extra_1.removeSync)(this.deploymentDir);
    });
}
exports.useFileIgnitionProject = useFileIgnitionProject;
function runDeploy(deploymentDir, ignitionModule, { hre, config = {}, }, chainUpdates = () => __awaiter(this, void 0, void 0, function* () { })) {
    return __awaiter(this, void 0, void 0, function* () {
        const { ignitionHelper: ignitionHelper, kill: killFn } = setupIgnitionHelperRiggedToThrow(hre, deploymentDir, config);
        try {
            const deployPromise = ignitionHelper.deploy(ignitionModule, {
                config,
            });
            const chainHelper = new TestChainHelper(hre, deployPromise, killFn);
            const [result] = yield Promise.all([
                deployPromise,
                chainUpdates(chainHelper),
            ]);
            return result;
        }
        catch (error) {
            if (error instanceof Error && error.message === "Killing deploy process") {
                return {};
            }
            throw error;
        }
    });
}
function setupIgnitionHelperRiggedToThrow(hre, deploymentDir, config = {}) {
    let trigger = false;
    const kill = () => {
        trigger = true;
    };
    const proxiedProvider = new Proxy(hre.network.provider, {
        get(target, key) {
            if (trigger) {
                trigger = false;
                throw new Error("Killing deploy process");
            }
            return target[key];
        },
    });
    const ignitionHelper = new test_ignition_helper_1.TestIgnitionHelper(hre, config, proxiedProvider, deploymentDir);
    return { ignitionHelper, kill };
}
class TestChainHelper {
    constructor(_hre, _deployPromise, _exitFn) {
        this._hre = _hre;
        this._deployPromise = _deployPromise;
        this._exitFn = _exitFn;
    }
    waitForPendingTxs(expectedCount) {
        return __awaiter(this, void 0, void 0, function* () {
            yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this._hre, expectedCount, this._deployPromise);
        });
    }
    /**
     * Mine the next block, optionally waiting for pending transactions to
     * build up before mining.
     *
     * @param pendingTxToAwait - the number of pending tx that should be in
     * the block before mining
     */
    mineBlock(pendingTxToAwait = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pendingTxToAwait > 0) {
                yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this._hre, pendingTxToAwait, this._deployPromise);
            }
            return this._hre.network.provider.send("evm_mine");
        });
    }
    clearMempool(pendingTxToAwait = 0) {
        return __awaiter(this, void 0, void 0, function* () {
            if (pendingTxToAwait > 0) {
                yield (0, wait_for_pending_txs_1.waitForPendingTxs)(this._hre, pendingTxToAwait, this._deployPromise);
            }
            return (0, clear_pending_transactions_from_memory_pool_1.clearPendingTransactionsFromMemoryPool)(this._hre);
        });
    }
    /**
     * Exit from the deploy on the next block tick.
     */
    exitDeploy() {
        this._exitFn();
    }
}
exports.TestChainHelper = TestChainHelper;
