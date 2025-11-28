"use strict";
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
exports.Resolver = exports.ResolvedFile = void 0;
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const source_names_1 = require("hardhat/utils/source-names");
const hash_1 = require("hardhat/internal/util/hash");
const errors_1 = require("hardhat/internal/core/errors");
const errors_list_1 = require("hardhat/internal/core/errors-list");
const util_1 = require("./util");
class ResolvedFile {
    constructor(sourceName, absolutePath, content, contentHash, lastModificationDate) {
        this.sourceName = sourceName;
        this.absolutePath = absolutePath;
        this.content = content;
        this.contentHash = contentHash;
        this.lastModificationDate = lastModificationDate;
    }
}
exports.ResolvedFile = ResolvedFile;
class Resolver {
    constructor(_projectRoot, _parser, _readFile) {
        this._projectRoot = _projectRoot;
        this._parser = _parser;
        this._readFile = _readFile;
        this.resolveSourceName = (sourceName) => __awaiter(this, void 0, void 0, function* () {
            (0, source_names_1.validateSourceNameFormat)(sourceName);
            if (yield (0, source_names_1.isLocalSourceName)(this._projectRoot, sourceName)) {
                return this._resolveLocalSourceName(sourceName);
            }
            throw new util_1.VyperPluginError(`This plugin does not currently support importing interfaces from a library or package.

Please open an issue on our github if you'd like to see this feature implemented:
https://github.com/nomiclabs/hardhat/issues/new
`);
        });
    }
    _resolveLocalSourceName(sourceName) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._validateSourceNameExistenceAndCasing(this._projectRoot, sourceName);
            const absolutePath = path_1.default.join(this._projectRoot, sourceName);
            return this._resolveFile(sourceName, absolutePath);
        });
    }
    _resolveFile(sourceName, absolutePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const rawContent = yield this._readFile(absolutePath);
            const stats = yield fs_extra_1.default.stat(absolutePath);
            const lastModificationDate = new Date(stats.ctime);
            const contentHash = (0, hash_1.createNonCryptographicHashBasedIdentifier)(Buffer.from(rawContent)).toString("hex");
            const parsedContent = this._parser.parse(rawContent, absolutePath, contentHash);
            const content = Object.assign({ rawContent }, parsedContent);
            return new ResolvedFile(sourceName, absolutePath, content, contentHash, lastModificationDate);
        });
    }
    _validateSourceNameExistenceAndCasing(fromDir, sourceName) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield (0, source_names_1.validateSourceNameExistenceAndCasing)(fromDir, sourceName);
            }
            catch (error) {
                if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.SOURCE_NAMES.FILE_NOT_FOUND)) {
                    throw new util_1.VyperPluginError(`File ${sourceName} doesn't exist.`);
                }
                if (errors_1.HardhatError.isHardhatErrorType(error, errors_list_1.ERRORS.SOURCE_NAMES.WRONG_CASING)) {
                    throw new util_1.VyperPluginError(`Trying to resolve the file ${sourceName} but its correct case-sensitive name is ${error.messageArguments.correct}`);
                }
                if (error instanceof Error) {
                    throw new util_1.VyperPluginError(`An unknown error has occurred when attempting to resolve vyper file ${sourceName}`, error);
                }
            }
        });
    }
}
exports.Resolver = Resolver;
