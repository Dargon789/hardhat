"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getVyperFilesCachePath = exports.VyperFilesCache = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const t = __importStar(require("io-ts"));
const constants_1 = require("./constants");
const util_1 = require("./util");
const log = (0, util_1.getLogger)("cache");
const CacheEntryCodec = t.type({
    lastModificationDate: t.number,
    contentHash: t.string,
    sourceName: t.string,
    vyperConfig: t.any,
    versionPragma: t.string,
    artifacts: t.array(t.string),
});
const CacheCodec = t.type({
    _format: t.string,
    files: t.record(t.string, CacheEntryCodec),
});
class VyperFilesCache {
    constructor(_cache) {
        this._cache = _cache;
    }
    static createEmpty() {
        return new VyperFilesCache({ _format: constants_1.CACHE_FORMAT_VERSION, files: {} });
    }
    static readFromFile(vyperFilesCachePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const cacheRaw = fs_extra_1.default.existsSync(vyperFilesCachePath)
                ? fs_extra_1.default.readJSONSync(vyperFilesCachePath)
                : {
                    _format: constants_1.CACHE_FORMAT_VERSION,
                    files: {},
                };
            const result = CacheCodec.decode(cacheRaw);
            if (result.isRight()) {
                const vyperFilesCache = new VyperFilesCache(result.value);
                yield vyperFilesCache.removeNonExistingFiles();
                return vyperFilesCache;
            }
            log("There was a problem reading the cache");
            return VyperFilesCache.createEmpty();
        });
    }
    removeNonExistingFiles() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const absolutePath of Object.keys(this._cache.files)) {
                if (!fs_extra_1.default.existsSync(absolutePath)) {
                    this.removeEntry(absolutePath);
                }
            }
        });
    }
    writeToFile(vyperFilesCachePath) {
        return __awaiter(this, void 0, void 0, function* () {
            yield fs_extra_1.default.outputJson(vyperFilesCachePath, this._cache, { spaces: 2 });
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
    hasFileChanged(absolutePath, contentHash, vyperConfig) {
        const { isEqual } = require("lodash");
        const cacheEntry = this.getEntry(absolutePath);
        if (cacheEntry === undefined) {
            // new file or no cache available, assume it's new
            return true;
        }
        if (cacheEntry.contentHash !== contentHash) {
            return true;
        }
        if (vyperConfig !== undefined &&
            !isEqual(vyperConfig, cacheEntry.vyperConfig)) {
            return true;
        }
        return false;
    }
}
exports.VyperFilesCache = VyperFilesCache;
function getVyperFilesCachePath(paths) {
    return path_1.default.join(paths.cache, constants_1.VYPER_FILES_CACHE_FILENAME);
}
exports.getVyperFilesCachePath = getVyperFilesCachePath;
