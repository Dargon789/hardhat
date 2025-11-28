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
const reset_1 = require("../../../src/internal/reset");
const environment_1 = require("../../helpers/environment");
const project_1 = require("../../helpers/project");
describe("Hardhat lib", () => {
  (0, project_1.useFixtureProject)("config-project");
  (0, environment_1.useEnvironment)();
  before(() => {
    process.env.HARDHAT_NETWORK = "localhost";
  });
  it("should load environment", function () {
    chai_1.assert.isDefined(this.env.config.networks.custom);
  });
  it("should load task user defined task", function () {
    return __awaiter(this, void 0, void 0, function* () {
      chai_1.assert.isDefined(this.env.tasks.example2);
      chai_1.assert.equal(yield this.env.run("example2"), 28);
    });
  });
  it("should reuse global state", function () {
    return __awaiter(this, void 0, void 0, function* () {
      let environment = require("../../../src/internal/lib/hardhat-lib");
      chai_1.assert.isTrue(this.env === environment);
      (0, reset_1.resetHardhatContext)();
      environment = require("../../../src/internal/lib/hardhat-lib");
      chai_1.assert.equal(yield environment.run("example"), 28);
      chai_1.assert.isFalse(this.env === environment);
    });
  });
});
