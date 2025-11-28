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
exports.readDeploymentParameters = void 0;
const fs_extra_1 = require("fs-extra");
const plugins_1 = require("hardhat/plugins");
const json5_1 = require("json5");
const bigintReviver_1 = require("./bigintReviver");
function readDeploymentParameters(filepath) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const rawFile = yield (0, fs_extra_1.readFile)(filepath);
            return yield (0, json5_1.parse)(rawFile.toString(), bigintReviver_1.bigintReviver);
        }
        catch (e) {
            if (e instanceof plugins_1.NomicLabsHardhatPluginError) {
                throw e;
            }
            if (e instanceof Error) {
                throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", `Could not parse parameters from ${filepath}`, e);
            }
            throw e;
        }
    });
}
exports.readDeploymentParameters = readDeploymentParameters;
