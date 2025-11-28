"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rpcQuantityToNumber = exports.useEnvironment = void 0;
const ethereumjs_util_1 = require("ethereumjs-util");
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
function useEnvironment(fixtureProjectName, networkName = "hardhat") {
    beforeEach("Loading hardhat environment", function () {
        process.chdir(path_1.default.join(__dirname, "fixture-projects", fixtureProjectName));
        process.env.HARDHAT_NETWORK = networkName;
        this.hre = require("hardhat");
    });
    afterEach("Resetting hardhat", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
}
exports.useEnvironment = useEnvironment;
function rpcQuantityToNumber(quantity) {
    const buffer = (0, ethereumjs_util_1.toBuffer)(quantity);
    return new ethereumjs_util_1.BN(buffer).toNumber();
}
exports.rpcQuantityToNumber = rpcQuantityToNumber;
