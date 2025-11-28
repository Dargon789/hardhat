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
require("mocha");
const fs_extra_1 = __importDefault(require("fs-extra"));
const os = __importStar(require("os"));
const sinon_1 = __importDefault(require("sinon"));
const chai_1 = require("chai");
const picocolors_1 = __importDefault(require("picocolors"));
const enquirer_1 = __importDefault(require("enquirer"));
const context_1 = require("../../../../src/internal/context");
const vars_1 = require("../../../../src/internal/cli/vars");
const reset_1 = require("../../../../src/internal/reset");
const globalDir = __importStar(
  require("../../../../src/internal/util/global-dir")
);
const project_1 = require("../../../helpers/project");
describe("vars", () => {
  describe("handleVars", () => {
    const TMP_FILE_PATH = `${os.tmpdir()}/test-vars.json`;
    let ctx;
    let sandbox;
    let spyConsoleLog;
    let spyConsoleWarn;
    let stubGetVarsFilePath;
    before(() => {
      // Stub functions
      sandbox = sinon_1.default.createSandbox();
      spyConsoleLog = sandbox.stub(console, "log");
      spyConsoleWarn = sandbox.stub(console, "warn");
      stubGetVarsFilePath = sandbox.stub(globalDir, "getVarsFilePath");
      stubGetVarsFilePath.returns(TMP_FILE_PATH);
    });
    after(() => {
      spyConsoleLog.restore();
      spyConsoleWarn.restore();
      stubGetVarsFilePath.restore();
    });
    afterEach(() => {
      spyConsoleLog.reset();
      spyConsoleWarn.reset();
    });
    beforeEach(() => {
      fs_extra_1.default.removeSync(TMP_FILE_PATH);
      ctx = context_1.HardhatContext.createHardhatContext();
      ctx.varsManager.set("key1", "val1");
      ctx.varsManager.set("key2", "val2");
      ctx.varsManager.set("key3", "val3");
      ctx.varsManager.set("key4", "val4");
      ctx.varsManager.set("key5", "val5");
    });
    afterEach(() => {
      (0, reset_1.resetHardhatContext)();
    });
    describe("set", () => {
      it("should set a new value when both key and value are passed", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "set", "newKey", "newVal"],
            undefined
          );
          (0, chai_1.expect)(ctx.varsManager.get("newKey")).equals("newVal");
          (0, chai_1.expect)(code).equals(0);
          if (process.stdout.isTTY) {
            (0, chai_1.assert)(
              spyConsoleWarn.calledWith(
                `The configuration variable has been stored in ${TMP_FILE_PATH}`
              )
            );
          }
        }));
      describe("cli user prompt", () => {
        let stubUserPrompt;
        before(() => {
          stubUserPrompt = sandbox.stub(enquirer_1.default.prototype, "prompt");
        });
        after(() => {
          stubUserPrompt.restore();
        });
        afterEach(() => {
          stubUserPrompt.reset();
        });
        it("should set a new value when only the key is passed (user cli prompt expected)", () =>
          __awaiter(void 0, void 0, void 0, function* () {
            stubUserPrompt.resolves({ value: "valueFromCli" });
            const code = yield (0, vars_1.handleVars)(
              ["vars", "set", "newKey"],
              undefined
            );
            (0, chai_1.expect)(ctx.varsManager.get("newKey")).equals(
              "valueFromCli"
            );
            (0, chai_1.expect)(code).equals(0);
            if (process.stdout.isTTY) {
              (0, chai_1.assert)(
                spyConsoleWarn.calledWith(
                  `The configuration variable has been stored in ${TMP_FILE_PATH}`
                )
              );
            }
          }));
        it("should throw an error because the cli user prompt for the value is not valid", () =>
          __awaiter(void 0, void 0, void 0, function* () {
            stubUserPrompt.resolves({ value: "" });
            yield (0, chai_1.expect)(
              (0, vars_1.handleVars)(["vars", "set", "newKey"], undefined)
            ).to.be.rejectedWith(
              "HH1203: A configuration variable cannot have an empty value."
            );
            (0, chai_1.expect)(ctx.varsManager.get("newKey")).equals(undefined);
          }));
      });
      it("should throw an error when the key is not valid", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          yield (0, chai_1.expect)(
            (0, vars_1.handleVars)(
              ["vars", "set", "0invalidKey", "newVal"],
              undefined
            )
          ).to.be.rejectedWith(
            "HH1202: Invalid name for a configuration variable: '0invalidKey'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number."
          );
          (0, chai_1.expect)(ctx.varsManager.get("0invalidKey")).equals(
            undefined
          );
        }));
    });
    describe("get", () => {
      it("should get the value associated to the key", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "get", "key1"],
            undefined
          );
          (0, chai_1.assert)(spyConsoleLog.calledWith("val1"));
          (0, chai_1.expect)(code).equals(0);
        }));
      it("should not get any value because the key is not defined", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "get", "nonExistingKey"],
            undefined
          );
          (0,
          chai_1.assert)(spyConsoleWarn.calledWith(picocolors_1.default.yellow(`The configuration variable 'nonExistingKey' is not set in ${TMP_FILE_PATH}`)));
          (0, chai_1.expect)(code).equals(1);
        }));
    });
    describe("list", () => {
      it("should list all the keys", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "list"],
            undefined
          );
          (0, chai_1.expect)(spyConsoleLog.callCount).to.equal(5);
          (0, chai_1.assert)(spyConsoleLog.getCall(0).calledWith("key1"));
          (0, chai_1.assert)(spyConsoleLog.getCall(1).calledWith("key2"));
          (0, chai_1.assert)(spyConsoleLog.getCall(2).calledWith("key3"));
          (0, chai_1.assert)(spyConsoleLog.getCall(3).calledWith("key4"));
          (0, chai_1.assert)(spyConsoleLog.getCall(4).calledWith("key5"));
          (0, chai_1.expect)(code).equals(0);
          if (process.stdout.isTTY) {
            (0, chai_1.assert)(
              spyConsoleWarn.calledWith(
                `\nAll configuration variables are stored in ${TMP_FILE_PATH}`
              )
            );
          }
        }));
      it("should not list any key because they are not defined", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          ctx.varsManager.delete("key1");
          ctx.varsManager.delete("key2");
          ctx.varsManager.delete("key3");
          ctx.varsManager.delete("key4");
          ctx.varsManager.delete("key5");
          const code = yield (0, vars_1.handleVars)(
            ["vars", "list"],
            undefined
          );
          (0, chai_1.expect)(code).equals(0);
          if (process.stdout.isTTY) {
            (0, chai_1.assert)(
              spyConsoleWarn.calledWith(
                picocolors_1.default.yellow(
                  `There are no configuration variables stored in ${TMP_FILE_PATH}`
                )
              )
            );
          }
        }));
    });
    describe("delete", () => {
      it("should successfully delete a key and its value", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "delete", "key1"],
            undefined
          );
          (0, chai_1.assert)(ctx.varsManager.get("key1") === undefined);
          (0, chai_1.expect)(code).equals(0);
          if (process.stdout.isTTY) {
            (0, chai_1.assert)(
              spyConsoleWarn.calledWith(
                `The configuration variable was deleted from ${TMP_FILE_PATH}`
              )
            );
          }
        }));
      it("should show a warning because the key to delete cannot be found", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "delete", "nonExistingKey"],
            undefined
          );
          (0,
          chai_1.assert)(spyConsoleWarn.calledWith(picocolors_1.default.yellow(`There is no configuration variable 'nonExistingKey' to delete from ${TMP_FILE_PATH}`)));
          (0, chai_1.expect)(code).equals(1);
        }));
    });
    describe("path", () => {
      it("should show the path where the key-value pairs are stored", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const code = yield (0, vars_1.handleVars)(
            ["vars", "path"],
            undefined
          );
          (0, chai_1.assert)(spyConsoleLog.calledWith(TMP_FILE_PATH));
          (0, chai_1.expect)(code).equals(0);
        }));
    });
    describe("parsing errors", () => {
      it("should throw an error if the command is not 'vars'", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          yield (0, chai_1.expect)(
            (0, vars_1.handleVars)(["nonExisting", "list"], undefined)
          ).to.be.rejectedWith("HH303: Unrecognized task 'nonExisting'");
        }));
      it("should throw an error if the vars action does not exist", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          yield (0, chai_1.expect)(
            (0, vars_1.handleVars)(["vars", "nonExistingAction"], undefined)
          ).to.be.rejectedWith(
            "HH315: Unrecognized task 'nonExistingAction' under scope 'vars'"
          );
        }));
    });
    describe("setup", () => {
      describe("all key-value pairs are set", () => {
        (0, project_1.useFixtureProject)("vars/setup-filled");
        it("should say that alle the key-value pairs are set", () =>
          __awaiter(void 0, void 0, void 0, function* () {
            const code = yield (0, vars_1.handleVars)(
              ["vars", "setup"],
              undefined
            );
            const consoleLogCalls = spyConsoleLog.getCalls();
            chai_1.assert.include(
              consoleLogCalls[0].args[0],
              "There are no configuration variables that need to be set for this project"
            );
            chai_1.assert.include(
              consoleLogCalls[2].args[0],
              "Configuration variables already set:"
            );
            chai_1.assert.include(consoleLogCalls[4].args[0], "Mandatory:");
            chai_1.assert.include(consoleLogCalls[5].args[0], "key1");
            chai_1.assert.include(consoleLogCalls[7].args[0], "Optional:");
            chai_1.assert.include(consoleLogCalls[8].args[0], "key2");
            (0, chai_1.expect)(code).equals(0);
          }));
      });
      describe("there are key-value pairs to fill", () => {
        const ENV_VAR_PREFIX = "HARDHAT_VAR_";
        const KEY1 = "KEY_ENV_1";
        const KEY2 = "KEY_ENV_2";
        beforeEach(() => {
          process.env[`${ENV_VAR_PREFIX}${KEY1}`] = "val1";
          process.env[`${ENV_VAR_PREFIX}${KEY2}`] = "val2";
        });
        afterEach(() => {
          delete process.env[`${ENV_VAR_PREFIX}${KEY1}`];
          delete process.env[`${ENV_VAR_PREFIX}${KEY2}`];
        });
        (0, project_1.useFixtureProject)("vars/setup-to-fill");
        it("should show the configuration variables that need to be filled, including env variables", () =>
          __awaiter(void 0, void 0, void 0, function* () {
            const code = yield (0, vars_1.handleVars)(
              ["vars", "setup"],
              undefined
            );
            const consoleLogCalls = spyConsoleLog.getCalls();
            chai_1.assert.include(
              consoleLogCalls[0].args[0],
              "The following configuration variables need to be set:"
            );
            chai_1.assert.include(
              consoleLogCalls[1].args[0],
              "npx hardhat vars set nonExistingKey3\n  npx hardhat vars set nonExistingKey5\n  npx hardhat vars set KEY_ENV_1"
            );
            // optional keys
            chai_1.assert.include(
              consoleLogCalls[3].args[0],
              "The following configuration variables are optional:"
            );
            chai_1.assert.include(
              consoleLogCalls[4].args[0],
              "npx hardhat vars set nonExistingKey1\n  npx hardhat vars set nonExistingKey4\n  npx hardhat vars set KEY_ENV_2\n  npx hardhat vars set nonExistingKey2"
            );
            // show already set variables
            chai_1.assert.include(
              consoleLogCalls[6].args[0],
              "Configuration variables already set:"
            );
            // mandatory variables
            chai_1.assert.include(consoleLogCalls[8].args[0], "Mandatory:");
            chai_1.assert.include(consoleLogCalls[9].args[0], "key3\n    key5");
            // optional variables
            chai_1.assert.include(consoleLogCalls[11].args[0], "Optional:");
            chai_1.assert.include(
              consoleLogCalls[12].args[0],
              "key1\n    key4\n    key2"
            );
            // env variables
            chai_1.assert.include(
              consoleLogCalls[14].args[0],
              "Set via environment variables:"
            );
            chai_1.assert.include(
              consoleLogCalls[15].args[0],
              `${ENV_VAR_PREFIX}${KEY1}\n    ${ENV_VAR_PREFIX}${KEY2}`
            );
            (0, chai_1.expect)(code).equals(0);
          }));
      });
      describe("simulate setup errors when loading hardhat.config.ts", () => {
        describe("the error should stop the execution", () => {
          (0, project_1.useFixtureProject)("vars/setup-error-to-throw");
          it("should throw the error", () =>
            __awaiter(void 0, void 0, void 0, function* () {
              const spyConsoleError = sandbox.stub(console, "error");
              yield (0, chai_1.expect)(
                (0, vars_1.handleVars)(["vars", "setup"], undefined)
              ).to.be.rejectedWith("Simulate error to throw during vars setup");
              (0,
              chai_1.assert)(spyConsoleError.calledWith(picocolors_1.default.red("There is an error in your Hardhat configuration file. Please double check it.\n")));
              spyConsoleError.restore();
            }));
        });
      });
    });
  });
});
