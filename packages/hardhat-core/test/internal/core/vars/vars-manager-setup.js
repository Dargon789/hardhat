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
require("mocha");
const fs_extra_1 = __importDefault(require("fs-extra"));
const chai_1 = require("chai");
const os = __importStar(require("os"));
const vars_manager_setup_1 = require("../../../../src/internal/core/vars/vars-manager-setup");
describe("VarsManagerSetup", () => {
  const TMP_FILE_PATH = `${os.tmpdir()}/test-vars.json`;
  let varsManagerSetup;
  beforeEach(() => {
    fs_extra_1.default.removeSync(TMP_FILE_PATH);
    fs_extra_1.default.writeJSONSync(TMP_FILE_PATH, {
      _format: "test",
      vars: {
        key1: { value: "val1" },
        key2: { value: "val2" },
        key3: { value: "val3" },
        key4: { value: "val4" },
        key5: { value: "val5" },
        key6: { value: "val6" },
        key7: { value: "val7" },
      },
    });
    varsManagerSetup = new vars_manager_setup_1.VarsManagerSetup(TMP_FILE_PATH);
  });
  //
  // getRequiredVarsAlreadySet, getOptionalVarsAlreadySet, getRequiredVarsToSet and getOptionalVarsToSet are tested when testing the functions has and get
  //
  describe("has - basic operations", () => {
    it("should return keys only with the function getOptionalVarsAlreadySet", () => {
      varsManagerSetup.has("key1");
      varsManagerSetup.has("key2");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), [
        "key1",
        "key2",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), []);
    });
    it("should return keys only with the function getOptionalVarsToSet", () => {
      varsManagerSetup.has("nonExistingKey1");
      varsManagerSetup.has("nonExistingKey2");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), [
        "nonExistingKey1",
        "nonExistingKey2",
      ]);
    });
  });
  describe("get - basic operations", () => {
    it("should return keys only with the function getRequiredVarsAlreadySet", () => {
      varsManagerSetup.get("key1");
      varsManagerSetup.get("key2");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), [
        "key1",
        "key2",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), []);
    });
    it("should return keys only with the function getRequiredVarsToSet", () => {
      varsManagerSetup.get("nonExistingKey1");
      varsManagerSetup.get("nonExistingKey2");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), [
        "nonExistingKey1",
        "nonExistingKey2",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), []);
    });
    describe("default values is passed", () => {
      it("should return keys only with the function getOptionalVarsAlreadySet", () => {
        varsManagerSetup.get("key1", "defaultValue");
        chai_1.assert.deepEqual(
          varsManagerSetup.getRequiredVarsAlreadySet(),
          []
        );
        chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), [
          "key1",
        ]);
        chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
        chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), []);
      });
      it("should return keys only with the function getOptionalVarsToSet", () => {
        varsManagerSetup.get("nonExistingKey", "defaultValue");
        chai_1.assert.deepEqual(
          varsManagerSetup.getRequiredVarsAlreadySet(),
          []
        );
        chai_1.assert.deepEqual(
          varsManagerSetup.getOptionalVarsAlreadySet(),
          []
        );
        chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
        chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), [
          "nonExistingKey",
        ]);
      });
    });
  });
  describe("mix of optional and required variables", () => {
    /**
     * How to calculate required and optional variables:
     *
     * G = get function
     * H = has function
     * GD = get function with default value
     *
     * optional variables = H + (GD - G)
     * required variables = G - H
     */
    it("should return keys only for the already set variables", () => {
      varsManagerSetup.has("key1");
      varsManagerSetup.has("key2");
      varsManagerSetup.has("key3");
      varsManagerSetup.get("key1");
      varsManagerSetup.get("key2");
      varsManagerSetup.get("key6");
      varsManagerSetup.get("key7");
      varsManagerSetup.get("key3");
      varsManagerSetup.get("key1", "defaultValue1");
      varsManagerSetup.get("key5", "defaultValue5");
      varsManagerSetup.get("key6", "defaultValue6");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), [
        "key6",
        "key7",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), [
        "key1",
        "key2",
        "key3",
        "key5",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), []);
    });
    it("should return keys only for the variables that need to be set", () => {
      varsManagerSetup.has("nonExistingKey1");
      varsManagerSetup.has("nonExistingKey2");
      varsManagerSetup.has("nonExistingKey3");
      varsManagerSetup.get("nonExistingKey1");
      varsManagerSetup.get("nonExistingKey2");
      varsManagerSetup.get("nonExistingKey6");
      varsManagerSetup.get("nonExistingKey7");
      varsManagerSetup.get("nonExistingKey3");
      varsManagerSetup.get("nonExistingKey1", "defaultValue1");
      varsManagerSetup.get("nonExistingKey5", "defaultValue5");
      varsManagerSetup.get("nonExistingKey6", "defaultValue6");
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsAlreadySet(), []);
      chai_1.assert.deepEqual(varsManagerSetup.getRequiredVarsToSet(), [
        "nonExistingKey6",
        "nonExistingKey7",
      ]);
      chai_1.assert.deepEqual(varsManagerSetup.getOptionalVarsToSet(), [
        "nonExistingKey1",
        "nonExistingKey2",
        "nonExistingKey3",
        "nonExistingKey5",
      ]);
    });
  });
  describe("env variables are present", () => {
    const ENV_VAR_PREFIX = "HARDHAT_VAR_";
    const KEY = "key_env_1";
    beforeEach(() => {
      process.env[`${ENV_VAR_PREFIX}${KEY}`] = "val1";
    });
    afterEach(() => {
      delete process.env[`${ENV_VAR_PREFIX}${KEY}`];
    });
    it("should return false, env vars should be ignored during setup", () => {
      (0, chai_1.expect)(varsManagerSetup.has(KEY)).to.equal(false);
    });
    it("should return an empty string, env vars should be ignored during setup", () => {
      (0, chai_1.expect)(varsManagerSetup.get(KEY)).to.equal("");
    });
    it("should return an the default value, env vars should be ignored during setup", () => {
      (0, chai_1.expect)(varsManagerSetup.get(KEY, "defaultValue")).to.equal(
        "defaultValue"
      );
    });
  });
});
