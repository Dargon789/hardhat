"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateDeployingModulePanel = void 0;
const chalk_1 = __importDefault(require("chalk"));
const cwd_relative_path_1 = require("./cwd-relative-path");
function calculateDeployingModulePanel(state) {
    var _a;
    let deployingMessage = `Hardhat Ignition 🚀

`;
    if (state.isResumed === true) {
        deployingMessage += `${chalk_1.default.bold(`Resuming existing deployment from ${(0, cwd_relative_path_1.pathFromCwd)(state.deploymentDir)}`)}

`;
    }
    deployingMessage += `${chalk_1.default.bold(`Deploying [ ${(_a = state.moduleName) !== null && _a !== void 0 ? _a : "unknown"} ]${_calculateStrategySuffix(state)}`)}
`;
    if (state.warnings.length > 0) {
        deployingMessage += `\n${chalk_1.default.yellow("Warning - previously executed futures are not in the module:")}\n`;
        deployingMessage += state.warnings
            .map((futureId) => chalk_1.default.yellow(` - ${futureId}`))
            .join("\n");
        deployingMessage += "\n";
    }
    return deployingMessage;
}
exports.calculateDeployingModulePanel = calculateDeployingModulePanel;
function _calculateStrategySuffix(state) {
    var _a;
    if (state.strategy === "basic") {
        return "";
    }
    return ` with strategy ${(_a = state.strategy) !== null && _a !== void 0 ? _a : "unknown"}`;
}
