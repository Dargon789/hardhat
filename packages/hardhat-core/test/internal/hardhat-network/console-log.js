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
const environment_1 = require("../../helpers/environment");
const project_1 = require("../../helpers/project");
const task_names_1 = require("../../../src/builtin-tasks/task-names");
describe("Solidity console.log should print numbers without losing precision, occurrences of %d and %i should be correctly replaced with %s", function () {
  const n1 = "11111111111111111111111111111111";
  const n2 = "22222222222222222222222222222222";
  const n3 = "33333333333333333333333333333333";
  // Set up the test environment
  (0, project_1.useFixtureProject)("console-log");
  (0, environment_1.useEnvironment)();
  it("should print all the numbers without losing precision", function () {
    return __awaiter(this, void 0, void 0, function* () {
      yield this.env.run(task_names_1.TASK_COMPILE, { quiet: true });
      // Retrieve the artifact of the solidity file compiled in the previous command
      const artifact = this.env.artifacts.readArtifactSync("Test");
      // Deploy contract and get receipt
      const [deployer] = yield this.env.network.provider.send("eth_accounts");
      const tx = yield this.env.network.provider.send("eth_sendTransaction", [
        {
          from: deployer,
          data: artifact.bytecode,
        },
      ]);
      const receipt = yield this.env.network.provider.send(
        "eth_getTransactionReceipt",
        [tx]
      );
      // Modify console.log to store the messages that are gonna be printed when executing the smart contract function
      const originalConsoleLog = console.log;
      const capturedLogs = [];
      console.log = (v) => {
        capturedLogs.push(v);
      };
      // Call the contract function
      yield this.env.network.provider.send("eth_sendTransaction", [
        {
          from: deployer,
          to: receipt.contractAddress,
          data: "0xf8a8fd6d", // selector of 'test()'
        },
      ]);
      // Restore the original console.log
      console.log = originalConsoleLog;
      // Process the captured logs as needed
      chai_1.assert.strictEqual("123456789123456789123456789", capturedLogs[0]);
      chai_1.assert.strictEqual("123456789123456789123456789", capturedLogs[1]);
      chai_1.assert.strictEqual(`${n1}${n2}${n3}`, capturedLogs[2]);
      chai_1.assert.strictEqual(`${n1} %i ${n1}`, capturedLogs[3]);
      // When % are in even number it means that they are escaped so %d and %i are not transformed into %s.
      // See util.format docs for more info.
      chai_1.assert.strictEqual(
        `${n1} %d %2 %%d %%${n3} %%%d`,
        capturedLogs[4]
      );
      chai_1.assert.strictEqual(
        `${n1} %i %2 %%i %%${n3} %%%i`,
        capturedLogs[5]
      );
      chai_1.assert.strictEqual(
        `${n1} %s %2 %%s %%${n3} %%%s`,
        capturedLogs[6]
      );
      chai_1.assert.strictEqual("%s", capturedLogs[7]);
      chai_1.assert.strictEqual("%%d", capturedLogs[8]);
      chai_1.assert.strictEqual("%s", capturedLogs[9]);
      chai_1.assert.strictEqual("%s %s %s %%d", capturedLogs[10]);
      chai_1.assert.strictEqual(
        "1111111111111111114444444444444444444455555555555555555555",
        capturedLogs[11]
      );
      chai_1.assert.strictEqual("1", capturedLogs[12]);
      chai_1.assert.strictEqual("12", capturedLogs[13]);
      chai_1.assert.strictEqual("13", capturedLogs[14]);
      chai_1.assert.strictEqual(capturedLogs.length, 15);
    });
  });
});
