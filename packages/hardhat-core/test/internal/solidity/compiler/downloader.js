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
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const downloader_1 = require("../../../../src/internal/solidity/compiler/downloader");
const errors_1 = require("../../../helpers/errors");
const fs_1 = require("../../../helpers/fs");
const download_1 = require("../../../../src/internal/util/download");
describe("Compiler downloader", function () {
  (0, fs_1.useTmpDir)("compiler-downloader");
  let downloader;
  beforeEach(function () {
    return __awaiter(this, void 0, void 0, function* () {
      const plaftorm = downloader_1.CompilerDownloader.getCompilerPlatform();
      downloader = new downloader_1.CompilerDownloader(plaftorm, this.tmpDir);
      chai_1.assert.isFalse(yield downloader.isCompilerDownloaded("0.4.12123"));
    });
  });
  describe("isCompilerDownloaded (WASM)", function () {
    let wasmDownloader;
    beforeEach(function () {
      wasmDownloader = new downloader_1.CompilerDownloader(
        downloader_1.CompilerPlatform.WASM,
        this.tmpDir
      );
    });
    it("should return false when version is bad", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield wasmDownloader.isCompilerDownloaded("0.4.12123a")
        );
      });
    });
    it("should return false when the compiler isn't downloaded yet", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield wasmDownloader.isCompilerDownloaded("0.4.12")
        );
      });
    });
    it("should return true when the compiler is already downloaded", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield wasmDownloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isTrue(
          yield wasmDownloader.isCompilerDownloaded("0.4.12")
        );
      });
    });
  });
  describe("isCompilerDownloaded (native)", function () {
    it("should return false when version is bad", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(
          yield downloader.isCompilerDownloaded("0.4.12123a")
        );
      });
    });
    it("should return false when the compiler isn't downloaded yet", function () {
      return __awaiter(this, void 0, void 0, function* () {
        chai_1.assert.isFalse(yield downloader.isCompilerDownloaded("0.4.12"));
      });
    });
    it("should return true when the compiler is already downloaded", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield downloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isTrue(yield downloader.isCompilerDownloaded("0.4.12"));
      });
    });
  });
  describe("downloadCompiler", function () {
    it("Should throw if the version is invalid or doesn't exist", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            downloader.downloadCompiler(
              "asd",
              () => __awaiter(this, void 0, void 0, function* () {}),
              () => __awaiter(this, void 0, void 0, function* () {})
            ),
          errors_list_1.ERRORS.SOLC.INVALID_VERSION
        );
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            downloader.downloadCompiler(
              "100.0.0",
              () => __awaiter(this, void 0, void 0, function* () {}),
              () => __awaiter(this, void 0, void 0, function* () {})
            ),
          errors_list_1.ERRORS.SOLC.INVALID_VERSION
        );
      });
    });
    it("Should throw the right error if the list fails to be downloaded", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const mockDownloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerPlatform.WASM,
          this.tmpDir,
          downloader_1.CompilerDownloader.defaultCompilerListCachePeriod,
          (_url, _filePath) => {
            throw new Error("download failed");
          }
        );
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            mockDownloader.downloadCompiler(
              "0.4.12",
              () => __awaiter(this, void 0, void 0, function* () {}),
              () => __awaiter(this, void 0, void 0, function* () {})
            ),
          errors_list_1.ERRORS.SOLC.VERSION_LIST_DOWNLOAD_FAILED
        );
      });
    });
    it("Should throw the right error when the compiler download fails", function () {
      return __awaiter(this, void 0, void 0, function* () {
        let hasDownloadedOnce = false;
        const mockDownloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerPlatform.WASM,
          this.tmpDir,
          downloader_1.CompilerDownloader.defaultCompilerListCachePeriod,
          (url, filePath, timeoutMillis) => {
            if (!hasDownloadedOnce) {
              hasDownloadedOnce = true;
              return (0, download_1.download)(url, filePath, timeoutMillis);
            }
            throw new Error("download failed");
          }
        );
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            mockDownloader.downloadCompiler(
              "0.4.12",
              () => __awaiter(this, void 0, void 0, function* () {}),
              () => __awaiter(this, void 0, void 0, function* () {})
            ),
          errors_list_1.ERRORS.SOLC.DOWNLOAD_FAILED
        );
      });
    });
    it("Shouldn't re-download the list", function () {
      return __awaiter(this, void 0, void 0, function* () {
        let downloads = 0;
        const mockDownloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerPlatform.WASM,
          this.tmpDir,
          downloader_1.CompilerDownloader.defaultCompilerListCachePeriod,
          (url, filePath, timeoutMillis) => {
            downloads++;
            return (0, download_1.download)(url, filePath, timeoutMillis);
          }
        );
        yield mockDownloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        yield mockDownloader.downloadCompiler(
          "0.4.13",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.equal(downloads, 3);
      });
    });
    it("Should throw the right error and delete the compiler if the checksum fails", function () {
      return __awaiter(this, void 0, void 0, function* () {
        let stopMocking = false;
        let hasDownloadedOnce = false;
        let compilerPath;
        const mockDownloader = new downloader_1.CompilerDownloader(
          downloader_1.CompilerPlatform.WASM,
          this.tmpDir,
          downloader_1.CompilerDownloader.defaultCompilerListCachePeriod,
          (url, filePath, timeoutMillis) =>
            __awaiter(this, void 0, void 0, function* () {
              if (stopMocking) {
                return (0, download_1.download)(url, filePath, timeoutMillis);
              }
              if (!hasDownloadedOnce) {
                hasDownloadedOnce = true;
                return (0, download_1.download)(url, filePath, timeoutMillis);
              }
              yield fs_extra_1.default.createFile(filePath);
              compilerPath = filePath;
            })
        );
        yield (0, errors_1.expectHardhatErrorAsync)(
          () =>
            mockDownloader.downloadCompiler(
              "0.4.12",
              () => __awaiter(this, void 0, void 0, function* () {}),
              () => __awaiter(this, void 0, void 0, function* () {})
            ),
          errors_list_1.ERRORS.SOLC.INVALID_DOWNLOAD
        );
        chai_1.assert.isFalse(
          yield fs_extra_1.default.pathExists(compilerPath)
        );
        // it should work with the normal download now
        stopMocking = true;
        yield mockDownloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isTrue(
          yield mockDownloader.isCompilerDownloaded("0.4.12")
        );
      });
    });
    it("should execute both the callback before downloading the compiler and the callback after downloading the compiler", function () {
      return __awaiter(this, void 0, void 0, function* () {
        const VERSION = "0.4.12";
        let value = 0;
        yield downloader.downloadCompiler(
          VERSION,
          // downloadStartedCb
          () =>
            __awaiter(this, void 0, void 0, function* () {
              // Check that the callback is executed before downloading the compiler
              value++;
              chai_1.assert.isFalse(
                yield downloader.isCompilerDownloaded(VERSION)
              );
            }),
          // downloadEndedCb
          () =>
            __awaiter(this, void 0, void 0, function* () {
              // Check that the callback is executed after downloading the compiler
              value++;
              chai_1.assert.isDefined(downloader.getCompiler(VERSION));
            })
        );
        // Check that both callbacks have been called
        (0, chai_1.assert)(value === 2);
      });
    });
    describe("multiple downloads", function () {
      it("should not download multiple times the same compiler", function () {
        return __awaiter(this, void 0, void 0, function* () {
          // The intention is for the value to be 1 if the compiler is downloaded only once.
          // Without a mutex, the value would be 10 because the compiler would be downloaded multiple times.
          // However, the check is implemented to ensure that the value remains 1.
          const VERSION = "0.4.12";
          let value = 0;
          const promises = [];
          for (let i = 0; i < 10; i++) {
            promises.push(
              downloader.downloadCompiler(
                VERSION,
                // callback called before compiler download
                () =>
                  __awaiter(this, void 0, void 0, function* () {
                    value++;
                  }),
                // callback called after compiler download
                () => __awaiter(this, void 0, void 0, function* () {})
              )
            );
          }
          yield Promise.all(promises);
          chai_1.assert.isDefined(downloader.getCompiler(VERSION));
          (0, chai_1.assert)(value === 1);
        });
      });
      it("should download multiple different compilers", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const VERSIONS = ["0.5.1", "0.5.2", "0.5.3", "0.5.4", "0.5.5"];
          let value = 0;
          const promises = [];
          for (const version of VERSIONS) {
            promises.push(
              downloader.downloadCompiler(
                version,
                // callback called before compiler download
                () =>
                  __awaiter(this, void 0, void 0, function* () {
                    value++;
                  }),
                // callback called after compiler download
                () => __awaiter(this, void 0, void 0, function* () {})
              )
            );
          }
          yield Promise.all(promises);
          for (const version of VERSIONS) {
            chai_1.assert.isDefined(downloader.getCompiler(version));
          }
          (0, chai_1.assert)(value === VERSIONS.length);
        });
      });
    });
  });
  describe("getCompiler", function () {
    it("should throw when trying to get a compiler that doesn't exist in the compiler list", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => downloader.getCompiler("0.0.1"), errors_list_1.ERRORS.GENERAL.ASSERTION_ERROR);
      });
    });
    it("should throw when trying to get a compiler that's in the compiler list but hasn't been downloaded yet", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield downloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        yield (0,
        errors_1.expectHardhatErrorAsync)(() => downloader.getCompiler("0.4.13"), errors_list_1.ERRORS.GENERAL.ASSERTION_ERROR);
      });
    });
    it("should return undefined when the native compiler can't be run", function () {
      return __awaiter(this, void 0, void 0, function* () {
        let hasDownloadedOnce = false;
        const platform = downloader_1.CompilerDownloader.getCompilerPlatform();
        const mockDownloader = new downloader_1.CompilerDownloader(
          platform,
          this.tmpDir,
          downloader_1.CompilerDownloader.defaultCompilerListCachePeriod,
          (_url, filePath, _timeoutMillis) =>
            __awaiter(this, void 0, void 0, function* () {
              if (!hasDownloadedOnce) {
                hasDownloadedOnce = true;
                const longVersion = "0.4.12+mock";
                const compilersList = {
                  builds: [
                    {
                      path:
                        platform === downloader_1.CompilerPlatform.WINDOWS
                          ? "solc.exe"
                          : "solc",
                      version: "0.4.12",
                      longVersion,
                      build: "build",
                      keccak256:
                        "0x87c2d362de99f75a4f2755cdaaad2d11bf6cc65dc71356593c445535ff28f43d",
                      urls: [],
                      platform,
                    },
                  ],
                  releases: {
                    "0.4.12": "0.4.12+mock",
                  },
                  latestRelease: "0.4.12",
                };
                yield fs_extra_1.default.ensureDir(
                  path_1.default.dirname(filePath)
                );
                yield fs_extra_1.default.writeJSON(filePath, compilersList);
                return;
              }
              yield fs_extra_1.default.ensureDir(
                path_1.default.dirname(filePath)
              );
              yield fs_extra_1.default.writeFile(filePath, "asd");
            })
        );
        yield mockDownloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isUndefined(yield mockDownloader.getCompiler("0.4.12"));
      });
    });
    it("should work for downloaded compilers", function () {
      return __awaiter(this, void 0, void 0, function* () {
        yield downloader.downloadCompiler(
          "0.4.12",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isDefined(downloader.getCompiler("0.4.12"));
        yield downloader.downloadCompiler(
          "0.4.13",
          () => __awaiter(this, void 0, void 0, function* () {}),
          () => __awaiter(this, void 0, void 0, function* () {})
        );
        chai_1.assert.isDefined(downloader.getCompiler("0.4.13"));
      });
    });
  });
});
