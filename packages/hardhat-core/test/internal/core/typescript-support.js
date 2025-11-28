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
const task_names_1 = require("../../../src/builtin-tasks/task-names");
const reset_1 = require("../../../src/internal/reset");
const environment_1 = require("../../helpers/environment");
const project_1 = require("../../helpers/project");
const errors_1 = require("../../helpers/errors");
const errors_list_1 = require("../../../src/internal/core/errors-list");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
describe("Typescript support", function () {
  describe("strict typescript config", function () {
    (0, project_1.useFixtureProject)("broken-typescript-config-project");
    it("Should fail if an implicit any is used and the tsconfig forbids them", function () {
      // If we run this test in transpilation only mode, it will fail
      this.skip();
      chai_1.assert.throws(
        () => require("../../../src/internal/lib/hardhat-lib"),
        "TS7006"
      );
      (0, reset_1.resetHardhatContext)();
    });
  });
  describe("hardhat.config.ts", function () {
    (0, project_1.useFixtureProject)("typescript-project");
    (0, environment_1.useEnvironment)();
    it("Should load the config", function () {
      chai_1.assert.isDefined(this.env.config.networks.network);
    });
  });
  describe("Typescript scripts", function () {
    (0, project_1.useFixtureProject)("typescript-project");
    (0, environment_1.useEnvironment)();
    it("Should run ts scripts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("run", { script: "./script.ts", noCompile: true });
        chai_1.assert.equal(process.exitCode, 123);
        process.exitCode = undefined;
      });
    });
  });
  describe("Typescript tests", function () {
    (0, project_1.useFixtureProject)("typescript-project");
    (0, environment_1.useEnvironment)();
    it("Should see the TS test", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const tests = yield this.env.run(
          task_names_1.TASK_TEST_GET_TEST_FILES,
          {
            testFiles: [],
          }
        );
        chai_1.assert.deepEqual(tests.sort(), [
          yield (0, fs_utils_1.getRealPath)("test/js-test.js"),
          yield (0, fs_utils_1.getRealPath)("test/ts-test.ts"),
        ]);
      });
    });
  });
});
describe("tsconfig param", function () {
  (0, project_1.useFixtureProject)("typescript-project");
  describe("When setting an incorrect tsconfig file", function () {
    beforeEach(() => {
      process.env.HARDHAT_TSCONFIG = "non-existent.ts";
    });
    afterEach(() => {
      delete process.env.HARDHAT_TSCONFIG;
      (0, reset_1.resetHardhatContext)();
    });
    it("should fail to load hardhat", function () {
      (0, errors_1.expectHardhatError)(
        () => require("../../../src/internal/lib/hardhat-lib"),
        errors_list_1.ERRORS.ARGUMENTS.INVALID_ENV_VAR_VALUE
      );
    });
  });
  describe("When setting a correct tsconfig file", function () {
    beforeEach(() => {
      process.env.HARDHAT_TSCONFIG = "./test/tsconfig.json";
    });
    afterEach(() => {
      delete process.env.HARDHAT_TSCONFIG;
      (0, reset_1.resetHardhatContext)();
    });
    it("should load hardhat", function () {
      chai_1.assert.doesNotThrow(() =>
        require("../../../src/internal/lib/hardhat-lib")
      );
    });
  });
});
