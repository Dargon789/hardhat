"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
const edr_1 = require("@nomicfoundation/edr");
const chai_1 = require("chai");
const ci_info_1 = __importDefault(require("ci-info"));
const fsExtra = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const task_names_1 = require("../../src/builtin-tasks/task-names");
const constants_1 = require("../../src/internal/constants");
const errors_list_1 = require("../../src/internal/core/errors-list");
const builtin_tasks_1 = require("../../src/types/builtin-tasks");
const environment_1 = require("../helpers/environment");
const errors_1 = require("../helpers/errors");
const project_1 = require("../helpers/project");
const json_1 = require("../utils/json");
const mock_file_1 = require("../utils/mock-file");
const fs_utils_1 = require("../../src/internal/util/fs-utils");
function assertFileExists(pathToFile) {
  chai_1.assert.isTrue(
    fsExtra.existsSync(pathToFile),
    `Expected ${pathToFile} to exist`
  );
}
function assertBuildInfoExists(pathToDbg) {
  assertFileExists(pathToDbg);
  const { buildInfo } = fsExtra.readJsonSync(pathToDbg);
  assertFileExists(path.resolve(path.dirname(pathToDbg), buildInfo));
}
describe("compile task", function () {
  beforeEach(function () {
    fsExtra.removeSync("artifacts");
    fsExtra.removeSync(
      path.join("cache", constants_1.SOLIDITY_FILES_CACHE_FILENAME)
    );
  });
  function getBuildInfos() {
    return (0, fs_utils_1.getAllFilesMatchingSync)(
      (0, fs_utils_1.getRealPathSync)("artifacts/build-info"),
      (f) => f.endsWith(".json")
    );
  }
  describe("compile with latest solc version", function () {
    // The 'hardhat.config.js' and 'A.sol' files need to be updated each time a new solc version is released
    (0, project_1.useFixtureProject)("compilation-latest-solc-version");
    (0, environment_1.useEnvironment)();
    it("should have the last version of solc in the 'hardhat.config.js' and 'A.sol' files", function () {
      return __awaiter(this, void 0, void 0, function* () {
        // Test to check that the last version of solc is being tested
        const userConfigSolcVersion = this.env.userConfig.solidity;
        const lastSolcVersion = (0, edr_1.getLatestSupportedSolcVersion)();
        chai_1.assert.equal(
          userConfigSolcVersion,
          lastSolcVersion,
          `The version of solc in the user config is not the last one. Expected '${lastSolcVersion}' but got '${userConfigSolcVersion}'. Did you forget to update the test?`
        );
      });
    });
    it("should compile and emit artifacts using the latest solc version", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        assertFileExists(
          path.join("artifacts", "contracts", "A.sol", "A.json")
        );
        assertBuildInfoExists(
          path.join("artifacts", "contracts", "A.sol", "A.dbg.json")
        );
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 1);
        (0, json_1.assertValidJson)(buildInfos[0]);
      });
    });
  });
  describe("project with single file", function () {
    (0, project_1.useFixtureProject)("compilation-single-file");
    (0, environment_1.useEnvironment)();
    it("should compile and emit artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        assertFileExists(
          path.join("artifacts", "contracts", "A.sol", "A.json")
        );
        assertBuildInfoExists(
          path.join("artifacts", "contracts", "A.sol", "A.dbg.json")
        );
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 1);
        (0, json_1.assertValidJson)(buildInfos[0]);
      });
    });
  });
  describe("project with an empty file", function () {
    (0, project_1.useFixtureProject)("compilation-empty-file");
    (0, environment_1.useEnvironment)();
    it("should compile and emit no artifact", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        // the artifacts directory only has the build-info directory
        const artifactsDirectory = fsExtra.readdirSync("artifacts");
        chai_1.assert.lengthOf(artifactsDirectory, 1);
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 0);
      });
    });
  });
  describe("project with a single file with many contracts", function () {
    (0, project_1.useFixtureProject)("compilation-single-file-many-contracts");
    (0, environment_1.useEnvironment)();
    it("should compile and emit artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        const artifactsDirectory = fsExtra.readdirSync(
          "artifacts/contracts/A.sol"
        );
        // 100 contracts, 2 files per contract
        chai_1.assert.lengthOf(artifactsDirectory, 200);
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 1);
        (0, json_1.assertValidJson)(buildInfos[0]);
      });
    });
  });
  describe("project with many files", function () {
    (0, project_1.useFixtureProject)("compilation-many-files");
    (0, environment_1.useEnvironment)();
    it("should compile and emit artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        const contractsDirectory = fsExtra.readdirSync("artifacts/contracts");
        chai_1.assert.lengthOf(contractsDirectory, 100);
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 1);
        (0, json_1.assertValidJson)(buildInfos[0]);
      });
    });
  });
  describe("project with two files with different compiler versions", function () {
    (0, project_1.useFixtureProject)(
      "compilation-two-files-different-versions"
    );
    (0, environment_1.useEnvironment)();
    it("should compile and emit artifacts", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        assertFileExists(
          path.join("artifacts", "contracts", "A.sol", "A.json")
        );
        assertFileExists(
          path.join("artifacts", "contracts", "B.sol", "B.json")
        );
        assertBuildInfoExists(
          path.join("artifacts", "contracts", "A.sol", "A.dbg.json")
        );
        assertBuildInfoExists(
          path.join("artifacts", "contracts", "B.sol", "B.dbg.json")
        );
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 2);
        (0, json_1.assertValidJson)(buildInfos[0]);
        (0, json_1.assertValidJson)(buildInfos[1]);
      });
    });
  });
  describe("project with multiple different evm versions", function () {
    (0, project_1.useFixtureProject)(
      "compilation-multiple-files-different-evm-versions"
    );
    (0, environment_1.useEnvironment)();
    it("should compile and show a message listing all the evm versions used", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const spyFunctionConsoleLog = sinon_1.default.stub(console, "log");
        yield this.env.run("compile");
        (0,
        chai_1.assert)(spyFunctionConsoleLog.calledWith("Compiled 4 Solidity files successfully (evm targets: paris, petersburg, shanghai, unknown evm version for solc version 0.4.11)."));
        spyFunctionConsoleLog.restore();
      });
    });
  });
  describe("TASK_COMPILE_SOLIDITY_READ_FILE", function () {
    describe("Import folder", () => {
      const folderName = "compilation-single-file";
      (0, project_1.useFixtureProject)(folderName);
      (0, environment_1.useEnvironment)();
      it("should throw an error because a directory is trying to be imported", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const absolutePath = `${__dirname}/../fixture-projects/${folderName}/contracts/`;
          yield (0, errors_1.expectHardhatErrorAsync)(
            () =>
              __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(
                  task_names_1.TASK_COMPILE_SOLIDITY_READ_FILE,
                  {
                    absolutePath,
                  }
                );
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_READ_OF_DIRECTORY,
            `HH22: Invalid file path ${absolutePath}. Attempting to read a directory instead of a file.`
          );
        });
      });
    });
    describe("A non specific Hardhat error is thrown (expected default error)", () => {
      const folderName = "compilation-import-non-existing-file-from-path";
      (0, project_1.useFixtureProject)(folderName);
      (0, environment_1.useEnvironment)();
      it("should throw an error because the file does not exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const absolutePath = `${__dirname}/../fixture-projects/${folderName}/contracts/file.sol`;
          yield (0, chai_1.expect)(
            this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_READ_FILE, {
              absolutePath,
            })
          )
            .to.be.rejectedWith(
              `ENOENT: no such file or directory, lstat '${absolutePath}'`
            )
            .and.eventually.have.property("name", "Error"); // Default js error
        });
      });
    });
  });
  describe("compilation jobs failure message", function () {
    (0, project_1.useFixtureProject)("compilation-single-file");
    (0, environment_1.useEnvironment)();
    it("should return a proper message for a non compatible solc error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .NO_COMPATIBLE_SOLC_VERSION_FOUND,
            file: Foo,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `The Solidity version pragma statement in these files doesn't match any of the configured compilers in your config. Change the pragma or configure additional compiler versions in your hardhat config.

  * contracts/Foo.sol (^0.5.0)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for a non compatible solc error with two files", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar.sol",
          pragma: "^0.5.1",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .NO_COMPATIBLE_SOLC_VERSION_FOUND,
            file: Foo,
          },
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .NO_COMPATIBLE_SOLC_VERSION_FOUND,
            file: Bar,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `The Solidity version pragma statement in these files doesn't match any of the configured compilers in your config. Change the pragma or configure additional compiler versions in your hardhat config.

  * contracts/Foo.sol (^0.5.0)
  * contracts/Bar.sol (^0.5.1)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for a non compatible overriden solc error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INCOMPATIBLE_OVERRIDEN_SOLC_VERSION,
            file: Foo,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `The compiler version for the following files is fixed through an override in your config file to a version that is incompatible with their Solidity version pragmas.

  * contracts/Foo.sol (^0.5.0)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for a non compatible import error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar.sol",
          pragma: "^0.6.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .DIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleDirectImports: [Bar],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files import other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) imports contracts/Bar.sol (^0.6.0)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for two non compatible imports", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .DIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleDirectImports: [Bar1, Bar2],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files import other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) imports contracts/Bar1.sol (^0.6.0) and contracts/Bar2.sol (^0.6.1)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for three non compatible imports", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const Bar3 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar3.sol",
          pragma: "^0.6.2",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .DIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleDirectImports: [Bar1, Bar2, Bar3],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files import other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) imports contracts/Bar1.sol (^0.6.0), contracts/Bar2.sol (^0.6.1) and 1 other file. Use --verbose to see the full list.

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for four non compatible imports", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const Bar3 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar3.sol",
          pragma: "^0.6.2",
        });
        const Bar4 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar4.sol",
          pragma: "^0.6.3",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .DIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleDirectImports: [Bar1, Bar2, Bar3, Bar4],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files import other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) imports contracts/Bar1.sol (^0.6.0), contracts/Bar2.sol (^0.6.1) and 2 other files. Use --verbose to see the full list.

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for an indirect non compatible import error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar.sol",
          pragma: "^0.6.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INDIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleIndirectImports: [
                {
                  dependency: Bar,
                  path: [],
                },
              ],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files depend on other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) depends on contracts/Bar.sol (^0.6.0)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for two indirect non compatible import errors", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INDIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleIndirectImports: [
                { dependency: Bar1, path: [] },
                { dependency: Bar2, path: [] },
              ],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files depend on other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) depends on contracts/Bar1.sol (^0.6.0) and contracts/Bar2.sol (^0.6.1)

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for three indirect non compatible import errors", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const Bar3 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar3.sol",
          pragma: "^0.6.2",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INDIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleIndirectImports: [
                { dependency: Bar1, path: [] },
                { dependency: Bar2, path: [] },
                { dependency: Bar3, path: [] },
              ],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files depend on other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) depends on contracts/Bar1.sol (^0.6.0), contracts/Bar2.sol (^0.6.1) and 1 other file. Use --verbose to see the full list.

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for four indirect non compatible import errors", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const Bar1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar1.sol",
          pragma: "^0.6.0",
        });
        const Bar2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar2.sol",
          pragma: "^0.6.1",
        });
        const Bar3 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar3.sol",
          pragma: "^0.6.2",
        });
        const Bar4 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar4.sol",
          pragma: "^0.6.3",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INDIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo,
            extra: {
              incompatibleIndirectImports: [
                { dependency: Bar1, path: [] },
                { dependency: Bar2, path: [] },
                { dependency: Bar3, path: [] },
                { dependency: Bar4, path: [] },
              ],
            },
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files depend on other files that use a different and incompatible version of Solidity:

  * contracts/Foo.sol (^0.5.0) depends on contracts/Bar1.sol (^0.6.0), contracts/Bar2.sol (^0.6.1) and 2 other files. Use --verbose to see the full list.

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for other kind of error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason.OTHER_ERROR,
            file: Foo,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files and its dependencies cannot be compiled with your config. This can happen because they have incompatible Solidity pragmas, or don't match any of your configured Solidity compilers.

  * contracts/Foo.sol

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return a proper message for an unknown kind of error with a single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo.sol",
          pragma: "^0.5.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason: "unknown",
            file: Foo,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `These files and its dependencies cannot be compiled with your config. This can happen because they have incompatible Solidity pragmas, or don't match any of your configured Solidity compilers.

  * contracts/Foo.sol

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
    it("should return multiple errors in order", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo1 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo1.sol",
          pragma: "^0.5.0",
        });
        const Foo2 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo2.sol",
          pragma: "^0.5.0",
        });
        const Foo3 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo3.sol",
          pragma: "^0.5.0",
        });
        const Foo4 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo4.sol",
          pragma: "^0.5.0",
        });
        const Foo5 = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Foo5.sol",
          pragma: "^0.5.0",
        });
        const Bar = (0, mock_file_1.mockFile)({
          sourceName: "contracts/Bar.sol",
          pragma: "^0.6.0",
        });
        const compilationJobsCreationErrors = [
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason.OTHER_ERROR,
            file: Foo4,
          },
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .NO_COMPATIBLE_SOLC_VERSION_FOUND,
            file: Foo2,
          },
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .DIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo3,
            extra: {
              incompatibleDirectImports: [Bar],
            },
          },
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INDIRECTLY_IMPORTS_INCOMPATIBLE_FILE,
            file: Foo5,
            extra: {
              incompatibleIndirectImports: [{ dependency: Bar, path: [] }],
            },
          },
          {
            reason:
              builtin_tasks_1.CompilationJobCreationErrorReason
                .INCOMPATIBLE_OVERRIDEN_SOLC_VERSION,
            file: Foo1,
          },
        ];
        const reasons = yield this.env.run(
          task_names_1.TASK_COMPILE_SOLIDITY_GET_COMPILATION_JOBS_FAILURE_REASONS,
          {
            compilationJobsCreationErrors,
          }
        );
        chai_1.assert.equal(
          reasons,
          `The compiler version for the following files is fixed through an override in your config file to a version that is incompatible with their Solidity version pragmas.

  * contracts/Foo1.sol (^0.5.0)

The Solidity version pragma statement in these files doesn't match any of the configured compilers in your config. Change the pragma or configure additional compiler versions in your hardhat config.

  * contracts/Foo2.sol (^0.5.0)

These files import other files that use a different and incompatible version of Solidity:

  * contracts/Foo3.sol (^0.5.0) imports contracts/Bar.sol (^0.6.0)

These files depend on other files that use a different and incompatible version of Solidity:

  * contracts/Foo5.sol (^0.5.0) depends on contracts/Bar.sol (^0.6.0)

These files and its dependencies cannot be compiled with your config. This can happen because they have incompatible Solidity pragmas, or don't match any of your configured Solidity compilers.

  * contracts/Foo4.sol

To learn more, run the command again with --verbose

Read about compiler configuration at https://hardhat.org/config
`
        );
      });
    });
  });
  describe("old versions of solidity", function () {
    (0, project_1.useFixtureProject)("old-solidity-versions");
    describe("project with an old version of solidity", function () {
      (0, environment_1.useEnvironment)("old-solidity-version.js");
      it("should throw an error", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0, errors_1.expectHardhatErrorAsync)(
            () =>
              __awaiter(this, void 0, void 0, function* () {
                yield this.env.run("compile");
              }),
            errors_list_1.ERRORS.BUILTIN_TASKS
              .COMPILE_TASK_UNSUPPORTED_SOLC_VERSION
          );
        });
      });
    });
    describe("project with an old version of solidity (multiple compilers)", function () {
      (0, environment_1.useEnvironment)(
        "old-solidity-version-multiple-compilers.js"
      );
      it("should throw an error", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0, errors_1.expectHardhatErrorAsync)(
            () =>
              __awaiter(this, void 0, void 0, function* () {
                yield this.env.run("compile");
              }),
            errors_list_1.ERRORS.BUILTIN_TASKS
              .COMPILE_TASK_UNSUPPORTED_SOLC_VERSION
          );
        });
      });
    });
    describe("project with an old version of solidity in an override", function () {
      (0, environment_1.useEnvironment)("old-solidity-version-in-override.js");
      it("should throw an error", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0, errors_1.expectHardhatErrorAsync)(
            () =>
              __awaiter(this, void 0, void 0, function* () {
                yield this.env.run("compile");
              }),
            errors_list_1.ERRORS.BUILTIN_TASKS
              .COMPILE_TASK_UNSUPPORTED_SOLC_VERSION
          );
        });
      });
    });
  });
  describe("project where two contracts import the same dependency", function () {
    (0, project_1.useFixtureProject)("consistent-build-info-names");
    (0, environment_1.useEnvironment)();
    it("should always produce the same build-info name", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        const buildInfos = getBuildInfos();
        chai_1.assert.lengthOf(buildInfos, 1);
        const expectedBuildInfoName = buildInfos[0];
        const runs = ci_info_1.default.isCI ? 10 : 100;
        for (let i = 0; i < runs; i++) {
          yield this.env.run("clean");
          yield this.env.run("compile");
          const newBuildInfos = getBuildInfos();
          chai_1.assert.lengthOf(newBuildInfos, 1);
          chai_1.assert.equal(newBuildInfos[0], expectedBuildInfoName);
        }
      });
    });
  });
  describe("project with files importing dependencies", function () {
    (0, project_1.useFixtureProject)("compilation-contract-with-deps");
    (0, environment_1.useEnvironment)();
    it("should not remove the build-info if it is still referenced by an external library", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        const pathToContractA = path.join("contracts", "A.sol");
        let contractA = fsExtra.readFileSync(pathToContractA, "utf-8");
        contractA = contractA.replace("contract A", "contract B");
        fsExtra.writeFileSync(pathToContractA, contractA, "utf-8");
        /**
         * The _validArtifacts variable is not cleared when running the compile
         * task twice in the same process, leading to an invalid output. This
         * issue is not encountered when running the task from the CLI as each
         * command operates as a separate process. To resolve this, the private
         * variable should be cleared after each run of the compile task.
         */
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.env.artifacts["_validArtifacts"] = [];
        yield this.env.run("compile");
        contractA = contractA.replace("contract B", "contract A");
        fsExtra.writeFileSync(pathToContractA, contractA, "utf-8");
        // asserts
        const pathToBuildInfoB = path.join(
          "artifacts",
          "contracts",
          "A.sol",
          "B.dbg.json"
        );
        assertBuildInfoExists(pathToBuildInfoB);
        const pathToBuildInfoConsole = path.join(
          "artifacts",
          "dependency",
          "contracts",
          "console.sol",
          "console.dbg.json"
        );
        assertBuildInfoExists(pathToBuildInfoConsole);
      });
    });
    it("should not remove the build-info if it is still referenced by another local contract", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        const pathToContractC = path.join("contracts", "C.sol");
        let contractC = fsExtra.readFileSync(pathToContractC, "utf-8");
        contractC = contractC.replace("contract C", "contract D");
        fsExtra.writeFileSync(pathToContractC, contractC, "utf-8");
        /**
         * The _validArtifacts variable is not cleared when running the compile
         * task twice in the same process, leading to an invalid output. This
         * issue is not encountered when running the task from the CLI as each
         * command operates as a separate process. To resolve this, the private
         * variable should be cleared after each run of the compile task.
         */
        // eslint-disable-next-line @typescript-eslint/dot-notation
        this.env.artifacts["_validArtifacts"] = [];
        yield this.env.run("compile");
        contractC = contractC.replace("contract D", "contract C");
        fsExtra.writeFileSync(pathToContractC, contractC, "utf-8");
        // asserts
        const pathToBuildInfoC = path.join(
          "artifacts",
          "contracts",
          "C.sol",
          "D.dbg.json"
        );
        assertBuildInfoExists(pathToBuildInfoC);
        const pathToBuildInfoE = path.join(
          "artifacts",
          "contracts",
          "E.sol",
          "E.dbg.json"
        );
        assertBuildInfoExists(pathToBuildInfoE);
      });
    });
  });
  describe("project with remappings", function () {
    (0, project_1.useFixtureProject)("compilation-remappings");
    (0, environment_1.useEnvironment)();
    it("should compile fine", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run("compile");
        assertFileExists(
          path.join("artifacts", "contracts", "A.sol", "A.json")
        );
        assertFileExists(path.join("artifacts", "foo", "Foo.sol", "Foo.json"));
      });
    });
  });
  describe("project with ambiguous remappings", function () {
    (0, project_1.useFixtureProject)("compilation-ambiguous-remappings");
    (0, environment_1.useEnvironment)();
    it("should throw an error", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => this.env.run("compile"), errors_list_1.ERRORS.RESOLVER.AMBIGUOUS_SOURCE_NAMES, /Two different source names \('\w+\/Foo.sol' and '\w+\/Foo.sol'\) resolve to the same file/);
      });
    });
  });
});
