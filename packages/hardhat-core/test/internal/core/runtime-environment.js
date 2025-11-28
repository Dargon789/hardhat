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
const path_1 = __importDefault(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const config_1 = require("../../../src/config");
const context_1 = require("../../../src/internal/context");
const default_config_1 = require("../../../src/internal/core/config/default-config");
const errors_list_1 = require("../../../src/internal/core/errors-list");
const runtime_environment_1 = require("../../../src/internal/core/runtime-environment");
const reset_1 = require("../../../src/internal/reset");
const errors_1 = require("../../helpers/errors");
const project_1 = require("../../helpers/project");
describe("Environment", () => {
  const config = {
    defaultNetwork: "default",
    networks: {
      localhost: Object.assign(
        { url: "http://127.0.0.1:8545" },
        default_config_1.defaultHttpNetworkParams
      ),
      hardhat: Object.assign(
        Object.assign({}, default_config_1.defaultHardhatNetworkParams),
        {
          gas: default_config_1.defaultHardhatNetworkParams.blockGasLimit,
          initialDate: new Date().toISOString(),
          accounts: [],
        }
      ),
      default: Object.assign(
        { url: "http://127.0.0.1:8545" },
        default_config_1.defaultHttpNetworkParams
      ),
    },
    paths: {
      root: "",
      configFile: "",
      cache: "",
      artifacts: "",
      sources: "",
      tests: "",
    },
    solidity: {
      compilers: [
        {
          version: "0.5.0",
          settings: {
            evmVersion: "byzantium",
            optimizer: {
              enabled: false,
              runs: 0,
            },
          },
        },
      ],
      overrides: {},
    },
    mocha: {},
  };
  const args = {
    network: "localhost",
    showStackTraces: false,
    version: false,
    help: false,
    emoji: false,
    verbose: false,
  };
  let tasks;
  let scopes;
  let env;
  let dsl;
  beforeEach(() => {
    const ctx = context_1.HardhatContext.createHardhatContext();
    dsl = ctx.tasksDSL;
    dsl.task("example", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        return 27;
      })
    );
    dsl.scope("scoped").task("task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        return 28;
      })
    );
    dsl
      .task("complexExampleTask", "a complex example task")
      .addPositionalParam(
        "positionalRequiredStringParam",
        "a positional required type 'string' param",
        undefined,
        config_1.types.string,
        false
      )
      .addOptionalPositionalParam(
        "posOptJsonParamWithDefault",
        "a positional optional type 'json' param",
        { a: 1 },
        config_1.types.json
      )
      .setAction((_args) =>
        __awaiter(void 0, void 0, void 0, function* () {
          return _args;
        })
      );
    dsl
      .task("taskWithMultipleTypesParams", "a task with many types params")
      .addFlag("flagParam", "some flag")
      .addOptionalParam(
        "optIntParam",
        "an opt int param",
        123,
        config_1.types.int
      )
      .addOptionalParam(
        "optFloatParam",
        "an opt float param",
        2.5,
        config_1.types.float
      )
      .addOptionalParam(
        "optFileParam",
        "an opt file param",
        undefined,
        config_1.types.inputFile
      )
      .addOptionalParam(
        "optStringParam",
        "an opt string param",
        "some default",
        config_1.types.string
      )
      .addOptionalVariadicPositionalParam(
        "variadicOptStrParam",
        "an opt variadic 'str' param",
        [],
        config_1.types.string
      )
      .setAction((_args) =>
        __awaiter(void 0, void 0, void 0, function* () {
          return _args;
        })
      );
    tasks = ctx.tasksDSL.getTaskDefinitions();
    scopes = ctx.tasksDSL.getScopesDefinitions();
    env = new runtime_environment_1.Environment(config, args, tasks, scopes);
    ctx.setHardhatRuntimeEnvironment(env);
  });
  afterEach(() => (0, reset_1.resetHardhatContext)());
  describe("Environment", () => {
    it("should create an environment", () => {
      chai_1.assert.deepEqual(env.config, config);
      chai_1.assert.isDefined(env.tasks);
      chai_1.assert.isDefined(env.network);
      chai_1.assert.isDefined(env.version);
      chai_1.assert.isString(env.version);
    });
    it("should run a task correctly", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield env.run("example");
        chai_1.assert.equal(ret, 27);
      }));
    it("should run a scoped task correctly", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        const ret = yield env.run({ scope: "scoped", task: "task" });
        chai_1.assert.equal(ret, 28);
      }));
    it("should throw if the scope doesn't exist", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => env.run({ scope: "scopd", task: "task" }), errors_list_1.ERRORS.ARGUMENTS.UNRECOGNIZED_SCOPE);
      }));
    it("should throw if a scoped task doesn't exist", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => env.run({ scope: "scoped", task: "tsk" }), errors_list_1.ERRORS.ARGUMENTS.UNRECOGNIZED_SCOPED_TASK);
      }));
    it("should not run a scoped task with just task name", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => env.run("task"), errors_list_1.ERRORS.ARGUMENTS.UNRECOGNIZED_TASK);
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => env.run({ task: "task" }), errors_list_1.ERRORS.ARGUMENTS.UNRECOGNIZED_TASK);
      }));
    describe("run task arguments validation", () => {
      it("should throw on missing required argument", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const taskName = "complexExampleTask";
          const requiredParamName = "positionalRequiredStringParam";
          const task = env.tasks[taskName];
          const param = task.positionalParamDefinitions.find(
            ({ name }) => name === requiredParamName
          );
          chai_1.assert.isDefined(param);
          // task runs with required param present
          const taskResult = yield env.run(taskName, {
            [requiredParamName]: "some value",
          });
          chai_1.assert.isDefined(taskResult);
          // same task throws with required param missing
          yield (0, errors_1.expectHardhatErrorAsync)(
            () =>
              __awaiter(void 0, void 0, void 0, function* () {
                yield env.run("complexExampleTask", {});
              }),
            errors_list_1.ERRORS.ARGUMENTS.MISSING_TASK_ARGUMENT,
            "HH306: The 'positionalRequiredStringParam' parameter of task 'complexExampleTask' expects a value, but none was passed."
          );
        }));
      it("should use default value on missing optional argument with default param", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const taskName = "complexExampleTask";
          const optParamName = "posOptJsonParamWithDefault";
          const task = env.tasks[taskName];
          const param = task.positionalParamDefinitions.find(
            ({ name }) => name === optParamName
          );
          chai_1.assert.isDefined(param);
          // specified arg value, should be different from the default for this test
          const paramValue = { value: 20 };
          const { defaultValue } = param;
          chai_1.assert.notEqual(defaultValue, paramValue);
          const taskMinimalArgs = {
            positionalRequiredStringParam: "a string value",
          };
          const taskArgumentsSpecified = Object.assign(
            Object.assign({}, taskMinimalArgs),
            { [optParamName]: paramValue }
          );
          // setup task action spy
          const taskActionSpy = sinon_1.default.spy(task, "action");
          // task should run with *specified* value on defined param argument
          yield env.run(taskName, taskArgumentsSpecified);
          // task should run with *default* value on empty param argument
          yield env.run(taskName, taskMinimalArgs);
          // assertions
          const [taskWithSpecifiedArgsCall, taskWithDefaultArgsCall] =
            taskActionSpy.getCalls();
          chai_1.assert.equal(
            taskWithSpecifiedArgsCall.args[0][optParamName],
            paramValue,
            "should include specified param value in task action call"
          );
          chai_1.assert.equal(
            taskWithDefaultArgsCall.args[0][optParamName],
            defaultValue,
            "should include default param value in task action call"
          );
        }));
      it("should validate argument type matches the param type", () =>
        __awaiter(void 0, void 0, void 0, function* () {
          const taskName = "taskWithMultipleTypesParams";
          const typesValidationTestCases = {
            flagParam: { valid: true, invalid: 1 },
            optIntParam: { valid: 10, invalid: 1.2 },
            optFloatParam: { valid: 1.2, invalid: NaN },
            optStringParam: { valid: "a string", invalid: 123 },
            optFileParam: { valid: __filename, invalid: __dirname },
            variadicOptStrParam: { valid: ["a", "b"], invalid: ["a", 1] },
          };
          const expectTaskRunsSuccesfully = (taskNameToRun, taskArguments) =>
            __awaiter(void 0, void 0, void 0, function* () {
              var _a;
              const argsString = JSON.stringify(taskArguments);
              try {
                yield env.run(taskNameToRun, taskArguments);
              } catch (error) {
                chai_1.assert.fail(
                  error,
                  undefined,
                  `Should not throw error task ${taskNameToRun} with args ${argsString}. Error message: ${
                    (_a = error.message) !== null && _a !== void 0 ? _a : error
                  }`
                );
              }
            });
          const expectTaskRunsWithError = (taskNameToRun, taskArguments) =>
            __awaiter(void 0, void 0, void 0, function* () {
              yield (0, errors_1.expectHardhatErrorAsync)(
                () =>
                  __awaiter(void 0, void 0, void 0, function* () {
                    yield env.run(taskNameToRun, taskArguments);
                    console.error(
                      `should have thrown task run: '${taskNameToRun}' with arguments: `,
                      taskArguments
                    );
                  }),
                errors_list_1.ERRORS.ARGUMENTS.INVALID_VALUE_FOR_TYPE
              );
            });
          for (const [paramName, { valid, invalid }] of Object.entries(
            typesValidationTestCases
          )) {
            // should run task successfully with valid type arguments
            const validTaskArguments = { [paramName]: valid };
            yield expectTaskRunsSuccesfully(taskName, validTaskArguments);
            // should throw error with argument of type not same type as the param type
            const invalidTaskArguments = { [paramName]: invalid };
            yield expectTaskRunsWithError(taskName, invalidTaskArguments);
          }
        }));
    });
    it("should fail trying to run a non existent task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => env.run("invalid"), errors_list_1.ERRORS.ARGUMENTS.UNRECOGNIZED_TASK);
      }));
    it("should clean global state after task execution", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        chai_1.assert.equal(yield env.run("example"), 27);
        const globalAsAny = global;
        chai_1.assert.isUndefined(globalAsAny.hre);
        chai_1.assert.isUndefined(globalAsAny.runSuper);
        chai_1.assert.isUndefined(globalAsAny.env);
      }));
    it("should run overridden task correctly", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("example", "description", () =>
          __awaiter(void 0, void 0, void 0, function* () {
            return 28;
          })
        );
        tasks = dsl.getTaskDefinitions();
        scopes = dsl.getScopesDefinitions();
        const localEnv = new runtime_environment_1.Environment(
          config,
          args,
          tasks,
          scopes
        );
        chai_1.assert.equal(yield localEnv.run("example"), 28);
      }));
    it("Should preserve the injected env after running a sub-task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("with-subtask", "description", ({}, hre, runSuper) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const { run, config: theConfig, network } = hre;
            const globalAsAny = global;
            chai_1.assert.equal(globalAsAny.hre, hre);
            chai_1.assert.equal(globalAsAny.config, theConfig);
            chai_1.assert.isDefined(globalAsAny.config);
            chai_1.assert.equal(globalAsAny.runSuper, runSuper);
            chai_1.assert.isDefined(globalAsAny.network);
            yield run("example");
            chai_1.assert.equal(globalAsAny.hre, hre);
            chai_1.assert.equal(globalAsAny.config, theConfig);
            chai_1.assert.equal(globalAsAny.runSuper, runSuper);
            chai_1.assert.equal(globalAsAny.network, network);
          })
        );
        yield env.run("with-subtask");
      }));
    it("Should preserve added fields in the HRE after running a sub-task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("with-subtask", "description", ({}, hre, _runSuper) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const modifiedHre = hre;
            modifiedHre.newField = 123;
            yield modifiedHre.run("example");
            yield hre.run("example");
            chai_1.assert.equal(modifiedHre.newField, 123);
          })
        );
        yield env.run("with-subtask");
      }));
    it("Should preserve monkey-patched fields in the HRE after running a sub-task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("with-subtask", "description", ({}, hre, _runSuper) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const modifiedHre = hre;
            modifiedHre.network = 123;
            yield modifiedHre.run("example");
            yield hre.run("example");
            chai_1.assert.equal(modifiedHre.network, 123);
          })
        );
        yield env.run("with-subtask");
      }));
    it("Should pass new fields in the HRE after running a sub-task", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("with-subtask", "description", ({}, hre, _runSuper) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const modifiedHre = hre;
            modifiedHre.newField = 123;
            yield modifiedHre.run("subtask");
            chai_1.assert.equal(modifiedHre.newField, 123);
          })
        );
        dsl.task("subtask", "description", ({}, hre, _runSuper) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const theHre = hre;
            chai_1.assert.equal(theHre.newField, 123);
          })
        );
        yield env.run("with-subtask");
      }));
    it("Should define the network field correctly", () => {
      chai_1.assert.isDefined(env.network);
      chai_1.assert.equal(env.network.name, "localhost");
      chai_1.assert.equal(env.network.config, config.networks.localhost);
    });
    it("Should throw if the chosen network doesn't exist", () => {
      (0, errors_1.expectHardhatError)(() => {
        const ctx = context_1.HardhatContext.getHardhatContext();
        env = new runtime_environment_1.Environment(
          config,
          Object.assign(Object.assign({}, args), { network: "NOPE" }),
          tasks,
          scopes,
          ctx.environmentExtenders
        );
      }, errors_list_1.ERRORS.NETWORK.CONFIG_NOT_FOUND);
    });
    it("Should choose the default network if none is selected", () => {
      const ctx = context_1.HardhatContext.getHardhatContext();
      env = new runtime_environment_1.Environment(
        config,
        Object.assign(Object.assign({}, args), { network: undefined }),
        tasks,
        scopes,
        ctx.environmentExtenders
      );
      chai_1.assert.equal(env.network.name, "default");
      chai_1.assert.equal(env.network.config, config.networks.default);
    });
    it("should override subtask args through parent", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl
          .task("parentTask", "a task that will call another task")
          .setAction((_, hre) =>
            __awaiter(void 0, void 0, void 0, function* () {
              return hre.run("taskWithMultipleTypesParams", {
                optIntParam: 123,
              });
            })
          );
        // default run
        const result1 = yield env.run("parentTask");
        chai_1.assert.equal(result1.optIntParam, 123);
        // subtask args should get overriden
        const result2 = yield env.run("parentTask", undefined, {
          taskWithMultipleTypesParams: {
            optIntParam: 456,
          },
        });
        chai_1.assert.equal(result2.optIntParam, 456);
      }));
    it("should prioritize the first subtask arg", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("a", "a", (_, hre) =>
          __awaiter(void 0, void 0, void 0, function* () {
            const a = yield hre.run("b", undefined, { d: { p: "a" } });
            const b = yield hre.run("b", undefined);
            return [a, b];
          })
        );
        dsl.subtask("b", "b", (_, hre) => {
          return hre.run("c", undefined, { d: { p: "b" } });
        });
        dsl.subtask("c", "c", (_, hre) => {
          return hre.run("d", { p: "c" });
        });
        dsl
          .subtask("d")
          .addParam("p")
          .setAction(({ p }) => {
            return p;
          });
        const resultA = yield env.run("a");
        chai_1.assert.deepEqual(resultA, ["a", "b"]);
      }));
    it("should override subtask args even if one of the calls passes undefined", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("a", "a", (_, hre) =>
          __awaiter(void 0, void 0, void 0, function* () {
            return hre.run("b", undefined, { d: { p: "a" } });
          })
        );
        dsl.subtask("b", "b", (_, hre) => {
          return hre.run("c", undefined, undefined);
        });
        dsl.subtask("c", "c", (_, hre) => {
          return hre.run("d", { p: "c" });
        });
        dsl
          .subtask("d")
          .addParam("p")
          .setAction(({ p }) => {
            return p;
          });
        const resultA = yield env.run("a");
        chai_1.assert.equal(resultA, "a");
      }));
    it("Should resolve default params", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        dsl.task("a", "a", (_, hre) =>
          __awaiter(void 0, void 0, void 0, function* () {
            return hre.run("b", undefined, {});
          })
        );
        dsl
          .subtask("b")
          .addOptionalParam("p", "p", 123, config_1.types.int)
          .setAction(({ p }) =>
            __awaiter(void 0, void 0, void 0, function* () {
              return p;
            })
          );
        const result = yield env.run("a");
        chai_1.assert.equal(result, 123);
      }));
  });
  describe("Plugin system", () => {
    (0, project_1.useFixtureProject)("plugin-project");
    it("environment should contains plugin extensions", () =>
      __awaiter(void 0, void 0, void 0, function* () {
        require(path_1.default.join(process.cwd(), "plugins", "example"));
        const ctx = context_1.HardhatContext.getHardhatContext();
        env = new runtime_environment_1.Environment(
          config,
          args,
          tasks,
          scopes,
          ctx.environmentExtenders
        );
        chai_1.assert.equal(env.__test_key, "a value");
        chai_1.assert.equal(env.__test_bleep(2), 4);
      }));
  });
});
