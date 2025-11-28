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
exports.setupMockDeploymentLoader = exports.setupMockArtifactResolver = exports.fakeArtifact = exports.assertInstanceOf = exports.assertValidationError = exports.exampleAccounts = void 0;
const chai_1 = require("chai");
exports.exampleAccounts = [
    "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
    "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC",
    "0x90F79bf6EB2c4f870365E785982E1f101E93b906",
    "0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65",
    "0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc",
];
function assertValidationError(errors, expectedError) {
    chai_1.assert.includeMembers(errors.map((e) => e.split(/IGN\d+: /)[1]), [expectedError]);
}
exports.assertValidationError = assertValidationError;
function assertInstanceOf(obj, klass) {
    chai_1.assert.instanceOf(obj, klass, `Not a valid instace of ${klass.name}`);
}
exports.assertInstanceOf = assertInstanceOf;
exports.fakeArtifact = {
    abi: [],
    contractName: "",
    sourceName: "",
    bytecode: "",
    linkReferences: {},
};
function setupMockArtifactResolver(artifacts) {
    return {
        loadArtifact: (contractName) => __awaiter(this, void 0, void 0, function* () {
            if ((artifacts === null || artifacts === void 0 ? void 0 : artifacts[contractName]) === undefined) {
                return Object.assign(Object.assign({}, exports.fakeArtifact), { contractName });
            }
            const artifact = artifacts[contractName];
            if (artifact === undefined) {
                throw new Error(`No artifact set in test for that contractName ${contractName}`);
            }
            return artifacts[contractName];
        }),
        getBuildInfo: (_contractName) => __awaiter(this, void 0, void 0, function* () {
            return { id: 12345 };
        }),
    };
}
exports.setupMockArtifactResolver = setupMockArtifactResolver;
function setupMockDeploymentLoader(journal, deployedAddresses) {
    const storedArtifacts = {};
    const storedDeployedAddresses = deployedAddresses !== null && deployedAddresses !== void 0 ? deployedAddresses : {};
    return {
        recordToJournal: (message) => __awaiter(this, void 0, void 0, function* () {
            journal.record(message);
        }),
        readFromJournal: () => {
            return journal.read();
        },
        recordDeployedAddress: (futureId, contractAddress) => __awaiter(this, void 0, void 0, function* () {
            storedDeployedAddresses[futureId] = contractAddress;
        }),
        storeUserProvidedArtifact: (artifactId, artifact) => __awaiter(this, void 0, void 0, function* () {
            storedArtifacts[artifactId] = artifact;
        }),
        storeNamedArtifact: (artifactId, _contractName, artifact) => __awaiter(this, void 0, void 0, function* () {
            storedArtifacts[artifactId] = artifact;
        }),
        storeBuildInfo: () => __awaiter(this, void 0, void 0, function* () { }),
        loadArtifact: (artifactId) => __awaiter(this, void 0, void 0, function* () {
            const artifact = storedArtifacts[artifactId];
            if (artifact === undefined) {
                throw new Error(`Artifact not stored for ${artifactId}`);
            }
            return artifact;
        }),
    };
}
exports.setupMockDeploymentLoader = setupMockDeploymentLoader;
