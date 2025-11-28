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
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const dsl_1 = require("../../../../src/internal/core/tasks/dsl");
const errors_1 = require("../../../helpers/errors");
describe("TasksDSL", () => {
  let dsl;
  beforeEach(() => {
    dsl = new dsl_1.TasksDSL();
  });
  it("should add a task", () => {
    const taskName = "compile";
    const description = "compiler task description";
    const action = () => __awaiter(void 0, void 0, void 0, function* () {});
    const task = dsl.task(taskName, description, action);
    chai_1.assert.equal(task.name, taskName);
    chai_1.assert.equal(task.description, description);
    chai_1.assert.equal(task.action, action);
    chai_1.assert.isFalse(task.isSubtask);
  });
  it("should add a subtask", () => {
    const action = () => __awaiter(void 0, void 0, void 0, function* () {});
    const task = dsl.subtask("compile", "compiler task description", action);
    chai_1.assert.isTrue(task.isSubtask);
  });
  it("should add a subtask through the internalTask alias", () => {
    const action = () => __awaiter(void 0, void 0, void 0, function* () {});
    const task = dsl.internalTask(
      "compile",
      "compiler task description",
      action
    );
    chai_1.assert.isTrue(task.isSubtask);
  });
  it("should add a task without description", () => {
    const action = () => __awaiter(void 0, void 0, void 0, function* () {});
    const task = dsl.task("compile", action);
    chai_1.assert.isUndefined(task.description);
    chai_1.assert.equal(task.action, action);
  });
  it("should add a task with default action", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const task = dsl.task("compile", "a description");
      chai_1.assert.isDefined(task.description);
      chai_1.assert.isDefined(task.action);
      const runSuperNop = () =>
        __awaiter(void 0, void 0, void 0, function* () {});
      runSuperNop.isDefined = false;
      yield (0,
      errors_1.expectHardhatErrorAsync)(() => task.action({}, {}, runSuperNop), errors_list_1.ERRORS.TASK_DEFINITIONS.ACTION_NOT_SET);
    }));
  it("should create a scope without a description", () => {
    const scope = dsl.scope("solidity");
    chai_1.assert.equal(scope.name, "solidity");
    chai_1.assert.isUndefined(scope.description);
  });
  it("should create a scope with a description", () => {
    const scope = dsl.scope("solidity", "solidity tasks");
    chai_1.assert.equal(scope.name, "solidity");
    chai_1.assert.equal(scope.description, "solidity tasks");
  });
  it("should override the description of a scope without description", () => {
    const scope = dsl.scope("solidity");
    chai_1.assert.equal(scope.name, "solidity");
    chai_1.assert.isUndefined(scope.description);
    const newScope = dsl.scope("solidity", "solidity tasks");
    chai_1.assert.equal(newScope.name, "solidity");
    chai_1.assert.equal(newScope.description, "solidity tasks");
    chai_1.assert.equal(scope, newScope);
  });
  it("should override the description of a scope with a description", () => {
    const scope = dsl.scope("solidity", "solidity tasks");
    chai_1.assert.equal(scope.name, "solidity");
    chai_1.assert.equal(scope.description, "solidity tasks");
    const newScope = dsl.scope("solidity", "solidity tasks 2");
    chai_1.assert.equal(newScope.name, "solidity");
    chai_1.assert.equal(newScope.description, "solidity tasks 2");
    chai_1.assert.equal(scope, newScope);
  });
  it("should not create a scope if its name clashes with existing task", () => {
    dsl.task("compile"); // no scope
    (0, errors_1.expectHardhatError)(
      () => dsl.scope("compile"),
      errors_list_1.ERRORS.TASK_DEFINITIONS.TASK_SCOPE_CLASH,
      "A clash was found while creating scope 'compile', since a task with that name already exists."
    );
  });
  it("should not create a task if its name clashes with existing scope", () => {
    dsl.scope("compile");
    (0, errors_1.expectHardhatError)(
      () => dsl.task("compile"),
      errors_list_1.ERRORS.TASK_DEFINITIONS.SCOPE_TASK_CLASH,
      "A clash was found while creating task 'compile', since a scope with that name already exists."
    );
  });
  it("should override task", () => {
    const action = () => __awaiter(void 0, void 0, void 0, function* () {});
    const builtin = dsl.task("compile", "built-in", action);
    let tasks = dsl.getTaskDefinitions();
    chai_1.assert.equal(tasks.compile, builtin);
    const custom = dsl.task("compile", "custom", action);
    tasks = dsl.getTaskDefinitions();
    chai_1.assert.equal(tasks.compile, custom);
  });
  it("should return added tasks", () => {
    const task = dsl.task("compile", "built-in");
    const tasks = dsl.getTaskDefinitions();
    chai_1.assert.deepEqual(tasks, { compile: task });
  });
});
