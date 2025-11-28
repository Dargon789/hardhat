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
exports.createMockData = exports.MockFile = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const dependencyGraph_1 = require("../../../src/internal/solidity/dependencyGraph");
const parse_1 = require("../../../src/internal/solidity/parse");
const resolver_1 = require("../../../src/internal/solidity/resolver");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
const projectRoot = (0, fs_utils_1.getRealPathSync)(".");
class MockFile {
  constructor(name, versionPragmas, libraryName) {
    this.name = name;
    this.versionPragmas = versionPragmas;
    this.libraryName = libraryName;
    this.sourceName = `contracts/${name}.sol`;
    this.absolutePath = path_1.default.join(
      projectRoot,
      "contracts",
      `${name}.sol`
    );
  }
}
exports.MockFile = MockFile;
function createMockData(files) {
  return __awaiter(this, void 0, void 0, function* () {
    const filesMap = new Map();
    for (const { file, dependencies } of files) {
      filesMap.set(file, {
        dependencies:
          dependencies !== null && dependencies !== void 0 ? dependencies : [],
      });
    }
    const mockFileToResolvedFile = new Map();
    const importsMap = new Map();
    const resolvedFiles = [...filesMap.keys()].map((mockFile) => {
      const resolvedFile = new resolver_1.ResolvedFile(
        mockFile.sourceName,
        mockFile.absolutePath,
        {
          rawContent: "mock file",
          imports: filesMap
            .get(mockFile)
            .dependencies.map((dependency) => `./${dependency.name}.sol`),
          versionPragmas: mockFile.versionPragmas,
        },
        "<content-hash-mock-file>",
        new Date(),
        mockFile.libraryName,
        mockFile.libraryName === undefined ? undefined : "1.2.3"
      );
      mockFileToResolvedFile.set(mockFile, resolvedFile);
      importsMap.set(`./${mockFile.name}.sol`, resolvedFile);
      return resolvedFile;
    });
    const resolver = new resolver_1.Resolver(
      projectRoot,
      new parse_1.Parser(),
      {},
      (absolutePath) =>
        fs_extra_1.default.readFile(absolutePath, { encoding: "utf8" }),
      (sourceName) =>
        __awaiter(this, void 0, void 0, function* () {
          return sourceName;
        })
    );
    resolver.resolveImport = (from, imported) =>
      __awaiter(this, void 0, void 0, function* () {
        const importedFile = importsMap.get(imported);
        if (importedFile === undefined) {
          throw new Error(`${imported} is not mocked`);
        }
        return importedFile;
      });
    const dependencyGraph =
      yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
        resolver,
        resolvedFiles
      );
    return [dependencyGraph, resolvedFiles];
  });
}
exports.createMockData = createMockData;
