"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.workaroundWindowsCiFailures = void 0;
const os_1 = __importDefault(require("os"));
/**
 * Hardhat Network tests that involve forking are much more brittle on windows
 * for some reason, so we retry them a few times.
 */
function workaroundWindowsCiFailures({ isFork }) {
  if (isFork && os_1.default.type() === "Windows_NT") {
    this.retries(4);
  }
}
exports.workaroundWindowsCiFailures = workaroundWindowsCiFailures;
