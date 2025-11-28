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
const chai_1 = require("chai");
const fs_1 = __importStar(require("fs"));
const sinon_1 = __importDefault(require("sinon"));
const picocolors_1 = __importDefault(require("picocolors"));
const fs_extra_1 = require("fs-extra");
const os_1 = require("os");
const task_names_1 = require("../../src/builtin-tasks/task-names");
const packageInfo_1 = require("../../src/internal/util/packageInfo");
const environment_1 = require("../helpers/environment");
const project_1 = require("../helpers/project");
const compilation_1 = require("../helpers/compilation");
function getContractsOrder(flattenedFiles) {
  const CONTRACT_REGEX = /\s*contract(\s+)(\w)/gm;
  const matches = flattenedFiles.match(CONTRACT_REGEX);
  return matches.map((m) => m.replace("contract", "").trim());
}
function getExpectedSol(fileName = "expected.sol") {
  return __awaiter(this, void 0, void 0, function* () {
    const expected = fs_1.default.readFileSync(fileName, "utf8");
    const hardhatVersion = (yield (0, packageInfo_1.getPackageJson)()).version;
    return expected.replace("{HARDHAT_VERSION}", hardhatVersion).trim();
  });
}
function assertFlattenedFilesResult(flattenedFiles) {
  return __awaiter(this, void 0, void 0, function* () {
    // Check that the flattened file compiles correctly
    yield (0, compilation_1.compileLiteral)(flattenedFiles);
    const expected = yield getExpectedSol();
    chai_1.assert.equal(flattenedFiles, expected);
  });
}
describe("Flatten task", () => {
  (0, environment_1.useEnvironment)();
  describe("When there no contracts", function () {
    (0, project_1.useFixtureProject)("default-config-project");
    it("should return empty string", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const flattenedFiles = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE
        );
        chai_1.assert.equal(flattenedFiles.length, 0);
      });
    });
  });
  describe("When has contracts", function () {
    (0, project_1.useFixtureProject)("flatten-task/contracts-project");
    it("should flatten files sorted correctly", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const flattenedFiles = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE
        );
        chai_1.assert.deepEqual(getContractsOrder(flattenedFiles), [
          "C",
          "B",
          "A",
        ]);
      });
    });
  });
  describe("When has contracts with name clash", function () {
    (0, project_1.useFixtureProject)(
      "flatten-task/contracts-nameclash-project"
    );
    it("should flatten files sorted correctly with repetition", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const flattenedFiles = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE
        );
        chai_1.assert.deepEqual(getContractsOrder(flattenedFiles), [
          "C",
          "B",
          "A",
          "C",
        ]);
      });
    });
  });
  describe("Flattening only some files", function () {
    (0, project_1.useFixtureProject)("flatten-task/contracts-project");
    it("Should accept a list of files, and only flatten those and their dependencies", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const cFlattened = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE,
          {
            files: ["contracts/C.sol"],
          }
        );
        chai_1.assert.deepEqual(getContractsOrder(cFlattened), ["C"]);
        const bFlattened = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE,
          {
            files: ["contracts/B.sol"],
          }
        );
        chai_1.assert.deepEqual(getContractsOrder(bFlattened), ["C", "B"]);
        const baFlattened = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE,
          {
            files: ["contracts/B.sol", "contracts/A.sol"],
          }
        );
        chai_1.assert.deepEqual(getContractsOrder(baFlattened), [
          "C",
          "B",
          "A",
        ]);
      });
    });
  });
  describe("When project has multiline imports", function () {
    (0, project_1.useFixtureProject)("flatten-task/multiline-import-project");
    it("should not include multiline imports", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const flattenedFiles = yield this.env.run(
          task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE
        );
        chai_1.assert.isFalse(flattenedFiles.includes("} from"));
      });
    });
  });
  describe("project where two contracts import the same dependency", function () {
    (0, project_1.useFixtureProject)("consistent-build-info-names");
    (0, environment_1.useEnvironment)();
    it("should always produce the same flattened file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const runs = 100;
        const flattenedFiles = [];
        for (let i = 0; i < runs; i++) {
          const flattened = yield this.env.run(
            task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE
          );
          flattenedFiles.push(flattened);
        }
        for (let i = 0; i + 1 < runs; i++) {
          chai_1.assert.equal(flattenedFiles[i], flattenedFiles[i + 1]);
        }
      });
    });
  });
  describe("SPDX licenses and pragma abicoder directives", () => {
    describe("Flatten files that not contain SPDX licenses or pragma directives", () => {
      (0, project_1.useFixtureProject)(
        "flatten-task/contracts-no-spdx-no-pragma"
      );
      it("should successfully flatten and compile the files", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const [flattenedFiles, metadata] = yield this.env.run(
            task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
          );
          yield assertFlattenedFilesResult(flattenedFiles);
          chai_1.assert.deepEqual(metadata, {
            filesWithoutLicenses: ["contracts/A.sol", "contracts/B.sol"],
            pragmaDirective: "",
            filesWithoutPragmaDirectives: [
              "contracts/A.sol",
              "contracts/B.sol",
            ],
            filesWithDifferentPragmaDirectives: [],
          });
        });
      });
    });
    describe("Flatten files that contain SPDX licenses", () => {
      describe("Files contain one single license per file", () => {
        describe("Files contain same licenses", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-spdx-same-licenses"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: [],
                pragmaDirective: "",
                filesWithoutPragmaDirectives: [
                  "contracts/A.sol",
                  "contracts/B.sol",
                ],
                filesWithDifferentPragmaDirectives: [],
              });
            });
          });
        });
        describe("Files contain different licenses", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-spdx-different-licenses"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: [],
                pragmaDirective: "",
                filesWithoutPragmaDirectives: [
                  "contracts/A.sol",
                  "contracts/B.sol",
                ],
                filesWithDifferentPragmaDirectives: [],
              });
            });
          });
        });
      });
      describe("Files contain multiple licenses", () => {
        describe("Files contain multiple same licenses", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-spdx-same-multiple-licenses"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: [],
                pragmaDirective: "",
                filesWithoutPragmaDirectives: [
                  "contracts/A.sol",
                  "contracts/B.sol",
                ],
                filesWithDifferentPragmaDirectives: [],
              });
            });
          });
        });
        describe("Files contain multiple different licenses", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-spdx-different-multiple-licenses"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: [],
                pragmaDirective: "",
                filesWithoutPragmaDirectives: [
                  "contracts/A.sol",
                  "contracts/B.sol",
                  "contracts/C.sol",
                ],
                filesWithDifferentPragmaDirectives: [],
              });
            });
          });
        });
      });
    });
    describe("Flatten files that contain pragma abicoder directives", () => {
      describe("Files contain one single pragma directive per file", () => {
        describe("Files contain same pragma directive", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-pragma-same-directives"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: ["contracts/A.sol", "contracts/B.sol"],
                pragmaDirective: "pragma abicoder v1",
                filesWithoutPragmaDirectives: [],
                filesWithDifferentPragmaDirectives: [],
              });
            });
          });
        });
        describe("Files contain different pragma directives", () => {
          (0, project_1.useFixtureProject)(
            "flatten-task/contracts-pragma-different-directives"
          );
          it("should successfully flatten and compile the files", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const [flattenedFiles, metadata] = yield this.env.run(
                task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
              );
              yield assertFlattenedFilesResult(flattenedFiles);
              chai_1.assert.deepEqual(metadata, {
                filesWithoutLicenses: ["contracts/A.sol", "contracts/B.sol"],
                pragmaDirective: "pragma experimental ABIEncoderV2",
                filesWithoutPragmaDirectives: [],
                filesWithDifferentPragmaDirectives: ["contracts/B.sol"],
              });
            });
          });
        });
      });
      describe("Files contain multiple pragma directives", () => {
        (0, project_1.useFixtureProject)(
          "flatten-task/contracts-pragma-multiple-directives"
        );
        it("should successfully flatten and compile the files", function () {
          return __awaiter(this, void 0, void 0, function* () {
            const [flattenedFiles, metadata] = yield this.env.run(
              task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
            );
            yield assertFlattenedFilesResult(flattenedFiles);
            chai_1.assert.deepEqual(metadata, {
              filesWithoutLicenses: ["contracts/A.sol", "contracts/B.sol"],
              pragmaDirective: "pragma abicoder v2",
              filesWithoutPragmaDirectives: [],
              filesWithDifferentPragmaDirectives: ["contracts/A.sol"],
            });
          });
        });
      });
    });
    describe("Files contains several SPDX licenses and pragma directives", () => {
      (0, project_1.useFixtureProject)(
        "flatten-task/contracts-spdx-licenses-and-pragma-directives"
      );
      it("should successfully flatten and compile the files", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const [flattenedFiles, metadata] = yield this.env.run(
            task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
          );
          yield assertFlattenedFilesResult(flattenedFiles);
          chai_1.assert.deepEqual(metadata, {
            filesWithoutLicenses: [],
            pragmaDirective: "pragma abicoder v2",
            filesWithoutPragmaDirectives: [],
            filesWithDifferentPragmaDirectives: ["contracts/A.sol"],
          });
        });
      });
    });
    describe("Check regex rules in files that contains several SPDX licenses and pragma directives", () => {
      (0, project_1.useFixtureProject)(
        "flatten-task/contracts-regex-spdx-licenses-and-pragma-directives"
      );
      it("should successfully flatten and compile the files", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const [flattenedFiles, metadata] = yield this.env.run(
            task_names_1.TASK_FLATTEN_GET_FLATTENED_SOURCE_AND_METADATA
          );
          yield assertFlattenedFilesResult(flattenedFiles);
          chai_1.assert.deepEqual(metadata, {
            filesWithoutLicenses: [],
            pragmaDirective: "pragma abicoder v2",
            filesWithoutPragmaDirectives: [],
            filesWithDifferentPragmaDirectives: ["contracts/B.sol"],
          });
        });
      });
    });
  });
  describe("TASK_FLATTEN", () => {
    let spyFunctionConsoleLog;
    let spyFunctionConsoleWarn;
    beforeEach(() => {
      spyFunctionConsoleWarn = sinon_1.default.stub(console, "warn");
      spyFunctionConsoleLog = sinon_1.default.stub(console, "log");
    });
    afterEach(() => {
      spyFunctionConsoleLog.restore();
      spyFunctionConsoleWarn.restore();
    });
    (0, project_1.useFixtureProject)("flatten-task/contracts-task-flatten");
    it("should console log the flattened files and the warnings about missing licenses and pragma directives", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run(task_names_1.TASK_FLATTEN);
        const expectedOutput = yield getExpectedSol();
        (0, chai_1.assert)(spyFunctionConsoleLog.calledWith(expectedOutput));
        (0,
        chai_1.assert)(spyFunctionConsoleWarn.calledWith(picocolors_1.default.yellow(`\nThe following file(s) do NOT specify SPDX licenses: contracts/A.sol, contracts/B.sol, contracts/C.sol`)));
        (0,
        chai_1.assert)(spyFunctionConsoleWarn.calledWith(picocolors_1.default.yellow(`\nPragma abicoder directives are defined in some files, but they are not defined in the following ones: contracts/A.sol, contracts/B.sol`)));
        (0,
        chai_1.assert)(spyFunctionConsoleWarn.calledWith(picocolors_1.default.yellow(`\nThe flattened file is using the pragma abicoder directive 'pragma abicoder v2' but these files have a different pragma abicoder directive: contracts/C.sol`)));
      });
    });
    it("should not console warn because licenses and pragma directives are specified", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield this.env.run(task_names_1.TASK_FLATTEN, {
          files: ["contracts/D.sol"],
        });
        (0, chai_1.assert)(!spyFunctionConsoleWarn.called);
      });
    });
    it("should write to an output file when the parameter output is specified", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const outputFile = `${(0, os_1.tmpdir)()}/flatten.sol`;
        try {
          yield this.env.run(task_names_1.TASK_FLATTEN, {
            files: ["contracts/A.sol", "contracts/D.sol"],
            output: outputFile,
          });
          const expected = yield getExpectedSol();
          const actual = (0, fs_1.readFileSync)(outputFile, "utf8");
          chai_1.assert.equal(actual, expected);
        } finally {
          (0, fs_extra_1.removeSync)(outputFile);
        }
      });
    });
    describe("No contracts to flatten", () => {
      (0, project_1.useFixtureProject)("flatten-task/no-contracts");
      it("should not throw an error when metadata is null", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run(task_names_1.TASK_FLATTEN);
        });
      });
    });
  });
});
