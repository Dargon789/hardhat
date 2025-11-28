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
const context_1 = require("../../src/internal/context");
const errors_list_1 = require("../../src/internal/core/errors-list");
const reset_1 = require("../../src/internal/reset");
const environment_1 = require("../helpers/environment");
const errors_1 = require("../helpers/errors");
const project_1 = require("../helpers/project");
describe("Hardhat context", function () {
  describe("no context", () => {
    it("context is not defined", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(context_1.HardhatContext.isCreated());
      });
    });
    it("should throw when context isn't created", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => context_1.HardhatContext.getHardhatContext(), errors_list_1.ERRORS.GENERAL.CONTEXT_NOT_CREATED);
      });
    });
  });
  describe("create context but no environment", function () {
    afterEach("reset context", function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("context is defined", function () {
      return __awaiter(this, void 0, void 0, function* () {
        context_1.HardhatContext.createHardhatContext();
        chai_1.assert.isTrue(context_1.HardhatContext.isCreated());
      });
    });
    it("context initialize properly", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const ctx = context_1.HardhatContext.createHardhatContext();
        chai_1.assert.isDefined(ctx.environmentExtenders);
        chai_1.assert.isDefined(ctx.tasksDSL);
        chai_1.assert.isUndefined(ctx.environment);
      });
    });
    it("should throw when recreating hardhat context", function () {
      return __awaiter(this, void 0, void 0, function* () {
        context_1.HardhatContext.createHardhatContext();
        (0,
        errors_1.expectHardhatError)(() => context_1.HardhatContext.createHardhatContext(), errors_list_1.ERRORS.GENERAL.CONTEXT_ALREADY_CREATED);
      });
    });
    it("should delete context", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(context_1.HardhatContext.isCreated());
        context_1.HardhatContext.createHardhatContext();
        chai_1.assert.isTrue(context_1.HardhatContext.isCreated());
        context_1.HardhatContext.deleteHardhatContext();
        chai_1.assert.isFalse(context_1.HardhatContext.isCreated());
      });
    });
    it("should throw when HRE is not defined", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const ctx = context_1.HardhatContext.createHardhatContext();
        (0,
        errors_1.expectHardhatError)(() => ctx.getHardhatRuntimeEnvironment(), errors_list_1.ERRORS.GENERAL.CONTEXT_HRE_NOT_DEFINED);
      });
    });
  });
  describe("environment creates context", function () {
    (0, project_1.useFixtureProject)("config-project");
    (0, environment_1.useEnvironment)();
    it("should create context and set HRE into context", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(
          context_1.HardhatContext.getHardhatContext().getHardhatRuntimeEnvironment(),
          this.env
        );
      });
    });
    it("should throw when trying to set HRE", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => context_1.HardhatContext.getHardhatContext().setHardhatRuntimeEnvironment(this.env), errors_list_1.ERRORS.GENERAL.CONTEXT_HRE_ALREADY_DEFINED);
      });
    });
  });
});
