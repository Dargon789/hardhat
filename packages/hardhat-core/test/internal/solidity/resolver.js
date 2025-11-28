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
const fsExtra = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const task_names_1 = require("../../../src/builtin-tasks/task-names");
const errors_list_1 = require("../../../src/internal/core/errors-list");
const parse_1 = require("../../../src/internal/solidity/parse");
const resolver_1 = require("../../../src/internal/solidity/resolver");
const packageInfo = __importStar(
  require("../../../src/internal/util/packageInfo")
);
const environment_1 = require("../../helpers/environment");
const errors_1 = require("../../helpers/errors");
const project_1 = require("../../helpers/project");
const source_names_1 = require("../../../src/utils/source-names");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
function assertResolvedFilePartiallyEquals(actual, expected) {
  for (const key of Object.keys(expected)) {
    const typedKey = key;
    chai_1.assert.deepEqual(actual[typedKey], expected[typedKey]);
  }
}
const buildContent = (rawContent) => ({
  rawContent,
  imports: [],
  versionPragmas: [],
});
describe("Resolved file", function () {
  const sourceName = "sourceName.sol";
  const absolutePath = "/path/to/file/sourceName.sol";
  const content = buildContent("the file content");
  const lastModificationDate = new Date();
  const libraryName = "lib";
  const libraryVersion = "0.1.0";
  let resolvedFileWithoutLibrary;
  let resolvedFileWithLibrary;
  before("init files", function () {
    resolvedFileWithoutLibrary = new resolver_1.ResolvedFile(
      sourceName,
      absolutePath,
      content,
      "<content-hash-file-without-library>",
      lastModificationDate
    );
    resolvedFileWithLibrary = new resolver_1.ResolvedFile(
      sourceName,
      absolutePath,
      content,
      "<content-hash-file-with-library>",
      lastModificationDate,
      libraryName,
      libraryVersion
    );
  });
  it("should be constructed correctly without a library", function () {
    assertResolvedFilePartiallyEquals(resolvedFileWithoutLibrary, {
      sourceName,
      absolutePath,
      content,
      lastModificationDate,
      library: undefined,
    });
  });
  it("Should be constructed correctly with a library", function () {
    assertResolvedFilePartiallyEquals(resolvedFileWithLibrary, {
      sourceName,
      absolutePath,
      content,
      lastModificationDate,
      library: {
        name: libraryName,
        version: libraryVersion,
      },
    });
  });
  describe("getVersionedName", function () {
    it("Should give the source name if the file isn't from a library", function () {
      chai_1.assert.equal(
        resolvedFileWithoutLibrary.getVersionedName(),
        sourceName
      );
    });
    it("Should add the version if the file is from a library", function () {
      chai_1.assert.equal(
        resolvedFileWithLibrary.getVersionedName(),
        `${sourceName}@v${libraryVersion}`
      );
    });
  });
});
function assertResolvedFileFromPath(
  resolverPromise,
  expectedSourceName,
  filePath,
  libraryInfo
) {
  return __awaiter(this, void 0, void 0, function* () {
    const resolved = yield resolverPromise;
    const absolutePath = yield (0, fs_utils_1.getRealPath)(filePath);
    chai_1.assert.equal(resolved.sourceName, expectedSourceName);
    chai_1.assert.equal(resolved.absolutePath, absolutePath);
    chai_1.assert.deepEqual(resolved.library, libraryInfo);
    const { ctime } = yield fsExtra.stat(absolutePath);
    chai_1.assert.equal(
      resolved.lastModificationDate.valueOf(),
      ctime.valueOf()
    );
  });
}
describe("Resolver", function () {
  const projectName = "resolver-tests-project";
  (0, project_1.useFixtureProject)(projectName);
  let resolver;
  let projectPath;
  before("Get project path", function () {
    return __awaiter(this, void 0, void 0, function* () {
      projectPath = yield (0, project_1.getFixtureProjectPath)(projectName);
    });
  });
  beforeEach("Init resolver", function () {
    return __awaiter(this, void 0, void 0, function* () {
      resolver = new resolver_1.Resolver(
        projectPath,
        new parse_1.Parser(),
        {},
        (absolutePath) => fsExtra.readFile(absolutePath, { encoding: "utf8" }),
        (sourceName) =>
          __awaiter(this, void 0, void 0, function* () {
            return sourceName;
          })
      );
    });
  });
  describe("resolveSourceName", function () {
    it("Should validate the source name format", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("asd\\asd"), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_BACKSLASHES);
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName((0, source_names_1.replaceBackslashes)(__dirname)), errors_list_1.ERRORS.SOURCE_NAMES.INVALID_SOURCE_NAME_ABSOLUTE_PATH);
      });
    });
    describe("Local vs library distinction", function () {
      it("Should be local if it exists in the project", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("contracts/c.sol"),
            "contracts/c.sol",
            path_1.default.join(projectPath, "contracts/c.sol")
          );
        });
      });
      it("Should be a library if it starts with node_modules", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("node_modules/lib/l.sol"),
            "node_modules/lib/l.sol",
            path_1.default.join(projectPath, "node_modules/lib/l.sol"),
            { name: "lib", version: "1.0.0" }
          );
        });
      });
      it("Should be local if its first directory exists in the project, even if it doesn't exist", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contracts/non-existent.sol"), errors_list_1.ERRORS.RESOLVER.FILE_NOT_FOUND);
        });
      });
      it("Should be a library its first directory doesn't exist in the project", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("lib/l.sol"),
            "lib/l.sol",
            path_1.default.join(projectPath, "node_modules/lib/l.sol"),
            { name: "lib", version: "1.0.0" }
          );
        });
      });
    });
    describe("Local files", function () {
      it("Should resolve an existing file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("contracts/c.sol"),
            "contracts/c.sol",
            path_1.default.join(projectPath, "contracts/c.sol")
          );
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("other/o.sol"),
            "other/o.sol",
            path_1.default.join(projectPath, "other/o.sol")
          );
        });
      });
      it("Should fail if the casing is incorrect", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contracts/C.sol"), errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contracts/c.Sol"), errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contractS/c.sol"), errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING);
        });
      });
      it("Should fail with FILE_NOT_FOUND if the first directory exists but the file doesn't", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contracts/non-existent.sol"), errors_list_1.ERRORS.RESOLVER.FILE_NOT_FOUND);
        });
      });
      it("Should fail with FILE_NOT_FOUND if the first directory exists but the file doesn't, even if the casing of the first dir is wrong", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("contractS/non-existent.sol"), errors_list_1.ERRORS.RESOLVER.FILE_NOT_FOUND);
        });
      });
    });
    describe("Library files", function () {
      it("Should resolve to the node_modules file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveSourceName("lib/l.sol"),
            "lib/l.sol",
            path_1.default.join(projectPath, "node_modules/lib/l.sol"),
            { name: "lib", version: "1.0.0" }
          );
        });
      });
      it("Should fail if the casing is incorrect", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("lib/L.sol"), errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("lib/l.Sol"), errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING);
          // This error is platform dependant, as when resolving a library name
          // we use node's resolution algorithm, and it's case-sensitive or not
          // depending on the platform.
          if (process.platform === "win32" || process.platform === "darwin") {
            yield (0, errors_1.expectHardhatErrorAsync)(
              () => resolver.resolveSourceName("liB/l.sol"),
              errors_list_1.ERRORS.RESOLVER.WRONG_SOURCE_NAME_CASING
            );
          } else {
            yield (0, errors_1.expectHardhatErrorAsync)(
              () => resolver.resolveSourceName("liB/l.sol"),
              errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED
            );
          }
        });
      });
      it("Should fail if the library is not installed", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("not-installed.sol"), errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED, "Library not-installed.sol is not installed");
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("not-installed/l.sol"), errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED, "Library not-installed is not installed");
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("@not-installed/contracts/l.sol"), errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED, "Library @not-installed/contracts is not installed");
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("@not-installed/contracts/tokens/l.sol"), errors_list_1.ERRORS.RESOLVER.LIBRARY_NOT_INSTALLED, "Library @not-installed/contracts is not installed");
        });
      });
      it("Should fail if the library is installed byt the file not found", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveSourceName("lib/l2.sol"), errors_list_1.ERRORS.RESOLVER.LIBRARY_FILE_NOT_FOUND);
        });
      });
    });
  });
  describe("resolveImport", function () {
    let localFrom;
    let libraryFrom;
    before(function () {
      localFrom = new resolver_1.ResolvedFile(
        "contracts/c.sol",
        path_1.default.join(projectPath, "contracts/c.sol"),
        {
          rawContent: "asd",
          imports: [],
          versionPragmas: [],
        },
        "<content-hash-c>",
        new Date()
      );
      libraryFrom = new resolver_1.ResolvedFile(
        "lib/l.sol",
        path_1.default.join(projectPath, "node_modules/lib/l.sol"),
        {
          rawContent: "asd",
          imports: [],
          versionPragmas: [],
        },
        "<content-hash-l>",
        new Date(),
        "lib",
        "1.0.0"
      );
    });
    describe("Invalid imports", function () {
      it("shouldn't let you import something using http or other protocols", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "http://google.com"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_PROTOCOL);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(libraryFrom, "https://google.com"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_PROTOCOL);
        });
      });
      it("shouldn't let you import something using backslashes", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "sub\\a.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_BACKSLASH);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(libraryFrom, "sub\\a.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_BACKSLASH);
        });
      });
      it("shouldn't let you import something using an absolute path", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "/asd"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_ABSOLUTE_PATH);
        });
      });
      it("shouldn't let you import something that starts with the own package name", function () {
        return __awaiter(this, void 0, void 0, function* () {
          sinon_1.default
            .stub(packageInfo, "getPackageName")
            .resolves("myPackageName");
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "myPackageName/src/file"), errors_list_1.ERRORS.RESOLVER.INCLUDES_OWN_PACKAGE_NAME);
          sinon_1.default.restore();
        });
      });
    });
    describe("Absolute imports", function () {
      it("Accept non-normalized imports", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "other/asd/../o.sol"),
            "other/o.sol",
            path_1.default.join(projectPath, "other/o.sol")
          );
        });
      });
      it("Should accept non-top-level files from libraries", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(libraryFrom, "lib/sub/a.sol"),
            "lib/sub/a.sol",
            path_1.default.join(projectPath, "node_modules/lib/sub/a.sol"),
            {
              name: "lib",
              version: "1.0.0",
            }
          );
        });
      });
      it("should resolve @scoped/libraries", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(libraryFrom, "@scoped/library/d/l.sol"),
            "@scoped/library/d/l.sol",
            path_1.default.join(
              projectPath,
              "node_modules/@scoped/library/d/l.sol"
            ),
            {
              name: "@scoped/library",
              version: "1.0.0",
            }
          );
        });
      });
      it("shouldn't let you import something from an uninstalled library", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "non-installed/asd.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_LIBRARY_NOT_INSTALLED);
        });
      });
      it("should fail if importing a missing file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "lib/asd.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "contracts/asd.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND);
        });
      });
      it("should fail if importing a file with the incorrect casing", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "lib/L.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_WRONG_CASING);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "contracts/C.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_WRONG_CASING);
        });
      });
      it("Should accept local files from different directories", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "other/o.sol"),
            "other/o.sol",
            path_1.default.join(projectPath, "other/o.sol")
          );
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "contracts/c.sol"),
            "contracts/c.sol",
            path_1.default.join(projectPath, "contracts/c.sol")
          );
        });
      });
      it("Should accept imports from a library into another one", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(libraryFrom, "lib2/l2.sol"),
            "lib2/l2.sol",
            path_1.default.join(projectPath, "node_modules/lib2/l2.sol"),
            {
              name: "lib2",
              version: "1.0.0",
            }
          );
        });
      });
      it("Should forbid local imports from libraries", function () {
        return __awaiter(this, void 0, void 0, function* () {
          // TODO: Should we implement this?
        });
      });
      it("Should resolve libraries that have been installed with a different name successfully", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(
              localFrom,
              "library-with-other-name-1.2.3/c.sol"
            ),
            "library-with-other-name-1.2.3/c.sol",
            path_1.default.join(
              projectPath,
              "node_modules/library-with-other-name-1.2.3/c.sol"
            ),
            {
              name: "library-with-other-name-1.2.3",
              version: "1.2.3",
            }
          );
        });
      });
      it("Should resolve linked libraries correctly", function () {
        return __awaiter(this, void 0, void 0, function* () {
          if (process.platform === "win32") {
            this.skip();
            return;
          }
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "linked-library/c.sol"),
            "linked-library/c.sol",
            path_1.default.join(projectPath, "library/c.sol"),
            {
              name: "linked-library",
              version: "1.2.4",
            }
          );
        });
      });
    });
    describe("Relative imports", function () {
      it("shouldn't let you import something outside of the project from a local file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "../../asd.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_OUTSIDE_OF_PROJECT);
        });
      });
      it("shouldn't let you import something from a library that is outside of it", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(libraryFrom, "../asd.sol"), errors_list_1.ERRORS.RESOLVER.ILLEGAL_IMPORT);
        });
      });
      it("Accept non-normalized imports", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "../other/asd/../o.sol"),
            "other/o.sol",
            path_1.default.join(projectPath, "other/o.sol")
          );
        });
      });
      it("should fail if importing a missing file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(libraryFrom, "./asd.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "../other/asd.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND);
        });
      });
      it("should fail if importing a file with the incorrect casing", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(libraryFrom, "./sub/A.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_WRONG_CASING);
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "./sub/A.sol"), errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_WRONG_CASING);
        });
      });
      it("Should always treat relative imports from local files as local", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield (0,
          errors_1.expectHardhatErrorAsync)(() => resolver.resolveImport(localFrom, "../not-a-library/A.sol"), errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND);
        });
      });
      it("Should let you import a library file with its relative path from a local file", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield assertResolvedFileFromPath(
            resolver.resolveImport(localFrom, "../node_modules/lib/l.sol"),
            "lib/l.sol",
            path_1.default.join(projectPath, "node_modules/lib/l.sol"),
            {
              name: "lib",
              version: "1.0.0",
            }
          );
        });
      });
    });
  });
});
describe("Resolver regression tests", function () {
  describe("Project with a hardhat subdirectory", function () {
    const projectName = "project-with-hardhat-directory";
    (0, project_1.useFixtureProject)(projectName);
    (0, environment_1.useEnvironment)();
    // This test ensures the resolver lets you compile a project with the packaged console.sol
    // in a Hardhat project that has a "hardhat" subdirectory.
    // See issue https://github.com/nomiclabs/hardhat/issues/998
    it("Should compile the Greeter contract that imports console.log from hardhat", function () {
      return __awaiter(this, void 0, void 0, function* () {
        return this.env.run(task_names_1.TASK_COMPILE, { quiet: true });
      });
    });
  });
});
describe("TASK_COMPILE: the file to compile is trying to import a directory", function () {
  describe("Import folder from module", () => {
    (0, project_1.useFixtureProject)("compilation-import-folder-from-module");
    (0, environment_1.useEnvironment)();
    it("should throw an error because a directory is trying to be imported", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run(task_names_1.TASK_COMPILE);
            }),
          errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_OF_DIRECTORY,
          "HH414: Invalid import some-lib from contracts/A.sol. Attempting to import a directory. Directories cannot be imported."
        );
      });
    });
  });
  describe("Import folder from path", () => {
    (0, project_1.useFixtureProject)("compilation-import-folder-from-path");
    (0, environment_1.useEnvironment)();
    it("should throw an error because a directory is trying to be imported", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run(task_names_1.TASK_COMPILE);
            }),
          errors_list_1.ERRORS.RESOLVER.INVALID_IMPORT_OF_DIRECTORY,
          "HH414: Invalid import ../dir from contracts/A.sol. Attempting to import a directory. Directories cannot be imported."
        );
      });
    });
  });
});
describe("TASK_COMPILE: the file to compile is trying to import a non existing file", function () {
  describe("Trying to import file from module", () => {
    (0, project_1.useFixtureProject)(
      "compilation-import-non-existing-file-from-module"
    );
    (0, environment_1.useEnvironment)();
    it("should throw an error because a directory is trying to be imported", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run(task_names_1.TASK_COMPILE);
            }),
          errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND,
          "HH404: File some-lib/nonExistingFile.sol, imported from contracts/A.sol, not found."
        );
      });
    });
  });
  describe("Trying to import file from path", () => {
    (0, project_1.useFixtureProject)(
      "compilation-import-non-existing-file-from-path"
    );
    (0, environment_1.useEnvironment)();
    it("should throw an error because a directory is trying to be imported", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            __awaiter(this, void 0, void 0, function* () {
              yield this.env.run(task_names_1.TASK_COMPILE);
            }),
          errors_list_1.ERRORS.RESOLVER.IMPORTED_FILE_NOT_FOUND,
          "HH404: File ../nonExistingFile.sol, imported from contracts/A.sol, not found."
        );
      });
    });
  });
});
