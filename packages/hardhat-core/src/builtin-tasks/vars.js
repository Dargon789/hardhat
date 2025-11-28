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
const errors_1 = require("../internal/core/errors");
const config_env_1 = require("../internal/core/config/config-env");
const errors_list_1 = require("../internal/core/errors-list");
const varsScope = (0, config_env_1.scope)(
  "vars",
  "Manage your configuration variables"
);
varsScope
  .task("set", "Set the value of a configuration variable")
  .addPositionalParam("var", "The name of the variable")
  .addOptionalPositionalParam(
    "value",
    "The value to store. Omit to be prompted for it."
  )
  .setAction(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
      );
    })
  );
varsScope
  .task("get", "Get the value of a configuration variable")
  .addPositionalParam("var", "The name of the variable")
  .setAction(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
      );
    })
  );
varsScope.task("list", "List all the configuration variables").setAction(() =>
  __awaiter(void 0, void 0, void 0, function* () {
    throw new errors_1.HardhatError(
      errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
    );
  })
);
varsScope
  .task("delete", "Delete a configuration variable")
  .addPositionalParam("var", "The name of the variable")
  .setAction(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
      );
    })
  );
varsScope
  .task(
    "path",
    "Show the path of the file where all the configuration variables are stored"
  )
  .setAction(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
      );
    })
  );
varsScope
  .task(
    "setup",
    "Show how to setup the configuration variables used by this project"
  )
  .setAction(() =>
    __awaiter(void 0, void 0, void 0, function* () {
      throw new errors_1.HardhatError(
        errors_list_1.ERRORS.VARS.ONLY_MANAGED_IN_CLI
      );
    })
  );
