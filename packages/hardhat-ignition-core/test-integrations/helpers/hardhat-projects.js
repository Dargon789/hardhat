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
exports.useHardhatProject = void 0;
const plugins_testing_1 = require("hardhat/plugins-testing");
function useHardhatProject(fixtureProjectName) {
    const previousCwd = process.cwd();
    before("Loading Hardhat Runtime Environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(`${__dirname}/../fixture-projects/${fixtureProjectName}`);
            this.hre = require("hardhat");
        });
    });
    before("Compiling contracts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.run("compile", { quiet: true });
        });
    });
    before("Fetching accounts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.accounts = (yield this.hre.network.provider.request({
                method: "eth_accounts",
            }));
        });
    });
    let snapshotId;
    before("Taking initial snapshot", function () {
        return __awaiter(this, void 0, void 0, function* () {
            snapshotId = (yield this.hre.network.provider.send("evm_snapshot"));
        });
    });
    beforeEach("Revert to snapshot", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.hre.network.provider.send("evm_revert", [snapshotId]);
            snapshotId = (yield this.hre.network.provider.send("evm_snapshot"));
            // Automining is not including in snapshots
            yield this.hre.network.provider.send("evm_setAutomine", [true]);
        });
    });
    after("Resetting Hardhat's context and CWD and deleting context fields", function () {
        process.chdir(previousCwd);
        (0, plugins_testing_1.resetHardhatContext)();
        delete this.hre;
        delete this.accounts;
    });
}
exports.useHardhatProject = useHardhatProject;
