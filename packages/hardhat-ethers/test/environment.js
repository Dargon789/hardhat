"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useGeneratedEnvironment = exports.usePersistentEnvironment = exports.useEnvironment = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const fs_1 = __importDefault(require("fs"));
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
// Import this plugin type extensions for the HardhatRuntimeEnvironment
require("../src/internal/type-extensions");
/**
 * Start a new Hardhat environment for each test
 */
function useEnvironment(fixtureProjectName, networkName = "hardhat") {
    const fixtureProjectPath = path_1.default.resolve(__dirname, "fixture-projects", fixtureProjectName);
    beforeEach("Loading hardhat environment", function () {
        process.chdir(fixtureProjectPath);
        process.env.HARDHAT_NETWORK = networkName;
        this.env = require("hardhat");
    });
    afterEach("Resetting hardhat", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
    afterEach(function () {
        var _a;
        if (((_a = this.currentTest) === null || _a === void 0 ? void 0 : _a.state) === "failed") {
            console.log(picocolors_1.default.red("Failed in fixture project"), picocolors_1.default.red(fixtureProjectPath));
        }
    });
}
exports.useEnvironment = useEnvironment;
/**
 * Like useEnvironment, but re-use the environment for the whole suite
 */
function usePersistentEnvironment(fixtureProjectName, networkName = "hardhat") {
    const fixtureProjectPath = path_1.default.resolve(__dirname, "fixture-projects", fixtureProjectName);
    before("Loading hardhat environment", function () {
        process.chdir(fixtureProjectPath);
        process.env.HARDHAT_NETWORK = networkName;
        this.env = require("hardhat");
    });
    after("Resetting hardhat", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
    afterEach(function () {
        var _a;
        if (((_a = this.currentTest) === null || _a === void 0 ? void 0 : _a.state) === "failed") {
            console.log(picocolors_1.default.red("Failed in fixture project"), picocolors_1.default.red(fixtureProjectPath));
        }
    });
}
exports.usePersistentEnvironment = usePersistentEnvironment;
/**
 * Generate a fixture project on runtime with the given parameters,
 * and start a persistent environment in that project.
 */
function useGeneratedEnvironment(hardhatGasLimit, localhostGasLimit, networkName) {
    const fixtureProjectPath = path_1.default.resolve(__dirname, "fixture-projects", "generated-fixtures", `hardhat-gas-${hardhatGasLimit}-localhost-gas-${localhostGasLimit}`);
    before("Loading hardhat environment", function () {
        // remove the directory if it exists and create an empty one
        try {
            fs_1.default.unlinkSync(fixtureProjectPath);
        }
        catch (_a) { }
        fs_1.default.mkdirSync(fixtureProjectPath, { recursive: true });
        // generate and write the hardhat config
        const hardhatConfigPath = path_1.default.resolve(fixtureProjectPath, "hardhat.config.js");
        const hardhatConfig = {
            solidity: "0.8.19",
            networks: {
                hardhat: {},
                localhost: {},
            },
        };
        if (hardhatGasLimit !== "default") {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            hardhatConfig.networks.hardhat.gas = hardhatGasLimit;
        }
        if (localhostGasLimit !== "default") {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            hardhatConfig.networks.localhost.gas = localhostGasLimit;
        }
        fs_1.default.writeFileSync(hardhatConfigPath, `
require("../../../../src/internal/index");

module.exports = ${JSON.stringify(hardhatConfig, null, 2)}
`);
        // generate and write the contracts
        fs_1.default.mkdirSync(path_1.default.resolve(fixtureProjectPath, "contracts"), {
            recursive: true,
        });
        fs_1.default.writeFileSync(path_1.default.resolve(fixtureProjectPath, "contracts", "Example.sol"), `
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Example {
  function f() public {}
}
`);
        // start the environment
        process.chdir(fixtureProjectPath);
        process.env.HARDHAT_NETWORK = networkName;
        this.env = require("hardhat");
    });
    after("Resetting hardhat", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
    afterEach(function () {
        var _a;
        if (((_a = this.currentTest) === null || _a === void 0 ? void 0 : _a.state) === "failed") {
            console.log(picocolors_1.default.red("Failed in fixture project"), picocolors_1.default.red(fixtureProjectPath));
        }
    });
}
exports.useGeneratedEnvironment = useGeneratedEnvironment;
