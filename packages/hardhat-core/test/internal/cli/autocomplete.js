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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const os = __importStar(require("os"));
const autocomplete_1 = require("../../../src/internal/cli/autocomplete");
const reset_1 = require("../../../src/internal/reset");
const project_1 = require("../../helpers/project");
/**
 * Receive the line that is being completed, for example:
 * - `hh ` is the minimal line that can be completed (notice the space!)
 * - `hh comp` means that the cursor is immediately after the word
 * - `hh --network | compile` you can optionally use `|` to indicate the cursor's position; otherwise it is assumed the cursor is at the end
 */
function complete(lineWithCursor) {
  return __awaiter(this, void 0, void 0, function* () {
    const point = lineWithCursor.indexOf("|");
    const line = lineWithCursor.replace("|", "");
    return (0, autocomplete_1.complete)({
      line,
      point: point !== -1 ? point : line.length,
    });
  });
}
const coreTasks = [
  {
    description: "Check whatever you need",
    name: "check",
  },
  {
    description: "Clears the cache and deletes all artifacts",
    name: "clean",
  },
  {
    description: "Compiles the entire project, building all artifacts",
    name: "compile",
  },
  {
    description: "Opens a hardhat console",
    name: "console",
  },
  {
    description:
      "Flattens and prints contracts and their dependencies. If no file is passed, all the contracts in the project will be flattened.",
    name: "flatten",
  },
  {
    description: "Prints this message",
    name: "help",
  },
  {
    description: "Starts a JSON-RPC server on top of Hardhat Network",
    name: "node",
  },
  {
    description: "Runs a user-defined script after compiling the project",
    name: "run",
  },
  {
    description: "Runs mocha tests",
    name: "test",
  },
  // 'vars' is a scope
  {
    description: "Manage your configuration variables",
    name: "vars",
  },
];
const verboseParam = {
  description: "Enables Hardhat verbose logging",
  name: "--verbose",
};
const versionParam = {
  description: "Shows hardhat's version.",
  name: "--version",
};
const coreParams = [
  {
    description: "The network to connect to.",
    name: "--network",
  },
  {
    description: "Show stack traces (always enabled on CI servers).",
    name: "--show-stack-traces",
  },
  versionParam,
  {
    description: "Shows this message, or a task's help if its name is provided",
    name: "--help",
  },
  {
    description: "Use emoji in messages.",
    name: "--emoji",
  },
  {
    description: "A Hardhat config file.",
    name: "--config",
  },
  {
    description: "The maximum amount of memory that Hardhat can use.",
    name: "--max-memory",
  },
  {
    description: "A TypeScript config file.",
    name: "--tsconfig",
  },
  verboseParam,
  {
    description: "Generate a flamegraph of your Hardhat tasks",
    name: "--flamegraph",
  },
  {
    description: "Enable TypeScript type-checking of your scripts/tests",
    name: "--typecheck",
  },
];
const forceParam = {
  description: "Force compilation ignoring cache",
  name: "--force",
};
const quietParam = {
  description: "Makes the compilation process less verbose",
  name: "--quiet",
};
const concurrencyParam = {
  description:
    "Number of compilation jobs executed in parallel. Defaults to the number of CPU cores - 1",
  name: "--concurrency",
};
describe("autocomplete", function () {
  if (os.type() === "Windows_NT") {
    return;
  }
  describe("basic project", () => {
    (0, project_1.useFixtureProject)("autocomplete/basic-project");
    after(() => {
      (0, reset_1.resetHardhatContext)();
    });
    it("should suggest all task names", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh ");
        (0, chai_1.expect)(suggestions).to.have.deep.members(coreTasks);
      }));
    it("should suggest all tasks' names that starts with the correct letters", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh t");
        (0, chai_1.expect)(suggestions).same.deep.members([
          {
            name: "test",
            description: "Runs mocha tests",
          },
        ]);
      }));
    it("should suggest all core params after a -", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh -");
        (0, chai_1.expect)(suggestions).to.have.deep.members(coreParams);
      }));
    it("should suggest all core params after a --", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --");
        (0, chai_1.expect)(suggestions).same.deep.members(coreParams);
      }));
    it("should suggest ony matching flags", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --ve");
        (0, chai_1.expect)(suggestions).same.deep.members([
          {
            name: "--verbose",
            description: "Enables Hardhat verbose logging",
          },
          {
            name: "--version",
            description: "Shows hardhat's version.",
          },
        ]);
      }));
    it("shouldn't suggest an already used flag", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --verbose -");
        const coreParamsWithoutVerbose = coreParams.filter(
          (x) => x.name !== "--verbose"
        );
        (0, chai_1.expect)(suggestions).same.deep.members(
          coreParamsWithoutVerbose
        );
      }));
    it("should suggest task flags", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile -");
        (0, chai_1.expect)(suggestions).same.deep.members([
          ...coreParams,
          forceParam,
          quietParam,
          concurrencyParam,
        ]);
      }));
    it("should ignore already used flags", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --verbose compile --quiet --");
        const coreParamsWithoutVerbose = coreParams.filter(
          (x) => x.name !== "--verbose"
        );
        (0, chai_1.expect)(suggestions).same.deep.members([
          ...coreParamsWithoutVerbose,
          forceParam,
          concurrencyParam,
        ]);
      }));
    it("should suggest a network", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --network ");
        (0, chai_1.expect)(suggestions).same.deep.members([
          { name: "hardhat", description: "" },
          { name: "localhost", description: "" },
        ]);
      }));
    it("should suggest task names after global param", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --network localhost ");
        (0, chai_1.expect)(suggestions).same.deep.members(coreTasks);
      }));
    it("should suggest params after some param", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --network localhost -");
        const coreParamsWithoutNetwork = coreParams.filter(
          (x) => x.name !== "--network"
        );
        (0, chai_1.expect)(suggestions).same.deep.members(
          coreParamsWithoutNetwork
        );
      }));
    it("should work when the cursor is not at the end", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --network | test");
        (0, chai_1.expect)(suggestions).same.deep.members([
          { name: "hardhat", description: "" },
          { name: "localhost", description: "" },
        ]);
      }));
    it("should not suggest flags used after the cursor", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --| test --verbose");
        const coreParamsWithoutVerbose = coreParams.filter(
          (x) => x.name !== "--verbose"
        );
        (0, chai_1.expect)(suggestions).same.deep.members([
          ...coreParamsWithoutVerbose,
          {
            description: "Don't compile before running this task",
            name: "--no-compile",
          },
          {
            description: "Run tests in parallel",
            name: "--parallel",
          },
          {
            description: "Stop running tests after the first test failure",
            name: "--bail",
          },
          {
            description: "Only run tests matching the given string or regexp",
            name: "--grep",
          },
        ]);
      }));
    it("should work when the cursor is at the middle and in a partial word", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh com| --verbose");
        (0, chai_1.expect)(suggestions).same.deep.members([
          {
            name: "compile",
            description: "Compiles the entire project, building all artifacts",
          },
        ]);
      }));
    it("should show suggestions after a partial network value", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh --network loc");
        (0, chai_1.expect)(suggestions).same.deep.members([
          { name: "localhost", description: "" },
        ]);
      }));
    it("should not suggest params after a task if the last word doesn't start with --", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config config.js ");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh run ");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames after a partial word", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config ha");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames after a partial word that starts with --", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config --");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames inside a directory", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config scripts/");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames inside a directory after a partial file", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config scripts/fo");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete hidden filenames inside a directory after a dot", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config scripts/.");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete hidden filenames inside a directory after a partial word", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh compile --config scripts/.hi");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should complete filenames inside a nested directory", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete(
          "hh compile --config scripts/nested/"
        );
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
    it("should not confuse arguments as scopes", () =>
      __awaiter(this, void 0, void 0, function* () {
        // "flatten" should not be identified as scope and "contracts/foo.sol" should
        // not be identified as task
        const suggestions = yield complete("hh flatten contracts/foo.sol");
        (0, chai_1.expect)(suggestions).to.equal(
          autocomplete_1.HARDHAT_COMPLETE_FILES
        );
      }));
  });
  describe("custom tasks", () => {
    (0, project_1.useFixtureProject)("autocomplete/custom-tasks");
    after(() => {
      (0, reset_1.resetHardhatContext)();
    });
    it("should include custom tasks", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh ");
        (0, chai_1.expect)(suggestions).to.have.deep.members([
          ...coreTasks,
          {
            name: "my-task",
            description: "",
          },
          {
            name: "task-with-description",
            description: "This is the task description",
          },
        ]);
      }));
    it("should complete tasks after a - in the middle of the task name", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh my-");
        (0, chai_1.expect)(suggestions).to.have.deep.members([
          {
            name: "my-task",
            description: "",
          },
        ]);
      }));
    it("should include custom params", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh my-task --");
        (0, chai_1.expect)(suggestions).to.have.deep.members([
          ...coreParams,
          { name: "--my-flag", description: "" },
          { name: "--param", description: "" },
          {
            name: "--my-flag-with-description",
            description: "Flag description",
          },
          {
            name: "--param-with-description",
            description: "Param description",
          },
        ]);
      }));
  });
  describe("overridden task", () => {
    (0, project_1.useFixtureProject)("autocomplete/overridden-task");
    after(() => {
      (0, reset_1.resetHardhatContext)();
    });
    it("should work when a task is overridden", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh ");
        (0, chai_1.expect)(suggestions).to.have.deep.members(coreTasks);
      }));
    it("should work when called a second time", () =>
      __awaiter(this, void 0, void 0, function* () {
        const suggestions = yield complete("hh ");
        (0, chai_1.expect)(suggestions).to.have.deep.members(coreTasks);
      }));
  });
  describe("scopes", () => {
    describe("autocomplete the scope'tasks", () => {
      (0, project_1.useFixtureProject)("autocomplete/basic-project");
      it("should suggest the tasks assigned to a scope", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh vars ");
          (0, chai_1.expect)(suggestions).same.deep.members([
            {
              description: "Set the value of a configuration variable",
              name: "set",
            },
            {
              description: "Get the value of a configuration variable",
              name: "get",
            },
            {
              description: "List all the configuration variables",
              name: "list",
            },
            {
              description: "Delete a configuration variable",
              name: "delete",
            },
            {
              description:
                "Show the path of the file where all the configuration variables are stored",
              name: "path",
            },
            {
              description:
                "Show how to setup the configuration variables used by this project",
              name: "setup",
            },
          ]);
        }));
    });
    describe("custom scopes", () => {
      (0, project_1.useFixtureProject)("autocomplete/custom-scopes");
      after(() => {
        (0, reset_1.resetHardhatContext)();
      });
      it("should include custom scopes", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh ");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            ...coreTasks,
            {
              name: "scope1",
              description: "",
            },
            {
              name: "scope-2",
              description: "scope-2 description",
            },
            {
              name: "scope-3",
              description: "scope-3 description",
            },
          ]);
        }));
      it("should complete scopes after a - in the middle of the scope name", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope-");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "scope-2",
              description: "scope-2 description",
            },
            {
              name: "scope-3",
              description: "scope-3 description",
            },
          ]);
        }));
      it("should autocomplete with the scope's tasks", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope1 ");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "task1",
              description: "task1 description",
            },
            {
              name: "task2",
              description: "task2 description",
            },
          ]);
        }));
      it("should not autocomplete with the scope's tasks, because there are no tasks assigned", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope-2 ");
          (0, chai_1.expect)(suggestions).to.have.deep.members([]);
        }));
      it("should autocomplete with the scope's task's flags and the core parameters", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope1 task2 --flag --");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "--flag1",
              description: "flag1 description",
            },
            {
              name: "--flag2",
              description: "",
            },
            {
              name: "--tmpflag",
              description: "",
            },
            ...coreParams,
          ]);
        }));
      it("should autocomplete with the matching flags", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope1 task2 --fla");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "--flag1",
              description: "flag1 description",
            },
            {
              name: "--flag2",
              description: "",
            },
            {
              description: "Generate a flamegraph of your Hardhat tasks",
              name: "--flamegraph",
            },
          ]);
        }));
      it("should autocomplete with the matching flags that haven't been used yet", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete(
            "hh scope1 --flamegraph task2 --fla"
          );
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "--flag1",
              description: "flag1 description",
            },
            {
              name: "--flag2",
              description: "",
            },
          ]);
        }));
      it("should autocomplete with a scope's task that has the same name as the scope itself", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope-3 s");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "scope-3",
              description: "task description",
            },
          ]);
        }));
      it("should autocomplete with a scope's task that has the same name as a stand alone task", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope-3 c");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "compile",
              description: "",
            },
          ]);
        }));
      it("should autocomplete with a scope's task that with the task being declared after a flag", () =>
        __awaiter(this, void 0, void 0, function* () {
          const suggestions = yield complete("hh scope-3 --verbose c");
          (0, chai_1.expect)(suggestions).to.have.deep.members([
            {
              name: "compile",
              description: "",
            },
          ]);
        }));
    });
  });
});
