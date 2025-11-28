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
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const errors_list_1 = require("../../src/internal/core/errors-list");
const packageInfo = __importStar(
  require("../../src/internal/util/packageInfo")
);
const source_names_1 = require("../../src/utils/source-names");
const errors_1 = require("../helpers/errors");
describe("Source names utilities", function () {
  describe("validateSourceNameFormat", function () {
    it("Should fail with absolute paths", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)((0, source_names_1.normalizeSourceName)(__dirname)), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_ABSOLUTE_PATH);
      });
    });
    it("Should fail with slash-based absolute paths, even on windows", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("/asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_ABSOLUTE_PATH);
      });
    });
    it("Should fail if it is a relative path", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("./asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_RELATIVE_PATH);
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("../asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_RELATIVE_PATH);
      });
    });
    it("Shouldn't fail if it is a dotfile", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0, source_names_1.validateSourceNameFormat)(".asd");
      });
    });
    it("Shouldn't fail if it is a special dotfile", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0, source_names_1.validateSourceNameFormat)("..asd/");
      });
    });
    it("Should fail if it uses backslash", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("asd\\sd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_BACKSLASHES);
      });
    });
    it("Should fail if is not normalized", function () {
      return __awaiter(this, void 0, void 0, function* () {
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("asd/./asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NOT_NORMALIZED);
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("asd/../asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NOT_NORMALIZED);
        (0,
        errors_1.expectHardhatError)(() => (0, source_names_1.validateSourceNameFormat)("asd//asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NOT_NORMALIZED);
      });
    });
  });
  describe("isLocalSourceName", function () {
    it("Should return false if it includes node_modules", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield (0, source_names_1.isLocalSourceName)(
            __dirname,
            "asd/node_modules"
          )
        );
      });
    });
    it("Should return true if the first part/dir of the source name exists", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isTrue(
          yield (0, source_names_1.isLocalSourceName)(
            path_1.default.dirname(__dirname),
            "utils/asd"
          )
        );
        chai_1.assert.isTrue(
          yield (0, source_names_1.isLocalSourceName)(
            path_1.default.dirname(__dirname),
            "utils"
          )
        );
      });
    });
    it("Should return true if the first part/dir of the source name exists with a different casing", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isTrue(
          yield (0, source_names_1.isLocalSourceName)(
            path_1.default.dirname(__dirname),
            "utilS/asd"
          )
        );
        chai_1.assert.isTrue(
          yield (0, source_names_1.isLocalSourceName)(
            path_1.default.dirname(__dirname),
            "uTils"
          )
        );
      });
    });
    it("Should return false if the first part/dir of the source name doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield (0, source_names_1.isLocalSourceName)(
            path_1.default.dirname(__dirname),
            "no/asd"
          )
        );
      });
    });
    // This is a regression test for this issue: https://github.com/nomiclabs/hardhat/issues/998
    it("Should return false if the source name is 'hardhat/console.sol'", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const projectPath = path_1.default.join(
          path_1.default.dirname(__dirname),
          "fixture-projects",
          "project-with-hardhat-directory"
        );
        chai_1.assert.isFalse(
          yield (0, source_names_1.isLocalSourceName)(
            projectPath,
            "hardhat/console.sol"
          )
        );
      });
    });
  });
  describe("validateSourceNameExistenceAndCasing", function () {
    it("Should throw if the file doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => (0, source_names_1.validateSourceNameExistenceAndCasing)(__dirname, `asd`), errors_list_1.ERRORS.SOURCE_NAMES.FILE_NOT_FOUND);
      });
    });
    it("Should throw if the casing is incorrect", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => (0, source_names_1.validateSourceNameExistenceAndCasing)(__dirname, `source-Names.ts`), errors_list_1.ERRORS.SOURCE_NAMES.WRONG_CASING);
      });
    });
  });
  describe("localPathToSourceName", function () {
    it("Shouldn't accept files outside the project", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => (0, source_names_1.localPathToSourceName)(__dirname, path_1.default.normalize(`${__dirname}/../asd`)), errors_list_1.ERRORS.SOURCE_NAMES.EXTERNAL_AS_LOCAL);
      });
    });
    it("Shouldn't accept files from node_modules", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => (0, source_names_1.localPathToSourceName)(__dirname, `${__dirname}/node_modules/asd`), errors_list_1.ERRORS.SOURCE_NAMES.NODE_MODULES_AS_LOCAL);
      });
    });
    it("Should throw if the file doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => (0, source_names_1.localPathToSourceName)(__dirname, `${__dirname}/asd`), errors_list_1.ERRORS.SOURCE_NAMES.FILE_NOT_FOUND);
      });
    });
    it("Should return the right casing of a file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(
          yield (0, source_names_1.localPathToSourceName)(
            __dirname,
            `${__dirname}/source-NAMES.ts`
          ),
          "source-names.ts"
        );
      });
    });
  });
  describe("localSourceNameToPath", function () {
    it("Should join the project root and the source name", function () {
      chai_1.assert.equal(
        (0, source_names_1.localSourceNameToPath)(__dirname, "asd/qwe"),
        path_1.default.join(__dirname, "asd/qwe")
      );
    });
  });
  describe("normalizeSourceName", function () {
    it("Should remove /./", function () {
      chai_1.assert.equal(
        (0, source_names_1.normalizeSourceName)("asd/./asd"),
        "asd/asd"
      );
    });
    it("Should remove /../", function () {
      chai_1.assert.equal(
        (0, source_names_1.normalizeSourceName)("asd/a/../asd"),
        "asd/asd"
      );
    });
    it("Should simplify //", function () {
      chai_1.assert.equal(
        (0, source_names_1.normalizeSourceName)("asd//asd"),
        "asd/asd"
      );
    });
    it("Should use slashes and not backslashes", function () {
      chai_1.assert.equal(
        (0, source_names_1.normalizeSourceName)("asd\\asd"),
        "asd/asd"
      );
    });
  });
  describe("isAbsolutePathSourceName", function () {
    it("Should return false for relative paths", function () {
      chai_1.assert.isFalse(
        (0, source_names_1.isAbsolutePathSourceName)("./asd")
      );
      chai_1.assert.isFalse(
        (0, source_names_1.isAbsolutePathSourceName)("asd")
      );
    });
    it("Should return true for absolute paths", function () {
      chai_1.assert.isTrue(
        (0, source_names_1.isAbsolutePathSourceName)(__filename)
      );
    });
    it("Should return true for paths starting in /", function () {
      chai_1.assert.isTrue(
        (0, source_names_1.isAbsolutePathSourceName)("/asd")
      );
    });
  });
  describe("replaceBackslashes", function () {
    it("Should return the same string with / instead of \\", function () {
      chai_1.assert.equal((0, source_names_1.replaceBackslashes)("\\a"), "/a");
      chai_1.assert.equal(
        (0, source_names_1.replaceBackslashes)("\\\\a"),
        "//a"
      );
      chai_1.assert.equal(
        (0, source_names_1.replaceBackslashes)("/\\\\a"),
        "///a"
      );
    });
  });
  describe("includesOwnPackageName", function () {
    before(() => {
      sinon_1.default
        .stub(packageInfo, "getPackageName")
        .resolves("myPackageName");
    });
    after(() => {
      sinon_1.default.restore();
    });
    it("Should return true if parsed string starts with the package name", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isTrue(
          yield (0, source_names_1.includesOwnPackageName)(
            "myPackageName/src/file"
          )
        );
      });
    });
    it("Should return false if the parsed string doesn't start with the package name", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield (0, source_names_1.includesOwnPackageName)(
            "differentPackageName/src/file"
          )
        );
      });
    });
  });
});
