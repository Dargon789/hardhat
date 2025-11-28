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
exports.FileDeploymentLoader = void 0;
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const file_journal_1 = require("../journal/file-journal");
class FileDeploymentLoader {
    constructor(_deploymentDirPath, _executionEventListener) {
        this._deploymentDirPath = _deploymentDirPath;
        this._executionEventListener = _executionEventListener;
        const artifactsDir = path_1.default.join(this._deploymentDirPath, "artifacts");
        const buildInfoDir = path_1.default.join(this._deploymentDirPath, "build-info");
        const journalPath = path_1.default.join(this._deploymentDirPath, "journal.jsonl");
        const deployedAddressesPath = path_1.default.join(this._deploymentDirPath, "deployed_addresses.json");
        this._journal = new file_journal_1.FileJournal(journalPath, this._executionEventListener);
        this._paths = {
            deploymentDir: this._deploymentDirPath,
            artifactsDir,
            buildInfoDir,
            journalPath,
            deployedAddressesPath,
        };
        this._deploymentDirsEnsured = false;
    }
    recordToJournal(message) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            // NOTE: the journal record is sync, even though this call is async
            this._journal.record(message);
        });
    }
    readFromJournal() {
        return this._journal.read();
    }
    storeNamedArtifact(futureId, _contractName, artifact) {
        // For a file deployment we don't differentiate between
        // named contracts (from HH) and anonymous contracts passed in by the user
        return this.storeUserProvidedArtifact(futureId, artifact);
    }
    storeUserProvidedArtifact(futureId, artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            const artifactFilePath = path_1.default.join(this._paths.artifactsDir, `${futureId}.json`);
            yield (0, fs_extra_1.writeFile)(artifactFilePath, JSON.stringify(artifact, undefined, 2));
        });
    }
    storeBuildInfo(futureId, buildInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            const buildInfoFilePath = path_1.default.join(this._paths.buildInfoDir, `${buildInfo.id}.json`);
            yield (0, fs_extra_1.writeFile)(buildInfoFilePath, JSON.stringify(buildInfo, undefined, 2));
            const debugInfoFilePath = path_1.default.join(this._paths.artifactsDir, `${futureId}.dbg.json`);
            const relativeBuildInfoPath = path_1.default.relative(this._paths.artifactsDir, buildInfoFilePath);
            yield (0, fs_extra_1.writeFile)(debugInfoFilePath, JSON.stringify({
                _format: "hh-sol-dbg-1",
                buildInfo: relativeBuildInfoPath,
            }, undefined, 2));
        });
    }
    readBuildInfo(futureId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            const debugInfoFilePath = path_1.default.join(this._paths.artifactsDir, `${futureId}.dbg.json`);
            const json = JSON.parse((yield (0, fs_extra_1.readFile)(debugInfoFilePath)).toString());
            const buildInfoPath = path_1.default.resolve(this._paths.artifactsDir, json.buildInfo);
            const buildInfo = JSON.parse((yield (0, fs_extra_1.readFile)(buildInfoPath)).toString());
            return buildInfo;
        });
    }
    loadArtifact(futureId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            const artifactFilePath = this._resolveArtifactPathFor(futureId);
            const json = yield (0, fs_extra_1.readFile)(artifactFilePath);
            const artifact = JSON.parse(json.toString());
            return artifact;
        });
    }
    recordDeployedAddress(futureId, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._initialize();
            let deployedAddresses;
            if (yield (0, fs_extra_1.pathExists)(this._paths.deployedAddressesPath)) {
                const json = (yield (0, fs_extra_1.readFile)(this._paths.deployedAddressesPath)).toString();
                deployedAddresses = JSON.parse(json);
            }
            else {
                deployedAddresses = {};
            }
            deployedAddresses[futureId] = contractAddress;
            yield (0, fs_extra_1.writeFile)(this._paths.deployedAddressesPath, `${JSON.stringify(deployedAddresses, undefined, 2)}\n`);
        });
    }
    _initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this._deploymentDirsEnsured) {
                return;
            }
            yield (0, fs_extra_1.ensureDir)(this._paths.deploymentDir);
            yield (0, fs_extra_1.ensureDir)(this._paths.artifactsDir);
            yield (0, fs_extra_1.ensureDir)(this._paths.buildInfoDir);
            this._deploymentDirsEnsured = true;
        });
    }
    _resolveArtifactPathFor(futureId) {
        const artifactFilePath = path_1.default.join(this._paths.artifactsDir, `${futureId}.json`);
        return artifactFilePath;
    }
}
exports.FileDeploymentLoader = FileDeploymentLoader;
