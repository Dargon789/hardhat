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
const fs_extra_1 = __importDefault(require("fs-extra"));
const chai_1 = require("chai");
const os = __importStar(require("os"));
const vars_manager_1 = require("../../../../src/internal/core/vars/vars-manager");
describe("VarsManager", () => {
  let TMP_FILE_PATH;
  let varsManager;
  beforeEach(() => {
    TMP_FILE_PATH = `${os.tmpdir()}/test-vars.json`;
    fs_extra_1.default.removeSync(TMP_FILE_PATH);
    varsManager = new vars_manager_1.VarsManager(TMP_FILE_PATH);
  });
  //
  // For deep testing of the set, has, get, list and delete methods, see the last test
  //
  describe("format", () => {
    it("should contain the _format property and it should have a valid value", () => {
      const format = fs_extra_1.default.readJSONSync(TMP_FILE_PATH)._format;
      (0, chai_1.expect)(format).to.not.equal(undefined);
      (0, chai_1.expect)(format.length).to.be.greaterThan(0);
    });
  });
  describe("getStoragePath", () => {
    it("should get the path where the key-value pairs are stored", () => {
      (0, chai_1.expect)(varsManager.getStoragePath()).to.equal(TMP_FILE_PATH);
    });
  });
  describe("set", () => {
    it("should throw if the key is invalid", () => {
      (0, chai_1.expect)(() => varsManager.set("invalid key", "val")).to.throw(
        "HH1202: Invalid name for a configuration variable: 'invalid key'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number."
      );
      (0, chai_1.expect)(() => varsManager.set("0key", "val")).to.throw(
        "HH1202: Invalid name for a configuration variable: '0key'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number."
      );
      (0, chai_1.expect)(() => varsManager.set("invalid!", "val")).to.throw(
        "HH1202: Invalid name for a configuration variable: 'invalid!'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number."
      );
    });
    it("should throw if the value is invalid", () => {
      (0, chai_1.expect)(() => varsManager.set("key", "")).to.throw(
        "HH1203: A configuration variable cannot have an empty value."
      );
    });
  });
  describe("the json file should match all the operations performed with the VarsManager", () => {
    function performOperations() {
      varsManager.set("key1", "val1");
      varsManager.set("key2", "val2");
      varsManager.set("key3", "val3");
      varsManager.delete("key1");
      varsManager.delete("non-existent");
      varsManager.set("key4", "val4");
      varsManager.set("key5", "val5");
      varsManager.delete("key5");
    }
    it("should match", () => {
      performOperations();
      const vars = fs_extra_1.default.readJSONSync(TMP_FILE_PATH).vars;
      (0, chai_1.expect)(vars).to.deep.equal({
        key2: { value: "val2" },
        key3: { value: "val3" },
        key4: { value: "val4" },
      });
    });
    it("should match after reloading the VarsManager (json file is persistent in storage)", () => {
      performOperations();
      const newVarsManager = new vars_manager_1.VarsManager(TMP_FILE_PATH);
      (0, chai_1.expect)(newVarsManager.get("key1")).to.equal(undefined);
      (0, chai_1.expect)(newVarsManager.get("key2")).to.equal("val2");
      (0, chai_1.expect)(newVarsManager.get("key3")).to.equal("val3");
      (0, chai_1.expect)(newVarsManager.get("key4")).to.equal("val4");
      (0, chai_1.expect)(newVarsManager.get("key5")).to.equal(undefined);
    });
  });
  describe("test all methods (set, get, list and delete)", () => {
    it("should execute all methods correctly", () => {
      // set
      varsManager.set("key1", "val1");
      varsManager.set("key2", "val2");
      varsManager.set("key3", "val3");
      // has
      (0, chai_1.expect)(varsManager.has("key1")).to.equal(true);
      (0, chai_1.expect)(varsManager.has("key4")).to.equal(false);
      // delete
      (0, chai_1.expect)(varsManager.delete("key1")).to.equal(true);
      (0, chai_1.expect)(varsManager.delete("non-existent")).to.equal(false);
      // get
      (0, chai_1.expect)(varsManager.get("key1")).to.equal(undefined);
      (0, chai_1.expect)(varsManager.get("key2")).to.equal("val2");
      (0, chai_1.expect)(varsManager.get("key3")).to.equal("val3");
      // list
      (0, chai_1.expect)(varsManager.list()).to.deep.equal(["key2", "key3"]);
      // delete
      (0, chai_1.expect)(varsManager.delete("key2")).to.equal(true);
      (0, chai_1.expect)(varsManager.delete("key3")).to.equal(true);
      // list
      (0, chai_1.expect)(varsManager.list()).to.deep.equal([]);
      // get
      (0, chai_1.expect)(varsManager.get("key3")).to.equal(undefined);
      // set
      varsManager.set("key1", "val1");
      varsManager.set("key4", "val4");
      varsManager.set("key5", "val5");
      // list
      (0, chai_1.expect)(varsManager.list()).to.deep.equal([
        "key1",
        "key4",
        "key5",
      ]);
      // get
      (0, chai_1.expect)(varsManager.get("key1")).to.equal("val1");
      (0, chai_1.expect)(varsManager.get("key4")).to.equal("val4");
      (0, chai_1.expect)(varsManager.get("key5")).to.equal("val5");
    });
  });
  describe("load vars from environment variables", () => {
    const ENV_VAR_PREFIX = "HARDHAT_VAR_";
    const KEY1 = "KEY_ENV_1";
    const KEY2 = "KEY_ENV_2";
    describe("when ENV variables are correctly set", () => {
      beforeEach(() => {
        process.env[`${ENV_VAR_PREFIX}${KEY1}`] = "val1";
        process.env[`${ENV_VAR_PREFIX}${KEY2}`] = "val2";
        varsManager = new vars_manager_1.VarsManager(TMP_FILE_PATH);
      });
      afterEach(() => {
        delete process.env[`${ENV_VAR_PREFIX}${KEY1}`];
        delete process.env[`${ENV_VAR_PREFIX}${KEY2}`];
      });
      describe("function has (without env variables)", () => {
        it("should not have the key-value pairs from the environment variables", () => {
          (0, chai_1.expect)(varsManager.has(KEY1)).to.equal(false);
        });
      });
      describe("function has (with env variables)", () => {
        it("should have the key-value pairs from the environment variables", () => {
          (0, chai_1.expect)(varsManager.has(KEY1, true)).to.equal(true);
        });
      });
      describe("function get (without env variables)", () => {
        it("should get the value from the file, not from the env keys", () => {
          (0, chai_1.expect)(varsManager.get(KEY1)).to.equal(undefined);
        });
        it("should get the value from the file, not from the env keys (same key as the env variable)", () => {
          varsManager.set(KEY1, "storedValue");
          (0, chai_1.expect)(varsManager.get(KEY1)).to.equal("storedValue");
        });
      });
      describe("function get (with env variables)", () => {
        it("should load the key-value pairs from the environment variables", () => {
          (0, chai_1.expect)(varsManager.get(KEY1, undefined, true)).to.equal(
            "val1"
          );
        });
        it("should show the env variable value. Env variables have priority over the stored ones", () => {
          varsManager.set(KEY1, "storedValue");
          (0, chai_1.expect)(varsManager.get(KEY1, undefined, true)).to.equal(
            "val1"
          );
        });
      });
      it("should return only the env variables keys", () => {
        (0, chai_1.expect)(varsManager.getEnvVars()).to.deep.equal([
          `${ENV_VAR_PREFIX}${KEY1}`,
          `${ENV_VAR_PREFIX}${KEY2}`,
        ]);
      });
      it("should not store the env variable in the file but only in the cache", () => {
        // Add a new key-value pair to be sure that env variables are not added when the cache is stored on file during the set operation
        varsManager.set("key", "val");
        const vars = fs_extra_1.default.readJSONSync(TMP_FILE_PATH).vars;
        (0, chai_1.expect)(vars).to.deep.equal({
          key: { value: "val" },
        });
      });
    });
    describe("error when env key is wrong", () => {
      it("should throw an error because the env variable key is not correct", () => {
        process.env[`${ENV_VAR_PREFIX}0_invalidKey`] = "val1";
        (0, chai_1.expect)(
          () => new vars_manager_1.VarsManager(TMP_FILE_PATH)
        ).to.throw(
          "HH1202: Invalid name for a configuration variable: '0_invalidKey'. Configuration variables can only have alphanumeric characters and underscores, and they cannot start with a number."
        );
        delete process.env[`${ENV_VAR_PREFIX}0_invalidKey`];
      });
      it("should throw an error because the env variable value is not correct", () => {
        process.env[`${ENV_VAR_PREFIX}${KEY1}`] = "   "; // space and tab to be sure that spaces are striped correctly
        (0, chai_1.expect)(
          () => new vars_manager_1.VarsManager(TMP_FILE_PATH)
        ).to.throw(
          `HH300: Invalid environment variable '${ENV_VAR_PREFIX}${KEY1}' with value: '   '`
        );
        delete process.env[`${ENV_VAR_PREFIX}${KEY1}`];
      });
    });
  });
});
