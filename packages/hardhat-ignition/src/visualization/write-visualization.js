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
exports.writeVisualization = void 0;
const fs_extra_1 = require("fs-extra");
const plugins_1 = require("hardhat/plugins");
const path_1 = __importDefault(require("path"));
function writeVisualization(visualizationPayload, { cacheDir }) {
    return __awaiter(this, void 0, void 0, function* () {
        const templateDir = path_1.default.join(require.resolve("@nomicfoundation/ignition-ui/package.json"), "../dist");
        const templateDirExists = yield (0, fs_extra_1.pathExists)(templateDir);
        if (!templateDirExists) {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomicfouncation/hardhat-ignition", `Unable to find template directory: ${templateDir}`);
        }
        const visualizationDir = path_1.default.join(cacheDir, "visualization");
        yield (0, fs_extra_1.ensureDir)(visualizationDir);
        const indexHtml = yield (0, fs_extra_1.readFile)(path_1.default.join(templateDir, "index.html"));
        const updatedHtml = indexHtml
            .toString()
            .replace('{ "unloaded": true }', JSON.stringify(visualizationPayload));
        yield (0, fs_extra_1.writeFile)(path_1.default.join(visualizationDir, "index.html"), updatedHtml);
    });
}
exports.writeVisualization = writeVisualization;
