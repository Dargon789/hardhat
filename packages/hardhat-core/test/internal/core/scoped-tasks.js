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
const chai_1 = require("chai");
const project_1 = require("../../helpers/project");
const environment_1 = require("../../helpers/environment");
describe("scoped tasks", () => {
  (0, project_1.useFixtureProject)("scoped-tasks");
  (0, environment_1.useEnvironment)();
  it("should include scopes in the hre", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const scopes = Object.keys(this.env.scopes);
      // vars is a builtin scope
      chai_1.assert.sameMembers(scopes, ["vars", "my-scope", "another-scope"]);
      chai_1.assert.equal(this.env.scopes["my-scope"].name, "my-scope");
      chai_1.assert.equal(
        this.env.scopes["my-scope"].description,
        "my-scope description"
      );
      chai_1.assert.equal(
        this.env.scopes["another-scope"].name,
        "another-scope"
      );
      chai_1.assert.equal(
        this.env.scopes["another-scope"].description,
        "overridden: another-scope description"
      );
    });
  });
  it("shouldn't include scoped tasks in hre.tasks", function () {
    return __awaiter(this, void 0, void 0, function* () {
      chai_1.assert.isUndefined(this.env.tasks["my-task"]);
      chai_1.assert.isDefined(this.env.scopes["my-scope"].tasks["my-task"]);
    });
  });
  it("should be possible to run scoped tasks programmatically", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.env.run({
        scope: "my-scope",
        task: "my-task",
      });
      chai_1.assert.equal(result, "my-scope/my-task");
    });
  });
  it("should run overridden tasks", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.env.run({
        scope: "my-scope",
        task: "overridden-task",
      });
      chai_1.assert.equal(result, "overridden: my-scope/overridden-task");
    });
  });
  it("should run subtasks", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.env.run({
        scope: "my-scope",
        task: "my-subtask",
      });
      chai_1.assert.equal(result, "my-scope/my-subtask");
    });
  });
  it("should run overridden subtasks", function () {
    return __awaiter(this, void 0, void 0, function* () {
      const result = yield this.env.run({
        scope: "my-scope",
        task: "my-overridden-subtask",
      });
      chai_1.assert.equal(result, "overridden: my-scope/my-overridden-subtask");
    });
  });
});
