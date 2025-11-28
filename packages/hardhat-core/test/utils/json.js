"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertValidJson = void 0;
const chai_1 = require("chai");
const fs_1 = __importDefault(require("fs"));
function assertValidJson(pathToJson) {
  const content = fs_1.default.readFileSync(pathToJson).toString();
  try {
    JSON.parse(content);
  } catch (e) {
    chai_1.assert.fail(`Invalid json file: ${pathToJson}`);
  }
}
exports.assertValidJson = assertValidJson;
