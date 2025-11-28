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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fsExtra = __importStar(require("fs-extra"));
const path = __importStar(require("path"));
const artifacts_1 = require("../../src/internal/artifacts");
const errors_list_1 = require("../../src/internal/core/errors-list");
const environment_1 = require("../helpers/environment");
const errors_1 = require("../helpers/errors");
const project_1 = require("../helpers/project");
describe("run task (CJS)", function () {
  (0, project_1.useFixtureProject)("project-with-scripts");
  (0, environment_1.useEnvironment)();
  it("Should fail if a script doesn't exist", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0,
      errors_1.expectHardhatErrorAsync)(() => this.env.run("run", { script: "./does-not-exist", noCompile: true }), errors_list_1.ERRORS.BUILTIN_TASKS.RUN_FILE_NOT_FOUND);
    });
  });
  it("Should run the scripts to completion", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./async-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
  it("Should compile before running", function () {
    return __awaiter(this, void 0, void 0, function* () {
      if (yield fsExtra.pathExists("cache")) {
        yield fsExtra.remove("cache");
      }
      if (yield fsExtra.pathExists("artifacts")) {
        yield fsExtra.remove("artifacts");
      }
      yield this.env.run("run", {
        script: "./successful-script.js",
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
      const artifacts = new artifacts_1.Artifacts(
        path.join(process.cwd(), "artifacts")
      );
      const files = yield artifacts.getArtifactPaths();
      const expectedFile = path.join(
        process.cwd(),
        "artifacts/contracts/a.sol/A.json"
      );
      chai_1.assert.sameMembers(files, [expectedFile]);
      yield fsExtra.remove("artifacts");
    });
  });
  it("Shouldn't compile if asked not to", function () {
    return __awaiter(this, void 0, void 0, function* () {
      if (yield fsExtra.pathExists("cache")) {
        yield fsExtra.remove("cache");
      }
      if (yield fsExtra.pathExists("artifacts")) {
        yield fsExtra.remove("artifacts");
      }
      yield this.env.run("run", {
        script: "./successful-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
      chai_1.assert.isFalse(yield fsExtra.pathExists("artifacts"));
    });
  });
  it("Should return the script's status code on success", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./successful-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
  it("Should return the script's status code on failure", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./failing-script.js",
        noCompile: true,
      });
      chai_1.assert.notEqual(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
});
describe("run task (ESM)", function () {
  (0, project_1.useFixtureProject)("esm-project-with-scripts");
  (0, environment_1.useEnvironment)();
  it("Should fail if a script doesn't exist", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield (0,
      errors_1.expectHardhatErrorAsync)(() => this.env.run("run", { script: "./does-not-exist", noCompile: true }), errors_list_1.ERRORS.BUILTIN_TASKS.RUN_FILE_NOT_FOUND);
    });
  });
  it("Should run the scripts to completion", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./async-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
  it("Should compile before running", function () {
    return __awaiter(this, void 0, void 0, function* () {
      if (yield fsExtra.pathExists("cache")) {
        yield fsExtra.remove("cache");
      }
      if (yield fsExtra.pathExists("artifacts")) {
        yield fsExtra.remove("artifacts");
      }
      yield this.env.run("run", {
        script: "./successful-script.js",
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
      const artifacts = new artifacts_1.Artifacts(
        path.join(process.cwd(), "artifacts")
      );
      const files = yield artifacts.getArtifactPaths();
      const expectedFile = path.join(
        process.cwd(),
        "artifacts/contracts/a.sol/A.json"
      );
      chai_1.assert.sameMembers(files, [expectedFile]);
      yield fsExtra.remove("artifacts");
    });
  });
  it("Shouldn't compile if asked not to", function () {
    return __awaiter(this, void 0, void 0, function* () {
      if (yield fsExtra.pathExists("cache")) {
        yield fsExtra.remove("cache");
      }
      if (yield fsExtra.pathExists("artifacts")) {
        yield fsExtra.remove("artifacts");
      }
      yield this.env.run("run", {
        script: "./successful-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
      chai_1.assert.isFalse(yield fsExtra.pathExists("artifacts"));
    });
  });
  it("Should return the script's status code on success", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./successful-script.js",
        noCompile: true,
      });
      chai_1.assert.equal(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
  it("Should return the script's status code on failure", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run("run", {
        script: "./failing-script.js",
        noCompile: true,
      });
      chai_1.assert.notEqual(process.exitCode, 0);
      process.exitCode = undefined;
    });
  });
});
