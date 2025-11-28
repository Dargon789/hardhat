"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const default_config_1 = require("../../../../src/internal/core/config/default-config");
const hardforks_1 = require("../../../../src/internal/util/hardforks");
describe("Default config", function () {
  it("should include block numbers for all hardforks", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const mainnetChainConfig =
        default_config_1.defaultHardhatNetworkParams.chains.get(1);
      if (mainnetChainConfig === undefined) {
        chai_1.assert.fail("Mainnet entry should exist");
      }
      const history = mainnetChainConfig.hardforkHistory;
      for (const hardfork of Object.values(hardforks_1.HardforkName)) {
        const hardforkHistoryEntry = history.get(hardfork);
        chai_1.assert.isDefined(
          hardforkHistoryEntry,
          `No hardfork history entry for ${hardfork}`
        );
      }
    });
  });
});
