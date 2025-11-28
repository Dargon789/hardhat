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
const task_names_1 = require("../../src/builtin-tasks/task-names");
const environment_1 = require("../helpers/environment");
const project_1 = require("../helpers/project");
describe("node task", () => {
  (0, project_1.useFixtureProject)("default-config-project");
  (0, environment_1.useEnvironment)();
  it("should terminate", function () {
    return __awaiter(this, void 0, void 0, function* () {
      this.env.tasks[task_names_1.TASK_NODE_SERVER_READY].setAction(
        ({ server }) =>
          __awaiter(this, void 0, void 0, function* () {
            server.close();
          })
      );
      yield this.env.run(task_names_1.TASK_NODE);
      // NB: If a file watcher persists past this test, then mocha will fail to exit cleanly.
    });
  });
});
