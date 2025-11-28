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
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertSuccessReconciliation = exports.assertNoWarningsOrErrors = exports.reconcile = exports.createDeploymentState = exports.ArtifactMapDeploymentLoader = exports.ArtifactMapResolver = exports.mockArtifact = exports.twoAddress = exports.oneAddress = void 0;
const chai_1 = require("chai");
const get_default_sender_1 = require("../../src/internal/execution/utils/get-default-sender");
const reconciler_1 = require("../../src/internal/reconciliation/reconciler");
const helpers_1 = require("../helpers");
exports.oneAddress = "0x1111111111111111111111111111111111111111";
exports.twoAddress = "0x2222222222222222222222222222222222222222";
exports.mockArtifact = {
    contractName: "Contract1",
    sourceName: "",
    bytecode: "0x",
    linkReferences: {},
    abi: [],
};
class MockDeploymentLoader {
    recordToJournal(_) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    readFromJournal() { return __asyncGenerator(this, arguments, function* readFromJournal_1() { }); }
    loadArtifact(_artifactId) {
        return __awaiter(this, void 0, void 0, function* () {
            return exports.mockArtifact;
        });
    }
    storeUserProvidedArtifact(_futureId, _artifact) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
    storeNamedArtifact(_futureId, _contractName, _artifact) {
        throw new Error("Method not implemented.");
    }
    storeBuildInfo(_futureId, _buildInfo) {
        throw new Error("Method not implemented.");
    }
    recordDeployedAddress(_futureId, _contractAddress) {
        throw new Error("Method not implemented.");
    }
    emitDeploymentBatchEvent(_batches) {
        throw new Error("Method not implemented.");
    }
}
class MockArtifactResolver {
    loadArtifact(_contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            return exports.mockArtifact;
        });
    }
    getBuildInfo(_contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            throw new Error("Method not implemented.");
        });
    }
}
class ArtifactMapResolver extends MockArtifactResolver {
    constructor(_artifactMap = {}) {
        super();
        this._artifactMap = _artifactMap;
    }
    loadArtifact(contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._artifactMap[contractName];
        });
    }
}
exports.ArtifactMapResolver = ArtifactMapResolver;
class ArtifactMapDeploymentLoader extends MockDeploymentLoader {
    constructor(_artifactMap = {}) {
        super();
        this._artifactMap = _artifactMap;
    }
    loadArtifact(contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._artifactMap[contractName];
        });
    }
}
exports.ArtifactMapDeploymentLoader = ArtifactMapDeploymentLoader;
function createDeploymentState(...exStates) {
    return {
        chainId: 123,
        executionStates: Object.fromEntries(exStates.map((s) => [s.id, s])),
    };
}
exports.createDeploymentState = createDeploymentState;
function reconcile(ignitionModule, deploymentState, deploymentLoader = new MockDeploymentLoader(), artifactLoader = new MockArtifactResolver(), deploymentParameters = {}, strategy = "basic", strategyConfig = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const reconiliationResult = reconciler_1.Reconciler.reconcile(ignitionModule, deploymentState, deploymentParameters, helpers_1.exampleAccounts, deploymentLoader, artifactLoader, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts), strategy, strategyConfig);
        return reconiliationResult;
    });
}
exports.reconcile = reconcile;
function assertNoWarningsOrErrors(reconciliationResult) {
    chai_1.assert.equal(reconciliationResult.reconciliationFailures.length, 0, `Unreconcilied futures found: \n${JSON.stringify(reconciliationResult.reconciliationFailures, undefined, 2)}`);
    chai_1.assert.equal(reconciliationResult.missingExecutedFutures.length, 0, `Missing futures found: \n${JSON.stringify(reconciliationResult.missingExecutedFutures, undefined, 2)}`);
}
exports.assertNoWarningsOrErrors = assertNoWarningsOrErrors;
function assertSuccessReconciliation(ignitionModule, deploymentState) {
    return __awaiter(this, void 0, void 0, function* () {
        const reconciliationResult = yield reconcile(ignitionModule, deploymentState);
        assertNoWarningsOrErrors(reconciliationResult);
    });
}
exports.assertSuccessReconciliation = assertSuccessReconciliation;
