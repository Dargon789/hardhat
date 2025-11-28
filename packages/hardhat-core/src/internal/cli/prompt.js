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
exports.confirmHHVSCodeInstallation =
  exports.confirmTelemetryConsent =
  exports.confirmProjectCreation =
  exports.confirmRecommendedDepsInstallation =
    void 0;
function createConfirmationPrompt(name, message) {
  return {
    type: "confirm",
    name,
    message,
    initial: "y",
    default: "(Y/n)",
    isTrue(input) {
      if (typeof input === "string") {
        return input.toLowerCase() === "y";
      }
      return input;
    },
    isFalse(input) {
      if (typeof input === "string") {
        return input.toLowerCase() === "n";
      }
      return input;
    },
    format() {
      const that = this;
      const value = that.value === true ? "y" : "n";
      if (that.state.submitted === true) {
        return that.styles.submitted(value);
      }
      return value;
    },
  };
}
function confirmRecommendedDepsInstallation(depsToInstall, packageManager) {
  return __awaiter(this, void 0, void 0, function* () {
    const { default: enquirer } = yield Promise.resolve().then(() =>
      __importStar(require("enquirer"))
    );
    let responses;
    try {
      responses = yield enquirer.prompt([
        createConfirmationPrompt(
          "shouldInstallPlugin",
          `Do you want to install this sample project's dependencies with ${packageManager} (${Object.keys(
            depsToInstall
          ).join(" ")})?`
        ),
      ]);
    } catch (e) {
      if (e === "") {
        return false;
      }
      // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
      throw e;
    }
    return responses.shouldInstallPlugin;
  });
}
exports.confirmRecommendedDepsInstallation = confirmRecommendedDepsInstallation;
function confirmProjectCreation() {
  return __awaiter(this, void 0, void 0, function* () {
    const enquirer = require("enquirer");
    return enquirer.prompt([
      {
        name: "projectRoot",
        type: "input",
        initial: process.cwd(),
        message: "Hardhat project root:",
      },
      createConfirmationPrompt(
        "shouldAddGitIgnore",
        "Do you want to add a .gitignore?"
      ),
    ]);
  });
}
exports.confirmProjectCreation = confirmProjectCreation;
function confirmTelemetryConsent() {
  return __awaiter(this, void 0, void 0, function* () {
    return confirmationPromptWithTimeout(
      "telemetryConsent",
      "Help us improve Hardhat with anonymous crash reports & basic usage data?"
    );
  });
}
exports.confirmTelemetryConsent = confirmTelemetryConsent;
/**
 * true = install ext
 * false = don't install and don't ask again
 * undefined = we couldn't confirm if the extension is installed or not
 */
function confirmHHVSCodeInstallation() {
  return __awaiter(this, void 0, void 0, function* () {
    return confirmationPromptWithTimeout(
      "shouldInstallExtension",
      "Would you like to install the Hardhat for Visual Studio Code extension? It adds advanced editing assistance for Solidity to VSCode"
    );
  });
}
exports.confirmHHVSCodeInstallation = confirmHHVSCodeInstallation;
function confirmationPromptWithTimeout(
  name,
  message,
  timeoutMilliseconds = 10000
) {
  return __awaiter(this, void 0, void 0, function* () {
    try {
      const enquirer = require("enquirer");
      const prompt = new enquirer.prompts.Confirm(
        createConfirmationPrompt(name, message)
      );
      let timeout;
      const timeoutPromise = new Promise((resolve) => {
        timeout = setTimeout(resolve, timeoutMilliseconds);
      });
      const result = yield Promise.race([prompt.run(), timeoutPromise]);
      clearTimeout(timeout);
      if (result === undefined) {
        yield prompt.cancel();
      }
      return result;
    } catch (e) {
      if (e === "") {
        return undefined;
      }
      // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
      throw e;
    }
  });
}
