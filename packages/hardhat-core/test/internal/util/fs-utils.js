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
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const chai_1 = require("chai");
const fs_1 = require("../../helpers/fs");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
const IS_WINDOWS = process.platform === "win32";
describe("fs-utils", function () {
  describe("getRealPath and getRealPathSync", function () {
    (0, fs_1.useTmpDir)("ts-utils");
    function assertWithBoth(input, expected) {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(yield (0, fs_utils_1.getRealPath)(input), expected);
        chai_1.assert.equal((0, fs_utils_1.getRealPathSync)(input), expected);
      });
    }
    it("should resolve symlinks", function () {
      return __awaiter(this, void 0, void 0, function* () {
        if (IS_WINDOWS) {
          this.skip();
        }
        const actualPath = path_1.default.join(this.tmpDir, "mixedCasingFile");
        const linkPath = path_1.default.join(this.tmpDir, "link");
        yield promises_1.default.writeFile(actualPath, "");
        yield promises_1.default.symlink(actualPath, linkPath);
        yield assertWithBoth(linkPath, actualPath);
      });
    });
    it("should normalize the path", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const actualPath = path_1.default.join(this.tmpDir, "mixedCasingFile");
        yield promises_1.default.writeFile(actualPath, "");
        yield assertWithBoth(
          path_1.default.join(
            this.tmpDir,
            "a",
            "..",
            ".",
            ".",
            "",
            "",
            "mixedCasingFile"
          ),
          actualPath
        );
      });
    });
    it("should throw FileNotFoundError if not found", function () {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          yield (0,
          fs_utils_1.getRealPath)(path_1.default.join(this.tmpDir, "not-exists"));
          chai_1.assert.fail("Should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileNotFoundError)) {
            throw e;
          }
        }
        try {
          (0,
          fs_utils_1.getRealPathSync)(path_1.default.join(this.tmpDir, "not-exists"));
          chai_1.assert.fail("Should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileNotFoundError)) {
            throw e;
          }
        }
      });
    });
    it("should throw FileSystemAccessError if a different error is thrown", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const linkPath = path_1.default.join(this.tmpDir, "link");
        yield promises_1.default.symlink(linkPath, linkPath);
        try {
          yield (0, fs_utils_1.getRealPath)(linkPath);
          chai_1.assert.fail("Should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileSystemAccessError)) {
            throw e;
          }
        }
        try {
          (0, fs_utils_1.getRealPathSync)(linkPath);
          chai_1.assert.fail("Should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileSystemAccessError)) {
            throw e;
          }
        }
      });
    });
  });
  describe("getFileTrueCase and getFileTrueCaseSync", function () {
    (0, fs_1.useTmpDir)("getFileTrueCase");
    function assertWithBoth(from, relativePath, expected) {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.equal(
          yield (0, fs_utils_1.getFileTrueCase)(from, relativePath),
          expected
        );
        chai_1.assert.equal(
          (0, fs_utils_1.getFileTrueCaseSync)(from, relativePath),
          expected
        );
      });
    }
    it("Should throw FileNotFoundError if not found", function () {
      return __awaiter(this, void 0, void 0, function* () {
        try {
          yield (0, fs_utils_1.getFileTrueCase)(__dirname, "asd");
          chai_1.assert.fail("should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileNotFoundError)) {
            throw e;
          }
        }
        try {
          (0, fs_utils_1.getFileTrueCaseSync)(__dirname, "asd");
          chai_1.assert.fail("should have thrown");
        } catch (e) {
          if (!(e instanceof fs_utils_1.FileNotFoundError)) {
            throw e;
          }
        }
      });
    });
    it("Should return the true case of files and dirs", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mixedCaseFilePath = path_1.default.join(
          this.tmpDir,
          "mixedCaseFile"
        );
        const mixedCaseDirPath = path_1.default.join(
          this.tmpDir,
          "mixedCaseDir"
        );
        const mixedCaseFile2Path = path_1.default.join(
          mixedCaseDirPath,
          "mixedCaseFile2"
        );
        yield promises_1.default.writeFile(mixedCaseFilePath, "");
        yield promises_1.default.mkdir(mixedCaseDirPath);
        yield promises_1.default.writeFile(mixedCaseFile2Path, "");
        // We test mixedCaseFilePath form tmpdir
        yield assertWithBoth(
          this.tmpDir,
          "mixedCaseFile",
          path_1.default.relative(this.tmpDir, mixedCaseFilePath)
        );
        yield assertWithBoth(
          this.tmpDir,
          "mixedcasefile",
          path_1.default.relative(this.tmpDir, mixedCaseFilePath)
        );
        yield assertWithBoth(
          this.tmpDir,
          "MIXEDCASEFILE",
          path_1.default.relative(this.tmpDir, mixedCaseFilePath)
        );
        // We test mixedCaseDirPath form tmpdir
        yield assertWithBoth(
          this.tmpDir,
          "mixedCaseDir",
          path_1.default.relative(this.tmpDir, mixedCaseDirPath)
        );
        yield assertWithBoth(
          this.tmpDir,
          "mixedcasedir",
          path_1.default.relative(this.tmpDir, mixedCaseDirPath)
        );
        yield assertWithBoth(
          this.tmpDir,
          "MIXEDCASEDIR",
          path_1.default.relative(this.tmpDir, mixedCaseDirPath)
        );
        // We test mixedCaseFilePath2 form tmpdir
        yield assertWithBoth(
          this.tmpDir,
          path_1.default.join("mixedCaseDir", "mixedCaseFile2"),
          path_1.default.relative(this.tmpDir, mixedCaseFile2Path)
        );
        yield assertWithBoth(
          this.tmpDir,
          path_1.default.join("mixedcasedir", "MIXEDCASEFILE2"),
          path_1.default.relative(this.tmpDir, mixedCaseFile2Path)
        );
        yield assertWithBoth(
          this.tmpDir,
          path_1.default.join("MIXEDCASEDIR", "mixedcasefile2"),
          path_1.default.relative(this.tmpDir, mixedCaseFile2Path)
        );
        // We test mixedCaseFilePath2 form mixedCaseDir
        yield assertWithBoth(
          mixedCaseDirPath,
          "mixedCaseFile2",
          path_1.default.relative(mixedCaseDirPath, mixedCaseFile2Path)
        );
        yield assertWithBoth(
          mixedCaseDirPath,
          "MIXEDCASEFILE2",
          path_1.default.relative(mixedCaseDirPath, mixedCaseFile2Path)
        );
        yield assertWithBoth(
          mixedCaseDirPath,
          "mixedcasefile2",
          path_1.default.relative(mixedCaseDirPath, mixedCaseFile2Path)
        );
      });
    });
    it("Should NOT resolve symlinks", function () {
      return __awaiter(this, void 0, void 0, function* () {
        if (IS_WINDOWS) {
          this.skip();
        }
        const actualPath = path_1.default.join(this.tmpDir, "mixedCasingFile");
        const linkPath = path_1.default.join(this.tmpDir, "lInK");
        yield promises_1.default.writeFile(actualPath, "");
        yield promises_1.default.symlink(actualPath, linkPath);
        yield assertWithBoth(this.tmpDir, "link", "lInK");
      });
    });
  });
  describe("getAllFilesMatching and getAllFilesMatchingSync", function () {
    (0, fs_1.useTmpDir)("getAllFilesMatching");
    beforeEach(function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield promises_1.default.mkdir(
          path_1.default.join(this.tmpDir, "dir-empty")
        );
        yield promises_1.default.mkdir(
          path_1.default.join(this.tmpDir, "dir-with-files")
        );
        yield promises_1.default.mkdir(
          path_1.default.join(this.tmpDir, "dir-with-extension.txt")
        );
        yield promises_1.default.mkdir(
          path_1.default.join(this.tmpDir, "dir-WithCasing")
        );
        yield promises_1.default.mkdir(
          path_1.default.join(this.tmpDir, "dir-with-files", "dir-within-dir")
        );
        yield promises_1.default.writeFile(
          path_1.default.join(this.tmpDir, "file-1.txt"),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(this.tmpDir, "file-2.txt"),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(this.tmpDir, "file-3.json"),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-1.json"
          ),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-2.txt"
          ),
          ""
        );
        // This dir has .txt extension and has a .txt and .json file
        yield promises_1.default.writeFile(
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-3.txt"
          ),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-4.json"
          ),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(this.tmpDir, "dir-WithCasing", "file-WithCASING"),
          ""
        );
        yield promises_1.default.writeFile(
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "dir-within-dir",
            "file-deep"
          ),
          ""
        );
      });
    });
    function assertBoth(dir, matches, expected) {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.deepEqual(
          new Set(yield (0, fs_utils_1.getAllFilesMatching)(dir, matches)),
          new Set(expected)
        );
        chai_1.assert.deepEqual(
          new Set((0, fs_utils_1.getAllFilesMatchingSync)(dir, matches)),
          new Set(expected)
        );
      });
    }
    it("Should return an empty array if the dir doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield assertBoth(
          path_1.default.join(this.tmpDir, "not-in-fs"),
          undefined,
          []
        );
      });
    });
    it("Should return an empty array if the dir is empty", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield assertBoth(
          path_1.default.join(this.tmpDir, "dir-empty"),
          undefined,
          []
        );
      });
    });
    it("Should return every file by default, recursively", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield assertBoth(this.tmpDir, undefined, [
          path_1.default.join(this.tmpDir, "file-1.txt"),
          path_1.default.join(this.tmpDir, "file-2.txt"),
          path_1.default.join(this.tmpDir, "file-3.json"),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-1.json"
          ),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-2.txt"
          ),
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-3.txt"
          ),
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-4.json"
          ),
          path_1.default.join(this.tmpDir, "dir-WithCasing", "file-WithCASING"),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "dir-within-dir",
            "file-deep"
          ),
        ]);
        yield assertBoth(
          path_1.default.join(this.tmpDir, "dir-WithCasing"),
          undefined,
          [
            path_1.default.join(
              this.tmpDir,
              "dir-WithCasing",
              "file-WithCASING"
            ),
          ]
        );
      });
    });
    it("Should filter files and not dirs", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield assertBoth(this.tmpDir, (f) => f.endsWith(".txt"), [
          path_1.default.join(this.tmpDir, "file-1.txt"),
          path_1.default.join(this.tmpDir, "file-2.txt"),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-2.txt"
          ),
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-3.txt"
          ),
        ]);
        yield assertBoth(this.tmpDir, (f) => !f.endsWith(".txt"), [
          path_1.default.join(this.tmpDir, "file-3.json"),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "inner-file-1.json"
          ),
          path_1.default.join(
            this.tmpDir,
            "dir-with-extension.txt",
            "inner-file-4.json"
          ),
          path_1.default.join(this.tmpDir, "dir-WithCasing", "file-WithCASING"),
          path_1.default.join(
            this.tmpDir,
            "dir-with-files",
            "dir-within-dir",
            "file-deep"
          ),
        ]);
      });
    });
    it("Should preserve the true casing of the files, except for the dir's path", function () {
      return __awaiter(this, void 0, void 0, function* () {
        it("Should filter files and not dirs", function () {
          return __awaiter(this, void 0, void 0, function* () {
            yield assertBoth(
              this.tmpDir,
              (f) => f.toLowerCase().endsWith("withcasing"),
              [
                path_1.default.join(
                  this.tmpDir,
                  "dir-WithCasing",
                  "file-WithCASING"
                ),
              ]
            );
          });
        });
      });
    });
  });
});
