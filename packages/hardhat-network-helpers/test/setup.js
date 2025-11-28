"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.INFURA_URL = void 0;
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
chai_1.default.use(chai_as_promised_1.default);
function getEnv(key) {
    const variable = process.env[key];
    if (variable === undefined || variable === "") {
        return undefined;
    }
    const trimmed = variable.trim();
    return trimmed.length === 0 ? undefined : trimmed;
}
exports.INFURA_URL = getEnv("INFURA_URL");
