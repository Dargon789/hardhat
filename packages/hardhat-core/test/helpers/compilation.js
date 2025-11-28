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
exports.getNextNextUnsupportedVersion =
  exports.getNextUnsupportedVersion =
  exports.compileLiteral =
    void 0;
const edr_1 = require("@nomicfoundation/edr");
const semver_1 = __importDefault(require("semver"));
const compiler_1 = require("../../src/internal/solidity/compiler");
const downloader_1 = require("../../src/internal/solidity/compiler/downloader");
const global_dir_1 = require("../../src/internal/util/global-dir");
function compileLiteral(
  source,
  solcVersion = "0.8.0",
  filename = "literal.sol"
) {
  return __awaiter(this, void 0, void 0, function* () {
    yield downloadCompiler(solcVersion);
    const compiler = yield getCompilerForVersion(solcVersion);
    return compile(getSolcInputForLiteral(source, filename), compiler);
  });
}
exports.compileLiteral = compileLiteral;
function getSolcInput(sources) {
  const optimizer = {
    enabled: false,
  };
  const settings = {
    optimizer,
    outputSelection: {
      "*": {
        "*": [
          "abi",
          "evm.bytecode",
          "evm.deployedBytecode",
          "evm.methodIdentifiers",
        ],
        "": ["id", "ast"],
      },
    },
  };
  return {
    language: "Solidity",
    sources,
    settings,
  };
}
function getSolcInputForLiteral(source, filename = "literal.sol") {
  return getSolcInput({ [filename]: { content: source } });
}
function compile(input, compiler) {
  return __awaiter(this, void 0, void 0, function* () {
    let runnableCompiler;
    if (compiler.isSolcJs) {
      runnableCompiler = new compiler_1.Compiler(compiler.compilerPath);
    } else {
      runnableCompiler = new compiler_1.NativeCompiler(compiler.compilerPath);
    }
    const output = yield runnableCompiler.compile(input);
    if (output.errors !== undefined) {
      for (const error of output.errors) {
        if (error.severity === "error") {
          throw new Error(`Failed to compile: ${error.message}`);
        }
      }
    }
    return [input, output];
  });
}
function getCompilerForVersion(solidityVersion) {
  return __awaiter(this, void 0, void 0, function* () {
    const compilersCache = yield (0, global_dir_1.getCompilersDir)();
    const downloader =
      downloader_1.CompilerDownloader.getConcurrencySafeDownloader(
        downloader_1.CompilerDownloader.getCompilerPlatform(),
        compilersCache
      );
    const compiler = yield downloader.getCompiler(solidityVersion);
    if (compiler !== undefined) {
      return compiler;
    }
    const wasmDownloader =
      downloader_1.CompilerDownloader.getConcurrencySafeDownloader(
        downloader_1.CompilerPlatform.WASM,
        compilersCache
      );
    const wasmCompiler = yield wasmDownloader.getCompiler(solidityVersion);
    if (wasmCompiler === undefined) {
      throw new Error("Expected compiler to be downloaded");
    }
    return wasmCompiler;
  });
}
function downloadCompiler(solidityVersion) {
  return __awaiter(this, void 0, void 0, function* () {
    const compilersCache = yield (0, global_dir_1.getCompilersDir)();
    const downloader =
      downloader_1.CompilerDownloader.getConcurrencySafeDownloader(
        downloader_1.CompilerDownloader.getCompilerPlatform(),
        compilersCache
      );
    const isCompilerDownloaded = yield downloader.isCompilerDownloaded(
      solidityVersion
    );
    if (!isCompilerDownloaded) {
      console.log("Downloading solc", solidityVersion);
      yield downloader.downloadCompiler(
        solidityVersion,
        () => __awaiter(this, void 0, void 0, function* () {}),
        () => __awaiter(this, void 0, void 0, function* () {})
      );
    }
    const compiler = yield downloader.getCompiler(solidityVersion);
    if (compiler !== undefined) {
      return;
    }
    const wasmDownloader =
      downloader_1.CompilerDownloader.getConcurrencySafeDownloader(
        downloader_1.CompilerPlatform.WASM,
        compilersCache
      );
    const isWasmCompilerDownloaded = yield downloader.isCompilerDownloaded(
      solidityVersion
    );
    if (!isWasmCompilerDownloaded) {
      console.log("Downloading solcjs", solidityVersion);
      yield wasmDownloader.downloadCompiler(
        solidityVersion,
        () => __awaiter(this, void 0, void 0, function* () {}),
        () => __awaiter(this, void 0, void 0, function* () {})
      );
    }
  });
}
const getNextUnsupportedVersion = () =>
  semver_1.default.inc((0, edr_1.getLatestSupportedSolcVersion)(), "patch");
exports.getNextUnsupportedVersion = getNextUnsupportedVersion;
const getNextNextUnsupportedVersion = () =>
  semver_1.default.inc((0, exports.getNextUnsupportedVersion)(), "patch");
exports.getNextNextUnsupportedVersion = getNextNextUnsupportedVersion;
