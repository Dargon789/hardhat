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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const fs_1 = __importDefault(require("fs"));
const task_names_1 = require("../../../../src/builtin-tasks/task-names");
const context_1 = require("../../../../src/internal/context");
const config_loading_1 = require("../../../../src/internal/core/config/config-loading");
const default_config_1 = require("../../../../src/internal/core/config/default-config");
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const reset_1 = require("../../../../src/internal/reset");
const environment_1 = require("../../../helpers/environment");
const errors_1 = require("../../../helpers/errors");
const project_1 = require("../../../helpers/project");
const fs_utils_1 = require("../../../../src/internal/util/fs-utils");
describe("config loading", function () {
  describe("default config path", function () {
    (0, project_1.useFixtureProject)("config-project");
    (0, environment_1.useEnvironment)();
    it("should load the default config if none is given", function () {
      chai_1.assert.isDefined(this.env.config.networks.localhost);
      chai_1.assert.deepEqual(this.env.config.networks.localhost.accounts, [
        "0xa95f9e3e7ae4e4865c5968828fe7c03fffa8a9f3bb52d36d26243f4c868ee166",
      ]);
    });
  });
  describe("can load CJS config path inside an esm project", function () {
    (0, project_1.useFixtureProject)("esm/cjs-config");
    (0, environment_1.useEnvironment)();
    it("should load the default config if none is given", function () {
      chai_1.assert.isDefined(this.env.config.networks.localhost);
      chai_1.assert.deepEqual(this.env.config.networks.localhost.accounts, [
        "0xa95f9e3e7ae4e4865c5968828fe7c03fffa8a9f3bb52d36d26243f4c868ee166",
      ]);
    });
  });
  describe("Config validation", function () {
    describe("When the config is invalid", function () {
      (0, project_1.useFixtureProject)("invalid-config");
      beforeEach(function () {
        context_1.HardhatContext.createHardhatContext();
      });
      afterEach(function () {
        (0, reset_1.resetHardhatContext)();
      });
      it("Should throw the right error", function () {
        (0, errors_1.expectHardhatError)(
          () => (0, config_loading_1.loadConfigAndTasks)(),
          errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
        );
      });
    });
  });
  describe("custom config path", function () {
    (0, project_1.useFixtureProject)("custom-config-file");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should accept a relative path from the CWD", function () {
      const { resolvedConfig } = (0, config_loading_1.loadConfigAndTasks)({
        config: "config.js",
      });
      chai_1.assert.equal(
        resolvedConfig.paths.configFile,
        path_1.default.normalize(
          path_1.default.join(process.cwd(), "config.js")
        )
      );
    });
    it("should accept an absolute path", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const fixtureDir = yield (0, project_1.getFixtureProjectPath)(
          "custom-config-file"
        );
        const { resolvedConfig } = (0, config_loading_1.loadConfigAndTasks)({
          config: path_1.default.join(fixtureDir, "config.js"),
        });
        chai_1.assert.equal(
          resolvedConfig.paths.configFile,
          path_1.default.normalize(
            path_1.default.join(process.cwd(), "config.js")
          )
        );
      });
    });
  });
  describe("Tasks loading", function () {
    (0, project_1.useFixtureProject)("config-project");
    (0, environment_1.useEnvironment)();
    it("Should define the default tasks", function () {
      chai_1.assert.containsAllKeys(this.env.tasks, [
        task_names_1.TASK_CLEAN,
        "flatten",
        "compile",
        "help",
        "run",
        "test",
      ]);
    });
    it("Should load custom tasks", function () {
      chai_1.assert.containsAllKeys(this.env.tasks, ["example", "example2"]);
    });
  });
  describe("Config env", function () {
    (0, project_1.useFixtureProject)("config-project");
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should remove everything from global state after loading", function () {
      const globalAsAny = global;
      context_1.HardhatContext.createHardhatContext();
      (0, config_loading_1.loadConfigAndTasks)();
      chai_1.assert.isUndefined(globalAsAny.subtask);
      chai_1.assert.isUndefined(globalAsAny.task);
      chai_1.assert.isUndefined(globalAsAny.types);
      chai_1.assert.isUndefined(globalAsAny.extendEnvironment);
      (0, reset_1.resetHardhatContext)();
      context_1.HardhatContext.createHardhatContext();
      (0, config_loading_1.loadConfigAndTasks)();
      chai_1.assert.isUndefined(globalAsAny.subtask);
      chai_1.assert.isUndefined(globalAsAny.task);
      chai_1.assert.isUndefined(globalAsAny.types);
      chai_1.assert.isUndefined(globalAsAny.extendEnvironment);
      (0, reset_1.resetHardhatContext)();
    });
  });
  describe("Config that imports the library", function () {
    (0, project_1.useFixtureProject)("config-imports-lib-project");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should accept a relative path from the CWD", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_loading_1.loadConfigAndTasks)(),
        errors_list_1.ERRORS.GENERAL.LIB_IMPORTED_FROM_THE_CONFIG
      );
    });
  });
  describe("missing package", function () {
    (0, project_1.useFixtureProject)("import-missing-package");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should re-throw the error", function () {
      let errorThrown;
      try {
        (0, config_loading_1.loadConfigAndTasks)();
      } catch (e) {
        errorThrown = e;
      }
      if (errorThrown === undefined) {
        chai_1.assert.fail("No error was thrown");
      }
      (0, chai_1.assert)(errorThrown.code === "MODULE_NOT_FOUND");
    });
  });
  describe("dependency not installed", function () {
    (0, project_1.useFixtureProject)("import-dependency-not-installed");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should re-throw the error", function () {
      let errorThrown;
      try {
        (0, config_loading_1.loadConfigAndTasks)();
      } catch (e) {
        errorThrown = e;
      }
      if (errorThrown === undefined) {
        chai_1.assert.fail("No error was thrown");
      }
      (0, chai_1.assert)(errorThrown.code === "MODULE_NOT_FOUND");
    });
  });
  describe("devDependency not installed", function () {
    (0, project_1.useFixtureProject)("import-dev-dependency-not-installed");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should re-throw the error", function () {
      let errorThrown;
      try {
        (0, config_loading_1.loadConfigAndTasks)();
      } catch (e) {
        errorThrown = e;
      }
      if (errorThrown === undefined) {
        chai_1.assert.fail("No error was thrown");
      }
      (0, chai_1.assert)(errorThrown.code === "MODULE_NOT_FOUND");
    });
  });
  describe("plugin peer dependency not installed", function () {
    (0, project_1.useFixtureProject)("plugin-peer-dependency-not-installed");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should indicate the plugin and the missing dependency", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_loading_1.loadConfigAndTasks)(),
        errors_list_1.ERRORS.PLUGINS.MISSING_DEPENDENCIES,
        "Plugin some-plugin requires the following dependencies to be installed: some-dependency"
      );
    });
  });
  describe("plugin multiple peer dependencies not installed", function () {
    (0, project_1.useFixtureProject)(
      "plugin-multiple-peer-dependencies-not-installed"
    );
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should indicate the plugin and the missing dependencies", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_loading_1.loadConfigAndTasks)(),
        errors_list_1.ERRORS.PLUGINS.MISSING_DEPENDENCIES,
        "Plugin some-plugin requires the following dependencies to be installed: some-dependency, some-other-dependency"
      );
    });
  });
  describe("buidler plugin", function () {
    (0, project_1.useFixtureProject)("buidler-plugin");
    beforeEach(function () {
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("should indicate the buidler plugin", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_loading_1.loadConfigAndTasks)(),
        errors_list_1.ERRORS.PLUGINS.BUIDLER_PLUGIN,
        `You are using some-buidler-plugin, which is a Buidler plugin. Use the equivalent
Hardhat plugin instead.`
      );
    });
  });
  describe("dynamic import of missing dependency in task", function () {
    (0, project_1.useFixtureProject)("plugin-dynamic-import-not-installed");
    (0, environment_1.useEnvironment)();
    it("should indicate the plugin and the missing dependencies", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => this.env.run("some-task"), errors_list_1.ERRORS.PLUGINS.MISSING_DEPENDENCIES, "Plugin some-plugin requires the following dependencies to be installed: some-dependency");
      });
    });
  });
  describe("Required files recording", function () {
    (0, project_1.useFixtureProject)(
      "files-required-by-config-tracking-example"
    );
    afterEach(function () {
      (0, reset_1.resetHardhatContext)();
    });
    it("Should keep track of all the files imported when loading the config", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const builtinTasksFiles = yield (0, fs_utils_1.getAllFilesMatching)(
          // We use realpathSync and not getRealPathSync as that's what node uses
          // internally.
          fs_1.default.realpathSync(
            path_1.default.join(
              __dirname,
              "..",
              "..",
              "..",
              "..",
              "src",
              "builtin-tasks"
            )
          ),
          (f) => f.endsWith(".ts")
        );
        const projectPath = (0, fs_utils_1.getRealPathSync)(".");
        // We run this twice to make sure that the cache is cleaned properly
        for (let i = 0; i < 2; i++) {
          context_1.HardhatContext.createHardhatContext();
          (0, config_loading_1.loadConfigAndTasks)();
          const ctx = context_1.HardhatContext.getHardhatContext();
          const files = ctx.getFilesLoadedDuringConfig();
          const filesJson = JSON.stringify(files, undefined, 2);
          for (const file of builtinTasksFiles) {
            // The task names and the utils may have been loaded before, so we ignore them.
            if (
              file.endsWith("task-names.ts") ||
              file.includes(
                path_1.default.join(
                  path_1.default.sep,
                  "utils",
                  path_1.default.sep
                )
              )
            ) {
              continue;
            }
            chai_1.assert.include(
              files,
              file,
              `${file} should be included in ${filesJson}`
            );
          }
          // Must include the config file and the files directly and
          // indirectly imported by it.
          chai_1.assert.include(
            files,
            path_1.default.join(projectPath, "hardhat.config.js")
          );
          chai_1.assert.include(
            files,
            path_1.default.join(projectPath, "a.js")
          );
          chai_1.assert.include(
            files,
            path_1.default.join(projectPath, "b.js")
          );
          // Must not include unrelated files.
          chai_1.assert.notInclude(
            files,
            path_1.default.join(projectPath, "not-imported.js")
          );
          (0, reset_1.resetHardhatContext)();
        }
      });
    });
  });
  describe("solidity config warnings", function () {
    (0, project_1.useFixtureProject)("solidity-config-warnings");
    let consoleWarnStub;
    beforeEach(function () {
      consoleWarnStub = sinon_1.default.stub(console, "warn");
      context_1.HardhatContext.createHardhatContext();
    });
    afterEach(function () {
      consoleWarnStub.restore();
      (0, reset_1.resetHardhatContext)();
    });
    it("should emit a warning if config is the empty object", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "empty-config.js",
        },
        { showEmptyConfigWarning: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "Hardhat config is returning an empty config object, check the export from the config file if this is unexpected."
      );
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "Learn more about configuring Hardhat at https://hardhat.org/config"
      );
    });
    it("should emit a warning if there's no configured solidity", function () {
      const { resolvedConfig } = (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "config-without-solidity.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "Solidity compiler is not configured"
      );
      chai_1.assert.equal(resolvedConfig.solidity.compilers.length, 1);
      chai_1.assert.equal(
        resolvedConfig.solidity.compilers[0].version,
        default_config_1.DEFAULT_SOLC_VERSION
      );
    });
    it("should emit a warning if the solc version is too new", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "unsupported-new-solc.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "is not fully supported yet"
      );
    });
    it("should emit a warning if there are multiple unsupported versions", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "multiple-unsupported-solc.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "are not fully supported yet"
      );
    });
    it("should emit a warning if there is an unsupported version in an override", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "unsupported-solc-in-override.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "is not fully supported yet"
      );
    });
    it("should emit a warning if there is a remapping in the compiler settings", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "remapping-in-settings.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "remappings are not currently supported"
      );
    });
    it("should emit a warning if there is a remapping in the list of compiler settings", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "remapping-in-list.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "remappings are not currently supported"
      );
    });
    it("should emit a warning if there is a remapping in the list of compiler overrides", function () {
      (0, config_loading_1.loadConfigAndTasks)(
        {
          config: "remapping-in-override.js",
        },
        { showSolidityConfigWarnings: true }
      );
      chai_1.assert.equal(consoleWarnStub.callCount, 1);
      chai_1.assert.include(
        consoleWarnStub.args[0][0],
        "remappings are not currently supported"
      );
    });
  });
  describe("ESM project", function () {
    describe(".js config file", function () {
      (0, project_1.useFixtureProject)("esm/js-config");
      beforeEach(function () {
        context_1.HardhatContext.createHardhatContext();
      });
      afterEach(function () {
        (0, reset_1.resetHardhatContext)();
      });
      it("Should throw the right error", function () {
        (0, errors_1.expectHardhatError)(
          () => (0, config_loading_1.loadConfigAndTasks)(),
          errors_list_1.ERRORS.GENERAL.ESM_PROJECT_WITHOUT_CJS_CONFIG
        );
      });
    });
    describe(".cjs config file", function () {
      (0, project_1.useFixtureProject)("esm/cjs-config");
      beforeEach(function () {
        context_1.HardhatContext.createHardhatContext();
      });
      afterEach(function () {
        (0, reset_1.resetHardhatContext)();
      });
      it("Should not throw", function () {
        (0, config_loading_1.loadConfigAndTasks)();
      });
    });
  });
});
