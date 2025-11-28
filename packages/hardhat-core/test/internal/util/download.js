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
const download_1 = require("../../../src/internal/util/download");
const fs_1 = require("../../helpers/fs");
describe("Compiler List download", function () {
  (0, fs_1.useTmpDir)("compiler-downloader");
  describe("Compilers list download", function () {
    it("Should call download with the right params", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const compilersDir = this.tmpDir;
        const downloadPath = path_1.default.join(
          compilersDir,
          "downloadedCompiler"
        );
        const expectedUrl = `https://solc-bin.ethereum.org/wasm/list.json`;
        // download the file
        yield (0, download_1.download)(expectedUrl, downloadPath);
        // Assert that the file exists
        chai_1.assert.isTrue(yield fs_extra_1.default.pathExists(downloadPath));
      });
    });
  });
});
