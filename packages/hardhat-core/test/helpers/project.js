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
exports.getFixtureProjectPath = exports.useFixtureProject = void 0;
const fsExtra = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const fs_utils_1 = require("../../src/internal/util/fs-utils");
/**
 * This helper adds mocha hooks to run the tests inside one of the projects
 * from test/fixture-projects.
 *
 * @param projectName The base name of the folder with the project to use.
 */
function useFixtureProject(projectName) {
  let projectPath;
  let prevWorkingDir;
  before(() =>
    __awaiter(this, void 0, void 0, function* () {
      projectPath = yield getFixtureProjectPath(projectName);
    })
  );
  before(() => {
    prevWorkingDir = process.cwd();
    process.chdir(projectPath);
  });
  after(() => {
    process.chdir(prevWorkingDir);
  });
}
exports.useFixtureProject = useFixtureProject;
function getFixtureProjectPath(projectName) {
  return __awaiter(this, void 0, void 0, function* () {
    const normalizedProjectName = projectName.replaceAll(
      "/",
      path_1.default.sep
    );
    const projectPath = path_1.default.join(
      __dirname,
      "..",
      "fixture-projects",
      normalizedProjectName
    );
    if (!(yield fsExtra.pathExists(projectPath))) {
      throw new Error(`Fixture project ${projectName} doesn't exist`);
    }
    return (0, fs_utils_1.getRealPath)(projectPath);
  });
}
exports.getFixtureProjectPath = getFixtureProjectPath;
