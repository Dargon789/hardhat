"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALCHEMY_URL = exports.INFURA_URL = void 0;
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const picocolors_1 = __importDefault(require("picocolors"));
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
exports.ALCHEMY_URL = getEnv("ALCHEMY_URL");
function printForkingLogicNotBeingTestedWarning(varName) {
  console.warn(
    picocolors_1.default.yellow(
      `TEST RUN INCOMPLETE: You need to define the env variable ${varName}`
    )
  );
}
if (exports.INFURA_URL === undefined) {
  printForkingLogicNotBeingTestedWarning("INFURA_URL");
}
if (exports.ALCHEMY_URL === undefined) {
  printForkingLogicNotBeingTestedWarning("ALCHEMY_URL");
}
