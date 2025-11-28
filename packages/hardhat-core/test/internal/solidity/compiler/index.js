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
const compiler_1 = require("../../../../src/internal/solidity/compiler");
const downloader_1 = require("../../../../src/internal/solidity/compiler/downloader");
const fs_1 = require("../../../helpers/fs");
const solcVersion = "0.6.6";
describe("Compiler", () => {
  describe("native", function () {
    (0, fs_1.useTmpDir)("native-compiler-execution");
    let downloader;
    let optimizerConfig;
    let solcPath;
    before(function () {
      optimizerConfig = {
        runs: 200,
        enabled: false,
      };
    });
    beforeEach(function () {
      return __awaiter(this, void 0, void 0, function* () {
        downloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerDownloader.getCompilerPlatform(),
          this.tmpDir
        );
        yield downloader.downloadCompiler(
          solcVersion,
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        const compilerPathResult = yield downloader.getCompiler(solcVersion);
        solcPath = compilerPathResult.compilerPath;
      });
    });
    it("Should compile contracts correctly", () =>
      __awaiter(this, void 0, void 0, function* () {
        const input = {
          language: "Solidity",
          sources: {
            "A.sol": {
              content: `
pragma solidity ^${solcVersion};
contract A {}
`,
            },
          },
          settings: {
            evmVersion: "byzantium",
            metadata: {
              useLiteralContent: true,
            },
            optimizer: optimizerConfig,
            outputSelection: {
              "*": {
                "*": ["evm.bytecode.object", "abi"],
                "": ["ast"],
              },
            },
          },
        };
        const compiler = new compiler_1.NativeCompiler(solcPath);
        const output = yield compiler.compile(input);
        // We just check some properties
        chai_1.assert.isDefined(output.contracts);
        chai_1.assert.isDefined(output.contracts["A.sol"]);
        chai_1.assert.isDefined(output.contracts["A.sol"].A);
        chai_1.assert.isDefined(output.sources);
        chai_1.assert.isDefined(output.sources["A.sol"]);
        chai_1.assert.isDefined(output.sources["A.sol"].ast);
        chai_1.assert.equal(output.sources["A.sol"].id, 0);
      }));
    it("Shouldn't throw if there's a syntax error", () =>
      __awaiter(this, void 0, void 0, function* () {
        const input = {
          language: "Solidity",
          sources: {
            "A.sol": {
              content: `pragma sol`,
            },
          },
          settings: {
            evmVersion: "byzantium",
            metadata: {
              useLiteralContent: true,
            },
            optimizer: optimizerConfig,
            outputSelection: {
              "*": {
                "*": ["evm.bytecode.object", "abi"],
                "": ["ast"],
              },
            },
          },
        };
        const compiler = new compiler_1.NativeCompiler(solcPath);
        const output = yield compiler.compile(input);
        chai_1.assert.isDefined(output.errors);
        chai_1.assert.isNotEmpty(output.errors);
      }));
  });
  describe("solcjs", function () {
    (0, fs_1.useTmpDir)("solcjs-compiler-execution");
    let downloader;
    let optimizerConfig;
    let solcPath;
    before(function () {
      optimizerConfig = {
        runs: 200,
        enabled: false,
      };
    });
    beforeEach(function () {
      return __awaiter(this, void 0, void 0, function* () {
        downloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerPlatform.WASM,
          this.tmpDir
        );
        yield downloader.downloadCompiler(
          solcVersion,
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        const compilerPathResult = yield downloader.getCompiler(solcVersion);
        solcPath = compilerPathResult.compilerPath;
      });
    });
    it("Should compile contracts correctly", () =>
      __awaiter(this, void 0, void 0, function* () {
        const input = {
          language: "Solidity",
          sources: {
            "A.sol": {
              content: `
pragma solidity ^${solcVersion};
contract A {}
`,
            },
          },
          settings: {
            evmVersion: "byzantium",
            metadata: {
              useLiteralContent: true,
            },
            optimizer: optimizerConfig,
            outputSelection: {
              "*": {
                "*": ["evm.bytecode.object", "abi"],
                "": ["ast"],
              },
            },
          },
        };
        const compiler = new compiler_1.Compiler(solcPath);
        const output = yield compiler.compile(input);
        // We just check some properties
        chai_1.assert.isDefined(output.contracts);
        chai_1.assert.isDefined(output.contracts["A.sol"]);
        chai_1.assert.isDefined(output.contracts["A.sol"].A);
        chai_1.assert.isDefined(output.sources);
        chai_1.assert.isDefined(output.sources["A.sol"]);
        chai_1.assert.isDefined(output.sources["A.sol"].ast);
        chai_1.assert.equal(output.sources["A.sol"].id, 0);
      }));
    it("Shouldn't throw if there's a syntax error", () =>
      __awaiter(this, void 0, void 0, function* () {
        const input = {
          language: "Solidity",
          sources: {
            "A.sol": {
              content: `pragma sol`,
            },
          },
          settings: {
            evmVersion: "byzantium",
            metadata: {
              useLiteralContent: true,
            },
            optimizer: optimizerConfig,
            outputSelection: {
              "*": {
                "*": ["evm.bytecode.object", "abi"],
                "": ["ast"],
              },
            },
          },
        };
        const compiler = new compiler_1.Compiler(solcPath);
        const output = yield compiler.compile(input);
        chai_1.assert.isDefined(output.errors);
        chai_1.assert.isNotEmpty(output.errors);
      }));
  });
});
