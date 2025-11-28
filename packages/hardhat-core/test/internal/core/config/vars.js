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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const os = __importStar(require("os"));
const config_env_1 = require("../../../../src/internal/core/config/config-env");
const vars_manager_1 = require("../../../../src/internal/core/vars/vars-manager");
const context_1 = require("../../../../src/internal/context");
const reset_1 = require("../../../../src/internal/reset");
const vars_manager_setup_1 = require("../../../../src/internal/core/vars/vars-manager-setup");
describe("vars", () => {
  const TMP_FILE_PATH = `${os.tmpdir()}/test-vars.json`;
  let ctx;
  const ENV_VAR_PREFIX = "HARDHAT_VAR_";
  const ENV_KEY = "key_env_1";
  before(() => {
    ctx = context_1.HardhatContext.createHardhatContext();
    process.env[`${ENV_VAR_PREFIX}${ENV_KEY}`] = "val1";
  });
  after(() => {
    (0, reset_1.resetHardhatContext)();
    delete process.env[`${ENV_VAR_PREFIX}${ENV_KEY}`];
  });
  describe("setup scenario", () => {
    beforeEach(() => {
      fs_extra_1.default.removeSync(TMP_FILE_PATH);
      // Create a new instance of the vars manager so that it can point to the test file
      ctx.varsManager = new vars_manager_setup_1.VarsManagerSetup(
        TMP_FILE_PATH
      );
      ctx.varsManager.set("key1", "val1");
    });
    describe("hasVars", () => {
      it("should return true if the key exists", () => {
        (0, chai_1.expect)(config_env_1.vars.has("key1")).to.equal(true);
      });
      it("should return false if the key does not exist", () => {
        (0, chai_1.expect)(config_env_1.vars.has("non-existing")).to.equal(
          false
        );
      });
      it("should return false for the env variable", () => {
        (0, chai_1.expect)(config_env_1.vars.has(ENV_KEY)).to.equal(false);
      });
    });
    describe("getVars", () => {
      it("should return the value associated to the key", () => {
        (0, chai_1.expect)(config_env_1.vars.get("key1")).to.equal("val1");
      });
      it("should return the default value for the var because the key is not found", () => {
        (0, chai_1.expect)(
          config_env_1.vars.get("nonExistingKey", "defaultValue")
        ).to.equal("defaultValue");
      });
      it("should not get the env variable", () => {
        (0, chai_1.expect)(config_env_1.vars.get(ENV_KEY)).to.equal("");
      });
      it("should not throw an error if the key does not exist and no default value is set", () => {
        config_env_1.vars.get("nonExistingKey");
      });
    });
  });
  describe("normal scenario", () => {
    beforeEach(() => {
      fs_extra_1.default.removeSync(TMP_FILE_PATH);
      // Create a new instance of the vars manager so that it can point to the test file
      ctx.varsManager = new vars_manager_1.VarsManager(TMP_FILE_PATH);
      ctx.varsManager.set("key1", "val1");
    });
    describe("hasVars", () => {
      it("should return true if the key exists", () => {
        (0, chai_1.expect)(config_env_1.vars.has("key1")).to.equal(true);
      });
      it("should return false if the key does not exist", () => {
        (0, chai_1.expect)(config_env_1.vars.has("non-existing")).to.equal(
          false
        );
      });
      it("should return true for the env variable", () => {
        (0, chai_1.expect)(config_env_1.vars.has(ENV_KEY)).to.equal(true);
      });
    });
    describe("getVars", () => {
      it("should return the value associated to the key", () => {
        (0, chai_1.expect)(config_env_1.vars.get("key1")).to.equal("val1");
      });
      it("should return the default value for the var because the key is not found", () => {
        (0, chai_1.expect)(
          config_env_1.vars.get("nonExistingKey", "defaultValue")
        ).to.equal("defaultValue");
      });
      it("should get the env variable", () => {
        (0, chai_1.expect)(config_env_1.vars.get(ENV_KEY)).to.equal("val1");
      });
      it("should throw an error if the key does not exist and no default value is set", () => {
        (0, chai_1.expect)(() =>
          config_env_1.vars.get("nonExistingKey")
        ).to.throw(
          "HH1201: Cannot find a value for the configuration variable 'nonExistingKey'. Use 'npx hardhat vars set nonExistingKey' to set it or 'npx hardhat vars setup' to list all the configuration variables used by this project."
        );
      });
    });
  });
});
