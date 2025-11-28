"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
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
exports.getSolidityFilesCachePath = exports.SolidityFilesCache = void 0;
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const t = __importStar(require("io-ts"));
const path = __importStar(require("path"));
const constants_1 = require("../../internal/constants");
const log = (0, debug_1.default)("hardhat:core:tasks:compile:cache");
const FORMAT_VERSION = "hh-sol-cache-2";
const CacheEntryCodec = t.type({
  lastModificationDate: t.number,
  contentHash: t.string,
  sourceName: t.string,
  solcConfig: t.any,
  imports: t.array(t.string),
  versionPragmas: t.array(t.string),
  artifacts: t.array(t.string),
});
const CacheCodec = t.type({
  _format: t.string,
  files: t.record(t.string, CacheEntryCodec),
});
class SolidityFilesCache {
  static createEmpty() {
    return new SolidityFilesCache({
      _format: FORMAT_VERSION,
      files: {},
    });
  }
  static readFromFile(solidityFilesCachePath) {
    return __awaiter(this, void 0, void 0, function* () {
      let cacheRaw = {
        _format: FORMAT_VERSION,
        files: {},
      };
      if (yield fs_extra_1.default.pathExists(solidityFilesCachePath)) {
        cacheRaw = yield fs_extra_1.default.readJson(solidityFilesCachePath);
      }
      const result = CacheCodec.decode(cacheRaw);
      if (result.isRight()) {
        const solidityFilesCache = new SolidityFilesCache(result.value);
        yield solidityFilesCache.removeNonExistingFiles();
        return solidityFilesCache;
      }
      log("There was a problem reading the cache");
      return new SolidityFilesCache({
        _format: FORMAT_VERSION,
        files: {},
      });
    });
  }
  constructor(_cache) {
    this._cache = _cache;
  }
  removeNonExistingFiles() {
    return __awaiter(this, void 0, void 0, function* () {
      yield Promise.all(
        Object.keys(this._cache.files).map((absolutePath) =>
          __awaiter(this, void 0, void 0, function* () {
            if (!(yield fs_extra_1.default.pathExists(absolutePath))) {
              this.removeEntry(absolutePath);
            }
          })
        )
      );
    });
  }
  writeToFile(solidityFilesCachePath) {
    return __awaiter(this, void 0, void 0, function* () {
      yield fs_extra_1.default.outputJson(solidityFilesCachePath, this._cache, {
        spaces: 2,
      });
    });
  }
  addFile(absolutePath, entry) {
    this._cache.files[absolutePath] = entry;
  }
  getEntries() {
    return Object.values(this._cache.files);
  }
  getEntry(file) {
    return this._cache.files[file];
  }
  removeEntry(file) {
    delete this._cache.files[file];
  }
  hasFileChanged(absolutePath, contentHash, solcConfig) {
    const isEqual = require("lodash/isEqual");
    const cacheEntry = this.getEntry(absolutePath);
    if (cacheEntry === undefined) {
      // new file or no cache available, assume it's new
      return true;
    }
    if (cacheEntry.contentHash !== contentHash) {
      return true;
    }
    if (
      solcConfig !== undefined &&
      !isEqual(solcConfig, cacheEntry.solcConfig)
    ) {
      return true;
    }
    return false;
  }
}
exports.SolidityFilesCache = SolidityFilesCache;
function getSolidityFilesCachePath(paths) {
  return path.join(paths.cache, constants_1.SOLIDITY_FILES_CACHE_FILENAME);
}
exports.getSolidityFilesCachePath = getSolidityFilesCachePath;
