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
exports.installDependency = exports.getRemappings = exports.parseRemappings = exports.getForgeConfig = exports.HardhatFoundryError = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const child_process_1 = require("child_process");
const errors_1 = require("hardhat/internal/core/errors");
const util_1 = require("util");
const exec = (0, util_1.promisify)(child_process_1.exec);
let cachedRemappings;
class HardhatFoundryError extends errors_1.NomicLabsHardhatPluginError {
    constructor(message, parent) {
        super("hardhat-foundry", message, parent);
    }
}
exports.HardhatFoundryError = HardhatFoundryError;
class ForgeInstallError extends HardhatFoundryError {
    constructor(dependency, parent) {
        super(`Couldn't install '${dependency}', please install it manually.

${parent.message}
`, parent);
    }
}
function getForgeConfig() {
    return JSON.parse(runCmdSync("forge config --json"));
}
exports.getForgeConfig = getForgeConfig;
function parseRemappings(remappingsTxt) {
    const remappings = {};
    const remappingLines = remappingsTxt.split(/\r\n|\r|\n/);
    for (const remappingLine of remappingLines) {
        if (remappingLine.trim() === "") {
            continue;
        }
        if (remappingLine.includes(":")) {
            throw new HardhatFoundryError(`Invalid remapping '${remappingLine}', remapping contexts are not allowed`);
        }
        if (!remappingLine.includes("=")) {
            throw new HardhatFoundryError(`Invalid remapping '${remappingLine}', remappings without a target are not allowed`);
        }
        const fromTo = remappingLine.split("=");
        // if the remapping already exists, we ignore it because the first one wins
        if (remappings[fromTo[0]] !== undefined) {
            continue;
        }
        remappings[fromTo[0]] = fromTo[1];
    }
    return remappings;
}
exports.parseRemappings = parseRemappings;
function getRemappings() {
    return __awaiter(this, void 0, void 0, function* () {
        // Get remappings only once
        if (cachedRemappings === undefined) {
            cachedRemappings = runCmd("forge remappings").then(parseRemappings);
        }
        return cachedRemappings;
    });
}
exports.getRemappings = getRemappings;
function installDependency(dependency) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmd = `forge install --no-commit ${dependency}`;
        console.log(`Running '${picocolors_1.default.blue(cmd)}'`);
        try {
            yield exec(cmd);
        }
        catch (error) {
            throw new ForgeInstallError(dependency, error);
        }
    });
}
exports.installDependency = installDependency;
function runCmdSync(cmd) {
    try {
        return (0, child_process_1.execSync)(cmd, { stdio: "pipe" }).toString();
    }
    catch (error) {
        const pluginError = buildForgeExecutionError(error.status, error.stderr.toString());
        throw pluginError;
    }
}
function runCmd(cmd) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { stdout } = yield exec(cmd);
            return stdout;
        }
        catch (error) {
            throw buildForgeExecutionError(error.code, error.message);
        }
    });
}
function buildForgeExecutionError(exitCode, message) {
    switch (exitCode) {
        case 127:
            return new HardhatFoundryError("Couldn't run `forge`. Please check that your foundry installation is correct.");
        case 134:
            return new HardhatFoundryError("Running `forge` failed. Please check that your foundry.toml file is correct.");
        default:
            return new HardhatFoundryError(`Unexpected error while running \`forge\`: ${message}`);
    }
}
