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
exports.CompilerDownloader = void 0;
const os_1 = __importDefault(require("os"));
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const semver_1 = __importDefault(require("semver"));
const types_1 = require("./types");
const util_1 = require("./util");
const log = (0, util_1.getLogger)("downloader");
const VYPER_RELEASES_MIRROR_URL = "https://vyper-releases-mirror.hardhat.org";
const DOWNLOAD_TIMEOUT_MS = 30000;
function downloadFile(url, destinationFile) {
    return __awaiter(this, void 0, void 0, function* () {
        const { download } = yield Promise.resolve().then(() => __importStar(require("hardhat/internal/util/download")));
        log(`Downloading from ${url} to ${destinationFile}`);
        yield download(url, destinationFile, DOWNLOAD_TIMEOUT_MS);
    });
}
class CompilerDownloader {
    constructor(_compilersDir, options = {}) {
        var _a;
        this._compilersDir = _compilersDir;
        this.compilersList = [];
        this._download = (_a = options.download) !== null && _a !== void 0 ? _a : downloadFile;
        this._platform = this._getCurrentPlatform();
    }
    get compilersListExists() {
        return this._fileExists(this.compilersListPath);
    }
    get downloadsDir() {
        return path_1.default.join(this._compilersDir, "vyper", this._platform);
    }
    get compilersListPath() {
        return path_1.default.join(this.downloadsDir, "list.json");
    }
    isCompilerDownloaded(version) {
        return this._fileExists(this._getDownloadedFilePath(version));
    }
    initCompilersList({ forceDownload } = { forceDownload: false }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (forceDownload || !this.compilersListExists) {
                yield this._downloadCompilersList();
            }
            this.compilersList = this._getCompilersListFromDisk();
        });
    }
    getCompilerAsset(version) {
        return __awaiter(this, void 0, void 0, function* () {
            let versionRelease = this._findVersionRelease(version);
            if (versionRelease === undefined) {
                yield this.initCompilersList({ forceDownload: true });
                versionRelease = this._findVersionRelease(version);
                if (versionRelease === undefined) {
                    throw new util_1.VyperPluginError(`Unsupported vyper version: ${version}`);
                }
            }
            const compilerAsset = versionRelease.assets.find((asset) => asset.name.includes(this._platform));
            if (compilerAsset === undefined) {
                throw new util_1.VyperPluginError(`Vyper version ${version} is not supported on platform ${this._platform}`);
            }
            return compilerAsset;
        });
    }
    getOrDownloadCompiler(version) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const downloadedFilePath = this._getDownloadedFilePath(version);
                if (!this._fileExists(downloadedFilePath)) {
                    const compilerAsset = yield this.getCompilerAsset(version);
                    yield this._downloadCompiler(compilerAsset, downloadedFilePath);
                }
                if (this._isUnix) {
                    fs_extra_1.default.chmodSync(downloadedFilePath, 0o755);
                }
                return downloadedFilePath;
            }
            catch (e) {
                if (util_1.VyperPluginError.isNomicLabsHardhatPluginError(e)) {
                    throw e;
                }
                else {
                    throw new util_1.VyperPluginError("An unexpected error occurred", e, true);
                }
            }
        });
    }
    _findVersionRelease(version) {
        return this.compilersList.find((release) => semver_1.default.valid(release.tag_name) !== null &&
            semver_1.default.eq(release.tag_name, version));
    }
    _downloadCompilersList() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield this._download(`${VYPER_RELEASES_MIRROR_URL}/list.json`, this.compilersListPath);
            }
            catch (e) {
                throw new util_1.VyperPluginError("Failed to download compiler list", e, true);
            }
        });
    }
    _getCompilersListFromDisk() {
        return fs_extra_1.default.readJSONSync(this.compilersListPath);
    }
    get _isUnix() {
        return (this._platform === types_1.CompilerPlatform.MACOS ||
            this._platform === types_1.CompilerPlatform.LINUX);
    }
    _downloadCompiler(compilerAsset, downloadedFilePath) {
        return __awaiter(this, void 0, void 0, function* () {
            const version = compilerAsset.name.split("+")[0].replace("vyper.", "");
            log(`Downloading compiler version ${version} platform ${this._platform}`);
            const urlParts = compilerAsset.browser_download_url.split("/");
            const mirroredUrl = `${VYPER_RELEASES_MIRROR_URL}/${urlParts[urlParts.length - 1]}`;
            try {
                yield this._download(mirroredUrl, downloadedFilePath);
            }
            catch (e) {
                throw new util_1.VyperPluginError("Compiler download failed", e);
            }
        });
    }
    _getDownloadedFilePath(version) {
        return path_1.default.join(this.downloadsDir, version);
    }
    _fileExists(filepath) {
        return fs_extra_1.default.pathExistsSync(filepath);
    }
    _getCurrentPlatform() {
        switch (os_1.default.platform()) {
            case "win32":
                return types_1.CompilerPlatform.WINDOWS;
            case "linux":
                return types_1.CompilerPlatform.LINUX;
            case "darwin":
                return types_1.CompilerPlatform.MACOS;
            default:
                throw new util_1.VyperPluginError(`Vyper not supported on platform ${os_1.default.platform()}`);
        }
    }
}
exports.CompilerDownloader = CompilerDownloader;
