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
const packageInfo_1 = require("../../../src/internal/util/packageInfo");
const fs_utils_1 = require("../../../src/internal/util/fs-utils");
describe("packageInfo", () => {
  it("Should give the right package.json", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const packageJson = yield (0, packageInfo_1.getPackageJson)();
      chai_1.assert.equal(packageJson.name, "hardhat");
      // We don't test the version number because that would be hard to maintain
      chai_1.assert.isString(packageJson.version);
    }));
  it("should give the right package root", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      const root = yield (0, fs_utils_1.getRealPath)(
        path_1.default.join(__dirname, "..", "..", "..")
      );
      chai_1.assert.equal((0, packageInfo_1.getPackageRoot)(), root);
    }));
});
