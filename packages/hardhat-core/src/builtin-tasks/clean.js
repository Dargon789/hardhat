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
const fs_extra_1 = __importDefault(require("fs-extra"));
const config_env_1 = require("../internal/core/config/config-env");
const global_dir_1 = require("../internal/util/global-dir");
const task_names_1 = require("./task-names");
(0, config_env_1.subtask)(task_names_1.TASK_CLEAN_GLOBAL, () =>
  __awaiter(void 0, void 0, void 0, function* () {
    const globalCacheDir = yield (0, global_dir_1.getCacheDir)();
    yield fs_extra_1.default.emptyDir(globalCacheDir);
  })
);
(0, config_env_1.task)(
  task_names_1.TASK_CLEAN,
  "Clears the cache and deletes all artifacts"
)
  .addFlag("global", "Clear the global cache")
  .setAction(({ global }, { config, run, artifacts }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      var _a;
      if (global) {
        return run(task_names_1.TASK_CLEAN_GLOBAL);
      }
      yield fs_extra_1.default.emptyDir(config.paths.cache);
      yield fs_extra_1.default.remove(config.paths.artifacts);
      (_a = artifacts.clearCache) === null || _a === void 0
        ? void 0
        : _a.call(artifacts);
    })
  );
