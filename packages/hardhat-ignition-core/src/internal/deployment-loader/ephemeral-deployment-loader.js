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
Object.defineProperty(exports, "__esModule", { value: true });
exports.EphemeralDeploymentLoader = void 0;
const memory_journal_1 = require("../journal/memory-journal");
const assertions_1 = require("../utils/assertions");
/**
 * Stores and loads deployment related information without making changes
 * on disk, by either storing in memory or loading already existing files.
 * Used when running in environments like Hardhat tests.
 */
class EphemeralDeploymentLoader {
    constructor(_artifactResolver, _executionEventListener) {
        this._artifactResolver = _artifactResolver;
        this._executionEventListener = _executionEventListener;
        this._journal = new memory_journal_1.MemoryJournal(this._executionEventListener);
        this._deployedAddresses = {};
        this._savedArtifacts = {};
    }
    recordToJournal(message) {
        return __awaiter(this, void 0, void 0, function* () {
            this._journal.record(message);
        });
    }
    readFromJournal() {
        return this._journal.read();
    }
    recordDeployedAddress(futureId, contractAddress) {
        return __awaiter(this, void 0, void 0, function* () {
            this._deployedAddresses[futureId] = contractAddress;
        });
    }
    storeBuildInfo(_futureId, _buildInfo) {
        return __awaiter(this, void 0, void 0, function* () {
            // For ephemeral we are ignoring build info
        });
    }
    storeNamedArtifact(futureId, contractName, _artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            this._savedArtifacts[futureId] = { _kind: "contractName", contractName };
        });
    }
    storeUserProvidedArtifact(futureId, artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            this._savedArtifacts[futureId] = { _kind: "artifact", artifact };
        });
    }
    loadArtifact(artifactId) {
        return __awaiter(this, void 0, void 0, function* () {
            const futureId = artifactId;
            const saved = this._savedArtifacts[futureId];
            (0, assertions_1.assertIgnitionInvariant)(saved !== undefined, `No stored artifact for ${futureId}`);
            switch (saved._kind) {
                case "artifact": {
                    return saved.artifact;
                }
                case "contractName": {
                    const fileArtifact = this._artifactResolver.loadArtifact(saved.contractName);
                    (0, assertions_1.assertIgnitionInvariant)(fileArtifact !== undefined, `Unable to load artifact, underlying resolver returned undefined for ${saved.contractName}`);
                    return fileArtifact;
                }
            }
        });
    }
}
exports.EphemeralDeploymentLoader = EphemeralDeploymentLoader;
