"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useEnvironment = void 0;
const reset_1 = require("../../src/internal/reset");
function useEnvironment(configPath) {
  beforeEach("Load environment", function () {
    if (configPath !== undefined) {
      process.env.HARDHAT_CONFIG = configPath;
    }
    this.env = require("../../src/internal/lib/hardhat-lib");
  });
  afterEach("reset hardhat context", function () {
    delete process.env.HARDHAT_CONFIG;
    (0, reset_1.resetHardhatContext)();
  });
}
exports.useEnvironment = useEnvironment;
