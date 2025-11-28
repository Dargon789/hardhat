"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Parser = void 0;
const cache_1 = require("./cache");
const util_1 = require("./util");
class Parser {
    constructor(_vyperFilesCache = cache_1.VyperFilesCache.createEmpty()) {
        this._vyperFilesCache = _vyperFilesCache;
        this._cache = new Map();
    }
    parse(fileContent, absolutePath, contentHash) {
        this._validateTestModeNotUsed(fileContent, absolutePath);
        const cacheResult = this._getFromCache(absolutePath, contentHash);
        if (cacheResult !== null) {
            return cacheResult;
        }
        const result = {
            versionPragma: parseVersionPragma(fileContent),
        };
        this._cache.set(contentHash, result);
        return result;
    }
    _validateTestModeNotUsed(fileContent, absolutePath) {
        if (fileContent.includes('#@ if mode == "test":')) {
            throw new util_1.VyperPluginError(`We found a test directive in the file at path ${absolutePath}.` +
                ` Test directives are a Brownie feature not supported by Hardhat.` +
                ` Learn more at https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-vyper#test-directives`);
        }
    }
    _getFromCache(absolutePath, contentHash) {
        const internalCacheEntry = this._cache.get(contentHash);
        if (internalCacheEntry !== undefined) {
            return internalCacheEntry;
        }
        const vyperFilesCacheEntry = this._vyperFilesCache.getEntry(absolutePath);
        if (vyperFilesCacheEntry === undefined) {
            return null;
        }
        if (vyperFilesCacheEntry.contentHash !== contentHash) {
            return null;
        }
        const { versionPragma } = vyperFilesCacheEntry;
        return { versionPragma };
    }
}
exports.Parser = Parser;
function parseVersionPragma(fileContent) {
    var _a;
    const versionPragmasRegex = /#\s+@version\s+(.+)/g;
    const result = versionPragmasRegex.exec(fileContent);
    return (_a = result === null || result === void 0 ? void 0 : result[1]) !== null && _a !== void 0 ? _a : "*";
}
