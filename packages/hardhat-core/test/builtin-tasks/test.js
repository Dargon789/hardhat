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
const errors_list_1 = require("../../src/internal/core/errors-list");
const project_1 = require("../helpers/project");
const environment_1 = require("../helpers/environment");
const errors_1 = require("../helpers/errors");
// This file and the associated fixture projects have a lot of duplication. The
// reason is that some fixture projects use Mocha in ESM mode, which doesn't
// support cleaning the cache.
//
// To work around that, this suite uses a different
// fixture project for each test. There shouldn't be two `useFixtureProject`
// calls with the same argument, and each `it` should have its own fixture
// project.
describe("test task (CJS)", function () {
  describe("default config project", function () {
    (0, project_1.useFixtureProject)("test-task/minimal-config");
    (0, environment_1.useEnvironment)();
    it("should run tests", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        chai_1.assert.equal(process.exitCode, 0);
        process.exitCode = undefined;
      });
    });
  });
  describe("failing tests", function () {
    (0, project_1.useFixtureProject)("test-task/failing-tests");
    (0, environment_1.useEnvironment)();
    it("should have a return code equal to the number of failing tests", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        chai_1.assert.equal(process.exitCode, 2);
        process.exitCode = undefined;
      });
    });
  });
  describe("parallel tests", function () {
    describe("with the default config in serial mode", function () {
      (0, project_1.useFixtureProject)("test-task/parallel-tests/serial");
      (0, environment_1.useEnvironment)();
      it("should fail in serial mode", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("with the default config in parallel mode", function () {
      (0, project_1.useFixtureProject)("test-task/parallel-tests/parallel");
      (0, environment_1.useEnvironment)();
      it("should pass in parallel mode", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            parallel: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: true", function () {
      (0, project_1.useFixtureProject)(
        "test-task/parallel-tests/parallel-config-true"
      );
      (0, environment_1.useEnvironment)();
      it("use parallel by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: false", function () {
      (0, project_1.useFixtureProject)(
        "test-task/parallel-tests/parallel-config-false"
      );
      (0, environment_1.useEnvironment)();
      it("use serial by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: false and it's overriden", function () {
      (0, project_1.useFixtureProject)(
        "test-task/parallel-tests/parallel-config-false-overriden"
      );
      (0, environment_1.useEnvironment)();
      it("should be overridable", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            parallel: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
  });
  describe("bail", function () {
    describe("with the default config and no --bail", function () {
      (0, project_1.useFixtureProject)("test-task/bail/default");
      (0, environment_1.useEnvironment)();
      it("should have two failures if all tests are run", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 2);
          process.exitCode = undefined;
        });
      });
    });
    describe("with the default config and no --bail", function () {
      (0, project_1.useFixtureProject)("test-task/bail/default-with-bail-flag");
      (0, environment_1.useEnvironment)();
      it("should stop at the first failure if --bail is used", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            bail: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: true", function () {
      (0, project_1.useFixtureProject)("test-task/bail/config-bail-true");
      (0, environment_1.useEnvironment)();
      it("use bail by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: false", function () {
      (0, project_1.useFixtureProject)("test-task/bail/config-bail-false");
      (0, environment_1.useEnvironment)();
      it("don't bail by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 2);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: false and it's overriden", function () {
      (0, project_1.useFixtureProject)(
        "test-task/bail/config-bail-false-overriden"
      );
      (0, environment_1.useEnvironment)();
      it("should be overridable", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            bail: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
  });
  describe("mixed files", function () {
    (0, project_1.useFixtureProject)("test-task/mixed-test-files");
    (0, environment_1.useEnvironment)();
    it("should run .js, .cjs and .mjs files", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        // each file has a single failing test, so the exit code should be 3
        chai_1.assert.equal(process.exitCode, 3);
        process.exitCode = undefined;
      });
    });
  });
  describe("running tests programmatically twice", function () {
    (0, project_1.useFixtureProject)("test-task/run-tests-twice");
    (0, environment_1.useEnvironment)();
    it("should run tests twice without an error", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const result = yield this.env.run("twice");
        chai_1.assert.isTrue(result);
      });
    });
  });
  describe("running tests programmatically twice, one test is .mjs", function () {
    (0, project_1.useFixtureProject)("test-task/run-tests-twice-mjs");
    (0, environment_1.useEnvironment)();
    it("should throw an error", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run("twice");
            }),
          errors_list_1.ERRORS.BUILTIN_TASKS.TEST_TASK_ESM_TESTS_RUN_TWICE
        );
      });
    });
  });
});
describe("test task (ESM)", function () {
  describe("default config project", function () {
    (0, project_1.useFixtureProject)("esm-test-task/minimal-config");
    (0, environment_1.useEnvironment)();
    it("should run tests", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        chai_1.assert.equal(process.exitCode, 0);
        process.exitCode = undefined;
      });
    });
  });
  describe("failing tests", function () {
    (0, project_1.useFixtureProject)("esm-test-task/failing-tests");
    (0, environment_1.useEnvironment)();
    it("should have a return code equal to the number of failing tests", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        chai_1.assert.equal(process.exitCode, 2);
        process.exitCode = undefined;
      });
    });
  });
  describe("parallel tests", function () {
    describe("with the default config in serial mode", function () {
      (0, project_1.useFixtureProject)("esm-test-task/parallel-tests/serial");
      (0, environment_1.useEnvironment)();
      it("should fail in serial mode", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("with the default config in parallel mode", function () {
      (0, project_1.useFixtureProject)("esm-test-task/parallel-tests/parallel");
      (0, environment_1.useEnvironment)();
      it("should pass in parallel mode", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            parallel: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: true", function () {
      (0, project_1.useFixtureProject)(
        "esm-test-task/parallel-tests/parallel-config-true"
      );
      (0, environment_1.useEnvironment)();
      it("use parallel by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: false", function () {
      (0, project_1.useFixtureProject)(
        "esm-test-task/parallel-tests/parallel-config-false"
      );
      (0, environment_1.useEnvironment)();
      it("use serial by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has parallel: false and it's overriden", function () {
      (0, project_1.useFixtureProject)(
        "esm-test-task/parallel-tests/parallel-config-false-overriden"
      );
      (0, environment_1.useEnvironment)();
      it("should be overridable", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            parallel: true,
          });
          chai_1.assert.equal(process.exitCode, 0);
          process.exitCode = undefined;
        });
      });
    });
  });
  describe("bail", function () {
    describe("with the default config", function () {
      (0, project_1.useFixtureProject)("esm-test-task/bail/default");
      (0, environment_1.useEnvironment)();
      it("should have two failures if all tests are run", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 2);
          process.exitCode = undefined;
        });
      });
    });
    describe("with the default config", function () {
      (0, project_1.useFixtureProject)("esm-test-task/bail/with-bail-flag");
      (0, environment_1.useEnvironment)();
      it("should stop at the first failure if --bail is used", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            bail: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: true", function () {
      (0, project_1.useFixtureProject)("esm-test-task/bail/bail-config-true");
      (0, environment_1.useEnvironment)();
      it("use bail by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: false", function () {
      (0, project_1.useFixtureProject)("esm-test-task/bail/bail-config-false");
      (0, environment_1.useEnvironment)();
      it("don't bail by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
          });
          chai_1.assert.equal(process.exitCode, 2);
          process.exitCode = undefined;
        });
      });
    });
    describe("when the config has bail: false and it's overriden", function () {
      (0, project_1.useFixtureProject)(
        "esm-test-task/bail/bail-config-false-overriden"
      );
      (0, environment_1.useEnvironment)();
      it("should be overridable", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("test", {
            noCompile: true,
            bail: true,
          });
          chai_1.assert.equal(process.exitCode, 1);
          process.exitCode = undefined;
        });
      });
    });
  });
  describe("mixed files", function () {
    (0, project_1.useFixtureProject)("esm-test-task/mixed-test-files");
    (0, environment_1.useEnvironment)();
    it("should run .js, .cjs and .mjs files", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("test", {
          noCompile: true,
        });
        // each file has a single failing test, so the exit code should be 3
        chai_1.assert.equal(process.exitCode, 3);
        process.exitCode = undefined;
      });
    });
  });
  describe("running tests programmatically twice", function () {
    (0, project_1.useFixtureProject)("esm-test-task/run-tests-twice");
    (0, environment_1.useEnvironment)();
    it("should throw an error", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run("twice");
            }),
          errors_list_1.ERRORS.BUILTIN_TASKS.TEST_TASK_ESM_TESTS_RUN_TWICE
        );
      });
    });
  });
});
