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
exports.PROCESSED_CACHE_DIRNAME = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const config_1 = require("hardhat/config");
const path_1 = __importDefault(require("path"));
require("./type-extensions");
exports.PROCESSED_CACHE_DIRNAME = "solpp-generated-contracts";
function getDefaultConfig(config) {
    return {
        defs: {},
        cwd: config.paths.sources,
        name: "hardhat-solpp",
        collapseEmptyLines: false,
        noPreprocessor: false,
        noFlatten: true,
        tolerant: false,
    };
}
function readFiles(filePaths) {
    return __awaiter(this, void 0, void 0, function* () {
        return Promise.all(filePaths.map((filePath) => fs_extra_1.default.readFile(filePath, "utf-8").then((content) => [filePath, content])));
    });
}
(0, config_1.extendConfig)((config) => {
    const defaultConfig = getDefaultConfig(config);
    config.solpp = Object.assign(Object.assign({}, defaultConfig), config.solpp);
});
(0, config_1.subtask)("hardhat-solpp:run-solpp", ({ files, opts }, { config }) => __awaiter(void 0, void 0, void 0, function* () {
    const processedPaths = [];
    const solpp = require("solpp");
    for (const [filePath, content] of files) {
        const processedFilePath = path_1.default.join(config.paths.cache, exports.PROCESSED_CACHE_DIRNAME, path_1.default.relative(config.paths.sources, filePath));
        yield fs_extra_1.default.ensureDir(path_1.default.dirname(processedFilePath));
        const processedCode = yield solpp.processCode(content, opts);
        yield fs_extra_1.default.writeFile(processedFilePath, processedCode, "utf-8");
        processedPaths.push(processedFilePath);
    }
    return processedPaths;
}));
(0, config_1.subtask)(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, (_, { config, run }, runSuper) => __awaiter(void 0, void 0, void 0, function* () {
    const filePaths = yield runSuper();
    const files = yield readFiles(filePaths);
    const opts = config.solpp;
    return run("hardhat-solpp:run-solpp", { files, opts });
}));
