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
exports.sleep = exports.assertSnapshotMatch = exports.useEnvironment = void 0;
const path_1 = __importDefault(require("path"));
const promises_1 = __importDefault(require("fs/promises"));
const chai_1 = require("chai");
const jest_diff_1 = require("jest-diff");
const plugins_testing_1 = require("hardhat/plugins-testing");
// Import this plugin type extensions for the HardhatRuntimeEnvironment
require("../src/internal/type-extensions");
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
const assertSnapshotMatch = (snapshotPath, generatedFilePath) => __awaiter(void 0, void 0, void 0, function* () {
    const expectedSnapshotContent = yield promises_1.default.readFile(snapshotPath, "utf-8");
    const generatedFileContent = yield promises_1.default.readFile(generatedFilePath, "utf-8");
    if (expectedSnapshotContent !== generatedFileContent) {
        chai_1.assert.fail(`
Generated file differs from the expected snapshot:

${generatedFilePath} should match ${snapshotPath}

To update the snapshot, run:
pnpm snapshots:update

${(0, jest_diff_1.diffLinesUnified)(expectedSnapshotContent.split("\n"), generatedFileContent.split("\n"), {
            contextLines: 3,
            expand: false,
            includeChangeCounts: true,
        })}`);
    }
});
exports.assertSnapshotMatch = assertSnapshotMatch;
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
exports.sleep = sleep;
