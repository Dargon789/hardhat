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
const environment_1 = require("../helpers/environment");
const project_1 = require("../helpers/project");
describe("console.sol", function () {
  (0, project_1.useFixtureProject)("memory-safe-console");
  (0, environment_1.useEnvironment)();
  it("should be memory safe", function () {
    return __awaiter(this, void 0, void 0, function* () {
      // the memory-safe-console fixture project won't compile
      // if console.sol is not memory-safe
      yield this.env.run("compile");
    });
  });
});
