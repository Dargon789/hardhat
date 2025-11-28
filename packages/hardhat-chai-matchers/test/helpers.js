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
exports.mineRevertedTransaction = exports.mineSuccessfulTransaction = exports.runFailedAsserts = exports.runSuccessfulAsserts = exports.useEnvironmentWithNode = exports.useEnvironment = void 0;
const chai_1 = require("chai");
const child_process_1 = require("child_process");
const get_port_1 = __importDefault(require("get-port"));
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
// we assume that all the fixture projects use the hardhat-ethers plugin
require("@nomicfoundation/hardhat-ethers/internal/type-extensions");
/**
 * Starts a HRE with the in-process hardhat network.
 */
function useEnvironment(fixtureProjectName) {
    before("start hardhat in-process", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.resolve(__dirname, "fixture-projects", fixtureProjectName));
            process.env.HARDHAT_NETWORK = "hardhat";
            this.hre = require("hardhat");
            yield this.hre.run("compile", { quiet: true });
        });
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            (0, plugins_testing_1.resetHardhatContext)();
            delete process.env.HARDHAT_NETWORK;
        });
    });
}
exports.useEnvironment = useEnvironment;
/**
 * Start a Hardhat node in a separate process, and then in this process starts a
 * HRE connected via http to that node.
 */
function useEnvironmentWithNode(fixtureProjectName) {
    const fixtureProjectDir = path_1.default.resolve(__dirname, "fixture-projects", fixtureProjectName);
    // we start a shared node in a `before` hook to make tests run faster
    before("start a hardhat node", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(fixtureProjectDir);
            // this env var will be used both by the script that starts the hh node and
            // by the configuration of the 'localhost' network in the fixture project
            process.env.HARDHAT_NODE_PORT = String(yield (0, get_port_1.default)());
            this.hhNodeProcess = (0, child_process_1.fork)(path_1.default.resolve(fixtureProjectDir, "start-node.js"), {
                cwd: fixtureProjectDir,
                // pipe stdout so we can check when the node it's ready
                stdio: "pipe",
            });
            // start hardhat connected to the node
            process.env.HARDHAT_NETWORK = "localhost";
            this.hre = require("hardhat");
            yield this.hre.run("compile", { quiet: true });
            // wait until the node is ready
            return new Promise((resolve) => {
                this.hhNodeProcess.stdout.on("data", (data) => {
                    const nodeStarted = data
                        .toString()
                        .includes("Started HTTP and WebSocket JSON-RPC server at");
                    if (Boolean(nodeStarted)) {
                        resolve();
                    }
                });
            });
        });
    });
    after(function () {
        return __awaiter(this, void 0, void 0, function* () {
            (0, plugins_testing_1.resetHardhatContext)();
            delete process.env.HARDHAT_NETWORK;
            delete process.env.HARDHAT_NODE_PORT;
            this.hhNodeProcess.kill();
            return new Promise((resolve) => {
                this.hhNodeProcess.on("exit", resolve);
            });
        });
    });
}
exports.useEnvironmentWithNode = useEnvironmentWithNode;
/**
 * Call `method` as:
 *   - A write transaction
 *   - A view method
 *   - A gas estimation
 *   - A static call
 * And run the `successfulAssert` function with the result of each of these
 * calls. Since we expect this assertion to be successful, we just await its
 * result; if any of them fails, an error will be thrown.
 */
function runSuccessfulAsserts({ matchers, method, args = [], successfulAssert, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield successfulAssert(matchers[method](...args));
        yield successfulAssert(matchers[`${method}View`](...args));
        yield successfulAssert(matchers[method].estimateGas(...args));
        yield successfulAssert(matchers[method].staticCall(...args));
    });
}
exports.runSuccessfulAsserts = runSuccessfulAsserts;
/**
 * Similar to runSuccessfulAsserts, but check that the result of the assertion
 * is an AssertionError with the given reason.
 */
function runFailedAsserts({ matchers, method, args = [], failedAssert, failedAssertReason, }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, chai_1.expect)(failedAssert(matchers[method](...args))).to.be.rejectedWith(chai_1.AssertionError, failedAssertReason);
        yield (0, chai_1.expect)(failedAssert(matchers[`${method}View`](...args))).to.be.rejectedWith(chai_1.AssertionError, failedAssertReason);
        yield (0, chai_1.expect)(failedAssert(matchers[method].estimateGas(...args))).to.be.rejectedWith(chai_1.AssertionError, failedAssertReason);
        yield (0, chai_1.expect)(failedAssert(matchers[method].staticCall(...args))).to.be.rejectedWith(chai_1.AssertionError, failedAssertReason);
    });
}
exports.runFailedAsserts = runFailedAsserts;
function mineSuccessfulTransaction(hre) {
    return __awaiter(this, void 0, void 0, function* () {
        yield hre.network.provider.send("evm_setAutomine", [false]);
        const [signer] = yield hre.ethers.getSigners();
        const tx = yield signer.sendTransaction({ to: signer.address });
        yield mineBlocksUntilTxIsIncluded(hre, tx.hash);
        yield hre.network.provider.send("evm_setAutomine", [true]);
        return tx;
    });
}
exports.mineSuccessfulTransaction = mineSuccessfulTransaction;
function mineRevertedTransaction(hre, matchers) {
    return __awaiter(this, void 0, void 0, function* () {
        yield hre.network.provider.send("evm_setAutomine", [false]);
        const tx = yield matchers.revertsWithoutReason({
            gasLimit: 1000000,
        });
        yield mineBlocksUntilTxIsIncluded(hre, tx.hash);
        yield hre.network.provider.send("evm_setAutomine", [true]);
        return tx;
    });
}
exports.mineRevertedTransaction = mineRevertedTransaction;
function mineBlocksUntilTxIsIncluded(hre, txHash) {
    return __awaiter(this, void 0, void 0, function* () {
        let i = 0;
        while (true) {
            const receipt = yield hre.ethers.provider.getTransactionReceipt(txHash);
            if (receipt !== null) {
                return;
            }
            yield hre.network.provider.send("hardhat_mine", []);
            i++;
            if (i > 100) {
                throw new Error(`Transaction was not mined after mining ${i} blocks`);
            }
        }
    });
}
