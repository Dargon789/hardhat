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
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const dependencyGraph_1 = require("../../../src/internal/solidity/dependencyGraph");
const parse_1 = require("../../../src/internal/solidity/parse");
const resolver_1 = require("../../../src/internal/solidity/resolver");
const project_1 = require("../../helpers/project");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
const helpers_1 = require("./helpers");
function assertDeps(graph, file, ...deps) {
  chai_1.assert.includeMembers(graph.getResolvedFiles(), [file]);
  const resolvedDeps = graph.getDependencies(file);
  if (resolvedDeps === undefined) {
    throw Error("This should never happen. Just making TS happy.");
  }
  chai_1.assert.equal(resolvedDeps.length, deps.length);
  chai_1.assert.includeMembers(Array.from(resolvedDeps), deps);
}
function assertResolvedFiles(graph, ...files) {
  const resolvedFiles = graph.getResolvedFiles();
  chai_1.assert.equal(resolvedFiles.length, files.length);
  chai_1.assert.includeMembers(resolvedFiles, files);
}
describe("Dependency Graph", function () {
  describe("createFromResolvedFiles", function () {
    let resolver;
    let projectRoot;
    let fileWithoutDependencies;
    let fileWithoutDependencies2;
    let fileWithoutDependencies3;
    let dependsOnWDAndW2;
    let dependsOnWD;
    let loop1;
    let loop2;
    before("Mock some resolved files", function () {
      projectRoot = (0, fs_utils_1.getRealPathSync)(".");
      fileWithoutDependencies = new resolver_1.ResolvedFile(
        "contracts/WD.sol",
        path_1.default.join(projectRoot, "contracts", "WD.sol"),
        { rawContent: "no dependecy", imports: [], versionPragmas: [] },
        "<content-hash-wd>",
        new Date()
      );
      fileWithoutDependencies2 = new resolver_1.ResolvedFile(
        "contracts/WD2.sol",
        path_1.default.join(projectRoot, "contracts", "WD2.sol"),
        { rawContent: "no dependecy", imports: [], versionPragmas: [] },
        "<content-hash-wd2>",
        new Date()
      );
      fileWithoutDependencies3 = new resolver_1.ResolvedFile(
        "contracts/WD3.sol",
        path_1.default.join(projectRoot, "contracts", "WD3.sol"),
        { rawContent: "no dependecy", imports: [], versionPragmas: [] },
        "<content-hash-wd3>",
        new Date()
      );
      dependsOnWDAndW2 = new resolver_1.ResolvedFile(
        "contracts/dependsOnWDAndW2.sol",
        path_1.default.join(projectRoot, "contracts", "dependsOnWDAndW2.sol"),
        {
          rawContent: 'import "./WD.sol"; import "./WD2.sol";',
          imports: ["./WD.sol", "./WD2.sol"],
          versionPragmas: [],
        },
        "<content-hash-wd4>",
        new Date()
      );
      dependsOnWD = new resolver_1.ResolvedFile(
        "contracts/dependsOnWD.sol",
        path_1.default.join(projectRoot, "contracts", "dependsOnWD.sol"),
        {
          rawContent: 'import "./WD.sol";',
          imports: ["./WD.sol"],
          versionPragmas: [],
        },
        "<content-hash-depends-on-wd>",
        new Date()
      );
      loop1 = new resolver_1.ResolvedFile(
        "contracts/loop1.sol",
        path_1.default.join(projectRoot, "contracts", "loop1.sol"),
        {
          rawContent: 'import "./loop2.sol";',
          imports: ["./loop2.sol"],
          versionPragmas: [],
        },
        "<content-hash-loop1>",
        new Date()
      );
      loop2 = new resolver_1.ResolvedFile(
        "contracts/loop2.sol",
        path_1.default.join(projectRoot, "contracts", "loop2.sol"),
        {
          rawContent: 'import "./loop1.sol";',
          imports: ["./loop1.sol"],
          versionPragmas: [],
        },
        "<content-hash-loop2>",
        new Date()
      );
      resolver = new resolver_1.Resolver(
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
      resolver.resolveImport = (_, imported) =>
        __awaiter(this, void 0, void 0, function* () {
          switch (imported) {
            case "./WD.sol":
              return fileWithoutDependencies;
            case "./WD2.sol":
              return fileWithoutDependencies2;
            case "./loop1.sol":
              return loop1;
            case "./loop2.sol":
              return loop2;
            default:
              throw new Error(`${imported} is not mocked`);
          }
        });
    });
    it("should give an empty graph if there's no entry point", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            []
          );
        chai_1.assert.isEmpty(graph.getResolvedFiles());
      });
    });
    it("should give a graph with a single node if the only entry point has no deps", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [fileWithoutDependencies]
          );
        assertResolvedFiles(graph, fileWithoutDependencies);
        assertDeps(graph, fileWithoutDependencies);
      });
    });
    it("should work with multiple entry points without deps", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [fileWithoutDependencies, fileWithoutDependencies2]
          );
        assertResolvedFiles(
          graph,
          fileWithoutDependencies,
          fileWithoutDependencies2
        );
        assertDeps(graph, fileWithoutDependencies);
        assertDeps(graph, fileWithoutDependencies2);
      });
    });
    it("should work with an entry point with deps", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [dependsOnWDAndW2]
          );
        assertResolvedFiles(
          graph,
          fileWithoutDependencies,
          fileWithoutDependencies2,
          dependsOnWDAndW2
        );
        assertDeps(graph, fileWithoutDependencies);
        assertDeps(graph, fileWithoutDependencies2);
        assertDeps(
          graph,
          dependsOnWDAndW2,
          fileWithoutDependencies,
          fileWithoutDependencies2
        );
      });
    });
    it("should work with the same file being reachable from multiple entry pints", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [dependsOnWDAndW2, fileWithoutDependencies]
          );
        assertResolvedFiles(
          graph,
          fileWithoutDependencies,
          fileWithoutDependencies2,
          dependsOnWDAndW2
        );
        assertDeps(graph, fileWithoutDependencies);
        assertDeps(graph, fileWithoutDependencies2);
        assertDeps(
          graph,
          dependsOnWDAndW2,
          fileWithoutDependencies,
          fileWithoutDependencies2
        );
        const graph2 =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [dependsOnWDAndW2, dependsOnWD]
          );
        assertResolvedFiles(
          graph2,
          fileWithoutDependencies,
          fileWithoutDependencies2,
          dependsOnWDAndW2,
          dependsOnWD
        );
        assertDeps(graph2, fileWithoutDependencies);
        assertDeps(graph2, fileWithoutDependencies2);
        assertDeps(
          graph2,
          dependsOnWDAndW2,
          fileWithoutDependencies,
          fileWithoutDependencies2
        );
        assertDeps(graph2, dependsOnWD, fileWithoutDependencies);
      });
    });
    it("should work with an isolated file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const graph =
          yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
            resolver,
            [dependsOnWDAndW2, fileWithoutDependencies3]
          );
        assertResolvedFiles(
          graph,
          fileWithoutDependencies,
          fileWithoutDependencies2,
          dependsOnWDAndW2,
          fileWithoutDependencies3
        );
        assertDeps(graph, fileWithoutDependencies);
        assertDeps(graph, fileWithoutDependencies2);
        assertDeps(graph, fileWithoutDependencies3);
        assertDeps(
          graph,
          dependsOnWDAndW2,
          fileWithoutDependencies,
          fileWithoutDependencies2
        );
      });
    });
    describe("Cyclic dependencies", function () {
      const PROJECT = "cyclic-dependencies-project";
      (0, project_1.useFixtureProject)(PROJECT);
      let localResolver;
      before("Get project root", function () {
        return __awaiter(this, void 0, void 0, function* () {
          localResolver = new resolver_1.Resolver(
            yield (0, project_1.getFixtureProjectPath)(PROJECT),
            new parse_1.Parser(),
            {},
            (absolutePath) =>
              fs_extra_1.default.readFile(absolutePath, { encoding: "utf8" }),
            (sourceName) =>
              __awaiter(this, void 0, void 0, function* () {
                return sourceName;
              })
          );
        });
      });
      it("should work with cyclic dependencies", () =>
        __awaiter(this, void 0, void 0, function* () {
          const fileA = yield localResolver.resolveSourceName(
            "contracts/A.sol"
          );
          const fileB = yield localResolver.resolveSourceName(
            "contracts/B.sol"
          );
          const graph =
            yield dependencyGraph_1.DependencyGraph.createFromResolvedFiles(
              localResolver,
              [fileA]
            );
          const graphFiles = Array.from(graph.getResolvedFiles());
          graphFiles.sort((a, b) =>
            a.absolutePath.localeCompare(b.absolutePath)
          );
          chai_1.assert.equal(graphFiles.length, 2);
          const [graphsA, graphsB] = graphFiles;
          chai_1.assert.deepEqual(graphsA, fileA);
          chai_1.assert.deepEqual(graphsB, fileB);
          chai_1.assert.equal(graph.getDependencies(graphsA).length, 1);
          const graphsADep = Array.from(
            graph.getDependencies(graphsA).values()
          )[0];
          chai_1.assert.deepEqual(graphsADep, fileB);
          chai_1.assert.equal(graph.getDependencies(graphsB).length, 1);
          const graphsBDep = graph.getDependencies(graphsB)[0];
          chai_1.assert.deepEqual(graphsBDep, fileA);
        }));
    });
  });
  describe("getConnectedComponents", function () {
    it("single file", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const [graph, [Foo]] = yield (0, helpers_1.createMockData)([
          { file: FooMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
        ]);
      });
    });
    it("two independent files", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const [graph, [Foo, Bar]] = yield (0, helpers_1.createMockData)([
          { file: FooMock },
          { file: BarMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 2);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
        ]);
        chai_1.assert.sameMembers(connectedComponents[1].getResolvedFiles(), [
          Bar,
        ]);
      });
    });
    it("one file imports another one", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const [graph, [Foo, Bar]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock] },
          { file: BarMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
        ]);
      });
    });
    it("one file imports a library", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const LibMock = new helpers_1.MockFile(
          "Lib",
          ["^0.5.0"],
          "SomeLibrary"
        );
        const [graph, [Foo, Lib]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [LibMock] },
          { file: LibMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Lib,
        ]);
      });
    });
    it("two files loop", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const [graph, [Foo, Bar]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock] },
          { file: BarMock, dependencies: [FooMock] },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
        ]);
      });
    });
    it("three files sequential import", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const QuxMock = new helpers_1.MockFile("Qux", ["^0.5.0"]);
        const [graph, [Foo, Bar, Qux]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock] },
          { file: BarMock, dependencies: [QuxMock] },
          { file: QuxMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
          Qux,
        ]);
      });
    });
    it("three files, Foo->Bar and Qux", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const QuxMock = new helpers_1.MockFile("Qux", ["^0.5.0"]);
        const [graph, [Foo, Bar, Qux]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock] },
          { file: BarMock },
          { file: QuxMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 2);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
        ]);
        chai_1.assert.sameMembers(connectedComponents[1].getResolvedFiles(), [
          Qux,
        ]);
      });
    });
    it("three files loop", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const QuxMock = new helpers_1.MockFile("Qux", ["^0.5.0"]);
        const [graph, [Foo, Bar, Qux]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock] },
          { file: BarMock, dependencies: [QuxMock] },
          { file: QuxMock, dependencies: [FooMock] },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
          Qux,
        ]);
      });
    });
    it("three files, one imports the other two", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const QuxMock = new helpers_1.MockFile("Qux", ["^0.5.0"]);
        const [graph, [Foo, Bar, Qux]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [BarMock, QuxMock] },
          { file: BarMock },
          { file: QuxMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
          Qux,
        ]);
      });
    });
    it("three files, two files import the same one", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const FooMock = new helpers_1.MockFile("Foo", ["^0.5.0"]);
        const BarMock = new helpers_1.MockFile("Bar", ["^0.5.0"]);
        const QuxMock = new helpers_1.MockFile("Qux", ["^0.5.0"]);
        const [graph, [Foo, Bar, Qux]] = yield (0, helpers_1.createMockData)([
          { file: FooMock, dependencies: [QuxMock] },
          { file: BarMock, dependencies: [QuxMock] },
          { file: QuxMock },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo,
          Bar,
          Qux,
        ]);
      });
    });
    it("four files, Foo1->Foo2 and Bar1<->Bar2", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Foo1Mock = new helpers_1.MockFile("Foo1", ["^0.5.0"]);
        const Foo2Mock = new helpers_1.MockFile("Foo2", ["^0.5.0"]);
        const Bar1Mock = new helpers_1.MockFile("Bar1", ["^0.5.0"]);
        const Bar2Mock = new helpers_1.MockFile("Bar2", ["^0.5.0"]);
        const [graph, [Foo1, Foo2, Bar1, Bar2]] = yield (0,
        helpers_1.createMockData)([
          { file: Foo1Mock, dependencies: [Foo2Mock] },
          { file: Foo2Mock },
          { file: Bar1Mock, dependencies: [Bar2Mock] },
          { file: Bar2Mock, dependencies: [Bar1Mock] },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 2);
        chai_1.assert.sameMembers(connectedComponents[0].getResolvedFiles(), [
          Foo1,
          Foo2,
        ]);
        chai_1.assert.sameMembers(connectedComponents[1].getResolvedFiles(), [
          Bar1,
          Bar2,
        ]);
      });
    });
    it("five files, three layers, 2-1-2", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Layer1AMock = new helpers_1.MockFile("Layer1A", ["^0.5.0"]);
        const Layer1BMock = new helpers_1.MockFile("Layer1B", ["^0.5.0"]);
        const Layer2Mock = new helpers_1.MockFile("Layer2", ["^0.5.0"]);
        const Layer3AMock = new helpers_1.MockFile("Layer3A", ["^0.5.0"]);
        const Layer3BMock = new helpers_1.MockFile("Layer3B", ["^0.5.0"]);
        const [graph, resolvedFiles] = yield (0, helpers_1.createMockData)([
          { file: Layer1AMock, dependencies: [Layer2Mock] },
          { file: Layer1BMock, dependencies: [Layer2Mock] },
          { file: Layer2Mock, dependencies: [Layer3AMock, Layer3BMock] },
          { file: Layer3AMock, dependencies: [] },
          { file: Layer3BMock, dependencies: [] },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(
          connectedComponents[0].getResolvedFiles(),
          resolvedFiles
        );
      });
    });
    it("six files, three layers, 2-2-2", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const Layer1AMock = new helpers_1.MockFile("Layer1A", ["^0.5.0"]);
        const Layer1BMock = new helpers_1.MockFile("Layer1B", ["^0.5.0"]);
        const Layer2AMock = new helpers_1.MockFile("Layer2A", ["^0.5.0"]);
        const Layer2BMock = new helpers_1.MockFile("Layer2B", ["^0.5.0"]);
        const Layer3AMock = new helpers_1.MockFile("Layer3A", ["^0.5.0"]);
        const Layer3BMock = new helpers_1.MockFile("Layer3B", ["^0.5.0"]);
        const [graph, resolvedFiles] = yield (0, helpers_1.createMockData)([
          { file: Layer1AMock, dependencies: [Layer2AMock, Layer2BMock] },
          { file: Layer1BMock, dependencies: [Layer2AMock, Layer2BMock] },
          { file: Layer2AMock, dependencies: [Layer3AMock, Layer3BMock] },
          { file: Layer2BMock, dependencies: [Layer3AMock, Layer3BMock] },
          { file: Layer3AMock, dependencies: [] },
          { file: Layer3BMock, dependencies: [] },
        ]);
        const connectedComponents = graph.getConnectedComponents();
        chai_1.assert.lengthOf(connectedComponents, 1);
        chai_1.assert.sameMembers(
          connectedComponents[0].getResolvedFiles(),
          resolvedFiles
        );
      });
    });
  });
});
