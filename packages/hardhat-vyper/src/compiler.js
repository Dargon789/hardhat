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
exports.Compiler = void 0;
const child_process_1 = require("child_process");
const semver_1 = __importDefault(require("semver"));
const util_1 = require("./util");
class Compiler {
    constructor(_pathToVyper) {
        this._pathToVyper = _pathToVyper;
    }
    /**
     *
     * @param inputPaths array of paths to contracts to be compiled
     * @param compilerVersion the version of the Vyper compiler
     * @param settings the Vyper settings to use during compilation
     */
    compile(inputPaths, compilerVersion = "", settings = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const output = yield new Promise((resolve, reject) => {
                const settingsCmd = getSettingsCmd(compilerVersion, settings);
                const process = (0, child_process_1.exec)(`${this._pathToVyper} ${settingsCmd} -f combined_json ${inputPaths.join(" ")}`, {
                    maxBuffer: 1024 * 1024 * 500,
                }, (err, stdout) => {
                    if (err !== null) {
                        return reject(err);
                    }
                    resolve(stdout);
                });
                process.stdin.end();
            });
            return JSON.parse(output);
        });
    }
}
exports.Compiler = Compiler;
function getSettingsCmd(compilerVersion, settings) {
    let settingsStr = settings.evmVersion !== undefined
        ? `--evm-version ${settings.evmVersion} `
        : "";
    settingsStr += getOptimize(compilerVersion, settings.optimize);
    return settingsStr;
}
function getOptimize(compilerVersion, optimize) {
    if (optimize === undefined) {
        return "";
    }
    if (compilerVersion === "") {
        throw new util_1.VyperPluginError("The 'compilerVersion' parameter must be set when the setting 'optimize' is set.");
    }
    if (typeof optimize === "boolean") {
        if (optimize) {
            if (semver_1.default.gte(compilerVersion, "0.3.10") ||
                semver_1.default.lte(compilerVersion, "0.3.0")) {
                throw new util_1.VyperPluginError(`The 'optimize' setting with value 'true' is not supported for versions of the Vyper compiler older than or equal to 0.3.0 or newer than or equal to 0.3.10. You are currently using version ${compilerVersion}.`);
            }
            // The optimizer is enabled by default
            return "";
        }
        else {
            if (semver_1.default.lte(compilerVersion, "0.3.0")) {
                throw new util_1.VyperPluginError(`The 'optimize' setting with value 'false' is not supported for versions of the Vyper compiler older than or equal to 0.3.0. You are currently using version ${compilerVersion}.`);
            }
            return semver_1.default.lt(compilerVersion, "0.3.10")
                ? "--no-optimize"
                : "--optimize none";
        }
    }
    if (typeof optimize === "string") {
        if (semver_1.default.gte(compilerVersion, "0.3.10")) {
            return `--optimize ${optimize}`;
        }
        throw new util_1.VyperPluginError(`The 'optimize' setting, when specified as a string value, is available only starting from the Vyper compiler version 0.3.10. You are currently using version ${compilerVersion}.`);
    }
    throw new util_1.VyperPluginError(`The 'optimize' setting has an invalid type value: ${typeof optimize}. Type should be either string or boolean.`);
}
