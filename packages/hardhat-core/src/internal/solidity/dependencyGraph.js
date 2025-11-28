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
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyGraph = void 0;
const errors_1 = require("../core/errors");
const errors_list_1 = require("../core/errors-list");
class DependencyGraph {
  static createFromResolvedFiles(resolver, resolvedFiles) {
    return __awaiter(this, void 0, void 0, function* () {
      const graph = new DependencyGraph();
      // TODO refactor this to make the results deterministic
      yield Promise.all(
        resolvedFiles.map((resolvedFile) =>
          graph._addDependenciesFrom(resolver, resolvedFile)
        )
      );
      return graph;
    });
  }
  constructor() {
    this._resolvedFiles = new Map();
    this._dependenciesPerFile = new Map();
    // map absolute paths to source names
    this._visitedFiles = new Map();
  }
  getResolvedFiles() {
    return Array.from(this._resolvedFiles.values());
  }
  has(file) {
    return this._resolvedFiles.has(file.sourceName);
  }
  isEmpty() {
    return this._resolvedFiles.size === 0;
  }
  entries() {
    return Array.from(this._dependenciesPerFile.entries()).map(
      ([key, value]) => [this._resolvedFiles.get(key), value]
    );
  }
  getDependencies(file) {
    var _a;
    const dependencies =
      (_a = this._dependenciesPerFile.get(file.sourceName)) !== null &&
      _a !== void 0
        ? _a
        : new Set();
    return [...dependencies];
  }
  getTransitiveDependencies(file) {
    const visited = new Set();
    const transitiveDependencies = this._getTransitiveDependencies(
      file,
      visited,
      []
    );
    return [...transitiveDependencies];
  }
  getConnectedComponents() {
    var _a, _b;
    const undirectedGraph = {};
    for (const [
      sourceName,
      dependencies,
    ] of this._dependenciesPerFile.entries()) {
      undirectedGraph[sourceName] =
        (_a = undirectedGraph[sourceName]) !== null && _a !== void 0
          ? _a
          : new Set();
      for (const dependency of dependencies) {
        undirectedGraph[dependency.sourceName] =
          (_b = undirectedGraph[dependency.sourceName]) !== null &&
          _b !== void 0
            ? _b
            : new Set();
        undirectedGraph[sourceName].add(dependency.sourceName);
        undirectedGraph[dependency.sourceName].add(sourceName);
      }
    }
    const components = [];
    const visited = new Set();
    for (const node of Object.keys(undirectedGraph)) {
      if (visited.has(node)) {
        continue;
      }
      visited.add(node);
      const component = new Set([node]);
      const stack = [...undirectedGraph[node]];
      while (stack.length > 0) {
        const newNode = stack.pop();
        if (visited.has(newNode)) {
          continue;
        }
        visited.add(newNode);
        component.add(newNode);
        [...undirectedGraph[newNode]].forEach((adjacent) => {
          if (!visited.has(adjacent)) {
            stack.push(adjacent);
          }
        });
      }
      components.push(component);
    }
    const connectedComponents = [];
    for (const component of components) {
      const dependencyGraph = new DependencyGraph();
      for (const sourceName of component) {
        const file = this._resolvedFiles.get(sourceName);
        const dependencies = this._dependenciesPerFile.get(sourceName);
        dependencyGraph._resolvedFiles.set(sourceName, file);
        dependencyGraph._dependenciesPerFile.set(sourceName, dependencies);
      }
      connectedComponents.push(dependencyGraph);
    }
    return connectedComponents;
  }
  _getTransitiveDependencies(file, visited, path) {
    if (visited.has(file)) {
      return new Set();
    }
    visited.add(file);
    const directDependencies = this.getDependencies(file).map((dependency) => ({
      dependency,
      path,
    }));
    const transitiveDependencies = new Set(directDependencies);
    for (const { dependency } of transitiveDependencies) {
      this._getTransitiveDependencies(
        dependency,
        visited,
        path.concat(dependency)
      ).forEach((x) => transitiveDependencies.add(x));
    }
    return transitiveDependencies;
  }
  _addDependenciesFrom(resolver, file) {
    return __awaiter(this, void 0, void 0, function* () {
      const sourceName = this._visitedFiles.get(file.absolutePath);
      if (sourceName !== undefined) {
        if (sourceName !== file.sourceName) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.RESOLVER.AMBIGUOUS_SOURCE_NAMES,
            {
              sourcenames: `'${sourceName}' and '${file.sourceName}'`,
              file: file.absolutePath,
            }
          );
        }
        return;
      }
      this._visitedFiles.set(file.absolutePath, file.sourceName);
      const dependencies = new Set();
      this._resolvedFiles.set(file.sourceName, file);
      this._dependenciesPerFile.set(file.sourceName, dependencies);
      // TODO refactor this to make the results deterministic
      yield Promise.all(
        file.content.imports.map((imp) =>
          __awaiter(this, void 0, void 0, function* () {
            const dependency = yield resolver.resolveImport(file, imp);
            dependencies.add(dependency);
            yield this._addDependenciesFrom(resolver, dependency);
          })
        )
      );
    });
  }
}
exports.DependencyGraph = DependencyGraph;
