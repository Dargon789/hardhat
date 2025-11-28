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
const config_1 = require("hardhat/config");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const picocolors_1 = __importDefault(require("picocolors"));
const foundry_1 = require("./foundry");
const TASK_INIT_FOUNDRY = "init-foundry";
let pluginActivated = false;
(0, config_1.extendConfig)((config, userConfig) => {
    var _a;
    // Check foundry.toml presence. Don't warn when running foundry initialization task
    if (!(0, fs_1.existsSync)(path_1.default.join(config.paths.root, "foundry.toml"))) {
        if (!process.argv.includes(TASK_INIT_FOUNDRY)) {
            console.log(picocolors_1.default.yellow(`Warning: You are using the hardhat-foundry plugin but there isn't a foundry.toml file in your project. Run 'npx hardhat ${TASK_INIT_FOUNDRY}' to create one.`));
        }
        return;
    }
    // Load foundry config
    const foundryConfig = (0, foundry_1.getForgeConfig)();
    // Ensure required keys exist
    if ((foundryConfig === null || foundryConfig === void 0 ? void 0 : foundryConfig.src) === undefined ||
        (foundryConfig === null || foundryConfig === void 0 ? void 0 : foundryConfig.cache_path) === undefined) {
        throw new foundry_1.HardhatFoundryError("Couldn't find `src` or `cache_path` config keys after running `forge config --json`");
    }
    // Ensure foundry src path doesnt mismatch user-configured path
    const userSourcesPath = (_a = userConfig.paths) === null || _a === void 0 ? void 0 : _a.sources;
    const foundrySourcesPath = foundryConfig.src;
    if (userSourcesPath !== undefined &&
        path_1.default.resolve(userSourcesPath) !== path_1.default.resolve(foundrySourcesPath)) {
        throw new foundry_1.HardhatFoundryError(`User-configured sources path (${userSourcesPath}) doesn't match path configured in foundry (${foundrySourcesPath})`);
    }
    // Set sources path
    config.paths.sources = path_1.default.resolve(config.paths.root, foundrySourcesPath);
    // Change hardhat's cache path if it clashes with foundry's
    const foundryCachePath = path_1.default.resolve(config.paths.root, foundryConfig.cache_path);
    if (config.paths.cache === foundryCachePath) {
        config.paths.cache = "cache_hardhat";
    }
    pluginActivated = true;
});
// This task is in place to detect old hardhat-core versions
(0, config_1.internalTask)(task_names_1.TASK_COMPILE_TRANSFORM_IMPORT_NAME).setAction(({ importName, deprecationCheck, }, _hre) => __awaiter(void 0, void 0, void 0, function* () {
    // When the deprecationCheck param is passed, it means a new enough hardhat-core is being used
    if (deprecationCheck) {
        return importName;
    }
    throw new foundry_1.HardhatFoundryError("This version of hardhat-foundry depends on hardhat version >= 2.17.2");
}));
(0, config_1.internalTask)(task_names_1.TASK_COMPILE_GET_REMAPPINGS).setAction(() => __awaiter(void 0, void 0, void 0, function* () {
    if (!pluginActivated) {
        return {};
    }
    return (0, foundry_1.getRemappings)();
}));
(0, config_1.task)(TASK_INIT_FOUNDRY, "Initialize foundry setup in current hardhat project", (_, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const foundryConfigPath = path_1.default.resolve(hre.config.paths.root, "foundry.toml");
    if ((0, fs_1.existsSync)(foundryConfigPath)) {
        console.warn(picocolors_1.default.yellow(`File foundry.toml already exists. Aborting.`));
        process.exit(1);
    }
    console.log(`Creating foundry.toml file...`);
    (0, fs_1.writeFileSync)(foundryConfigPath, [
        `[profile.default]`,
        `src = '${path_1.default.relative(hre.config.paths.root, hre.config.paths.sources)}'`,
        `out = 'out'`,
        `libs = ['node_modules', 'lib']`,
        `test = '${path_1.default.relative(hre.config.paths.root, hre.config.paths.tests)}'`,
        `cache_path  = 'cache_forge'`,
    ].join("\n"));
    yield (0, foundry_1.installDependency)("foundry-rs/forge-std");
}));
