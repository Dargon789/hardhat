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
const scripts_runner_1 = require("../../../src/internal/util/scripts-runner");
const environment_1 = require("../../helpers/environment");
const project_1 = require("../../helpers/project");
describe("Scripts runner (CJS)", function () {
  (0, project_1.useFixtureProject)("project-with-scripts");
  it("Should pass params to the script", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const [statusCodeWithScriptParams, statusCodeWithNoParams] =
        yield Promise.all([
          (0, scripts_runner_1.runScript)("./params-script.js", [
            "a",
            "b",
            "c",
          ]),
          (0, scripts_runner_1.runScript)("./params-script.js"),
        ]);
      chai_1.assert.equal(statusCodeWithScriptParams, 0);
      // We check here that the script is correctly testing this:
      chai_1.assert.notEqual(statusCodeWithNoParams, 0);
    });
  });
  it("Should run the script to completion", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const before = new Date();
      const status = yield (0, scripts_runner_1.runScript)("./async-script.js");
      chai_1.assert.equal(status, 123);
      const after = new Date();
      chai_1.assert.isAtLeast(after.getTime() - before.getTime(), 100);
    });
  });
  it("Should resolve to the status code of the script run", function () {
    return __awaiter(this, void 0, void 0, function* () {
      chai_1.assert.deepEqual(
        yield (0, scripts_runner_1.runScript)("./failing-script.js"),
        123
      );
    });
  });
  it("Should pass env variables to the script", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const [statusCodeWithEnvVars, statusCodeWithNoEnvArgs] =
        yield Promise.all([
          (0, scripts_runner_1.runScript)("./env-var-script.js", [], [], {
            TEST_ENV_VAR: "test",
          }),
          (0, scripts_runner_1.runScript)("./env-var-script.js"),
        ]);
      chai_1.assert.equal(
        statusCodeWithEnvVars,
        0,
        "Status code with env vars should be 0"
      );
      chai_1.assert.notEqual(
        statusCodeWithNoEnvArgs,
        0,
        "Status code with no env vars should not be 0"
      );
    });
  });
  describe("runWithHardhat", function () {
    (0, environment_1.useEnvironment)();
    it("Should load hardhat/register successfully", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const [statusCodeWithHardhat, statusCodeWithoutHardhat] =
          yield Promise.all([
            (0, scripts_runner_1.runScriptWithHardhat)(
              this.env.hardhatArguments,
              "./successful-script.js"
            ),
            (0, scripts_runner_1.runScript)("./successful-script.js"),
          ]);
        chai_1.assert.equal(statusCodeWithHardhat, 0);
        // We check here that the script is correctly testing this:
        chai_1.assert.notEqual(statusCodeWithoutHardhat, 0);
      });
    });
    it("Should forward all the hardhat arguments", function () {
      return __awaiter(this, void 0, void 0, function* () {
        // This is only for testing purposes, as we can't set a hardhat argument
        // as the CLA does, and env variables always get forwarded to child
        // processes
        this.env.hardhatArguments.network = "custom";
        const statusCode = yield (0, scripts_runner_1.runScriptWithHardhat)(
          this.env.hardhatArguments,
          "./assert-hardhat-arguments.js"
        );
        chai_1.assert.equal(statusCode, 0);
      });
    });
  });
});
describe("Scripts runner (ESM)", function () {
  (0, project_1.useFixtureProject)("esm-project-with-scripts");
  it("Should pass params to the script", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const [statusCodeWithScriptParams, statusCodeWithNoParams] =
        yield Promise.all([
          (0, scripts_runner_1.runScript)("./params-script.js", [
            "a",
            "b",
            "c",
          ]),
          (0, scripts_runner_1.runScript)("./params-script.js"),
        ]);
      chai_1.assert.equal(statusCodeWithScriptParams, 0);
      // We check here that the script is correctly testing this:
      chai_1.assert.notEqual(statusCodeWithNoParams, 0);
    });
  });
  it("Should run the script to completion", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const before = new Date();
      const status = yield (0, scripts_runner_1.runScript)("./async-script.js");
      chai_1.assert.equal(status, 123);
      const after = new Date();
      chai_1.assert.isAtLeast(after.getTime() - before.getTime(), 100);
    });
  });
  it("Should resolve to the status code of the script run", function () {
    return __awaiter(this, void 0, void 0, function* () {
      chai_1.assert.deepEqual(
        yield (0, scripts_runner_1.runScript)("./failing-script.js"),
        123
      );
    });
  });
  it("Should pass env variables to the script", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const [statusCodeWithEnvVars, statusCodeWithNoEnvArgs] =
        yield Promise.all([
          (0, scripts_runner_1.runScript)("./env-var-script.js", [], [], {
            TEST_ENV_VAR: "test",
          }),
          (0, scripts_runner_1.runScript)("./env-var-script.js"),
        ]);
      chai_1.assert.equal(
        statusCodeWithEnvVars,
        0,
        "Status code with env vars should be 0"
      );
      chai_1.assert.notEqual(
        statusCodeWithNoEnvArgs,
        0,
        "Status code with no env vars should not be 0"
      );
    });
  });
  describe("runWithHardhat", function () {
    (0, environment_1.useEnvironment)();
    it("Should load hardhat/register successfully", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const [statusCodeWithHardhat, statusCodeWithoutHardhat] =
          yield Promise.all([
            (0, scripts_runner_1.runScriptWithHardhat)(
              this.env.hardhatArguments,
              "./successful-script.js"
            ),
            (0, scripts_runner_1.runScript)("./successful-script.js"),
          ]);
        chai_1.assert.equal(statusCodeWithHardhat, 0);
        // We check here that the script is correctly testing this:
        chai_1.assert.notEqual(statusCodeWithoutHardhat, 0);
      });
    });
    it("Should forward all the hardhat arguments", function () {
      return __awaiter(this, void 0, void 0, function* () {
        // This is only for testing purposes, as we can't set a hardhat argument
        // as the CLA does, and env variables always get forwarded to child
        // processes
        this.env.hardhatArguments.network = "custom";
        const statusCode = yield (0, scripts_runner_1.runScriptWithHardhat)(
          this.env.hardhatArguments,
          "./assert-hardhat-arguments.js"
        );
        chai_1.assert.equal(statusCode, 0);
      });
    });
  });
});
