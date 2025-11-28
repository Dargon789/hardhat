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
exports.getRandomAddress = exports.deployContract = exports.useEnvironment = void 0;
const path_1 = __importDefault(require("path"));
const debug_1 = __importDefault(require("debug"));
const plugins_testing_1 = require("hardhat/plugins-testing");
const log = (0, debug_1.default)("hardhat:hardhat-verify:tests");
const useEnvironment = (fixtureProjectName) => {
    before("Loading hardhat environment", function () {
        process.chdir(path_1.default.join(__dirname, "fixture-projects", fixtureProjectName));
        process.env.HARDHAT_NETWORK = "hardhat";
        this.hre = require("hardhat");
    });
    after("Resetting hardhat context", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.resolve(`${__dirname}/..`));
            (0, plugins_testing_1.resetHardhatContext)();
            delete process.env.HARDHAT_NETWORK;
        });
    });
};
exports.useEnvironment = useEnvironment;
const deployContract = (contractName, constructorArguments, { ethers }, confirmations = 1, options = {}) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const factory = yield ethers.getContractFactory(contractName, options);
    const contract = yield factory.deploy(...constructorArguments);
    yield ((_a = contract.deploymentTransaction()) === null || _a === void 0 ? void 0 : _a.wait(confirmations));
    const contractAddress = yield contract.getAddress();
    log(`Deployed ${contractName} at ${contractAddress}`);
    return contractAddress;
});
exports.deployContract = deployContract;
const getRandomAddress = (hre) => hre.ethers.Wallet.createRandom().address;
exports.getRandomAddress = getRandomAddress;
