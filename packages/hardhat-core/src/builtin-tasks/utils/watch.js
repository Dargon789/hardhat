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
exports.watchCompilerOutput = void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const path = __importStar(require("path"));
const constants_1 = require("../../internal/constants");
const reporter_1 = require("../../internal/sentry/reporter");
const log = (0, debug_1.default)("hardhat:core:compilation-watcher");
function watchCompilerOutput(provider, paths) {
  return __awaiter(this, void 0, void 0, function* () {
    const chokidar = yield Promise.resolve().then(() =>
      __importStar(require("chokidar"))
    );
    const buildInfoDir = path.join(
      paths.artifacts,
      constants_1.BUILD_INFO_DIR_NAME
    );
    const addCompilationResult = (buildInfo) =>
      __awaiter(this, void 0, void 0, function* () {
        try {
          log("Adding new compilation result to the node");
          const { input, output, solcVersion } =
            yield fs_extra_1.default.readJSON(buildInfo, {
              encoding: "utf8",
            });
          yield provider.request({
            method: "hardhat_addCompilationResult",
            params: [solcVersion, input, output],
          });
        } catch (error) {
          console.warn(
            picocolors_1.default.yellow(
              "There was a problem adding the new compiler result. Run Hardhat with --verbose to learn more."
            )
          );
          log(
            "Last compilation result couldn't be added. Please report this to help us improve Hardhat.\n",
            error
          );
          if (error instanceof Error) {
            reporter_1.Reporter.reportError(error);
          }
        }
      });
    log(`Watching changes on '${buildInfoDir}'`);
    return chokidar
      .watch(buildInfoDir, {
        ignoreInitial: true,
        awaitWriteFinish: {
          stabilityThreshold: 250,
          pollInterval: 50,
        },
      })
      .on("add", addCompilationResult);
  });
}
exports.watchCompilerOutput = watchCompilerOutput;
