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
const fs_1 = __importDefault(require("fs"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const plugins_testing_1 = require("hardhat/plugins-testing");
const snapshotPartialPaths = [
    "artifacts.d.ts",
    path_1.default.join("contracts", "A.sol", "A.d.ts"),
    path_1.default.join("contracts", "A.sol", "B.d.ts"),
    path_1.default.join("contracts", "A.sol", "artifacts.d.ts"),
    path_1.default.join("contracts", "C.sol", "B.d.ts"),
    path_1.default.join("contracts", "C.sol", "C.d.ts"),
    path_1.default.join("contracts", "C.sol", "artifacts.d.ts"),
];
const originalCwd = process.cwd();
function updateSnapshots() {
    return __awaiter(this, void 0, void 0, function* () {
        process.chdir(path_1.default.join(__dirname, "fixture-projects", "type-generation"));
        process.env.HARDHAT_NETWORK = "hardhat";
        const hre = require("hardhat");
        yield hre.run(task_names_1.TASK_COMPILE, { quiet: true });
        snapshotPartialPaths.forEach((partialPath) => {
            const snapshotPath = path_1.default.join(process.cwd(), "snapshots", partialPath);
            const generatedFilePath = path_1.default.join(process.cwd(), "artifacts", partialPath);
            fs_1.default.copyFileSync(generatedFilePath, snapshotPath);
        });
        yield hre.run(task_names_1.TASK_CLEAN);
        process.chdir(path_1.default.resolve(`${__dirname}/..`));
        (0, plugins_testing_1.resetHardhatContext)();
        delete process.env.HARDHAT_NETWORK;
        console.log("Snapshots updated!");
    });
}
updateSnapshots()
    .catch((error) => {
    console.error(error);
    process.exitCode = 1;
})
    .finally(() => {
    process.chdir(originalCwd);
});
