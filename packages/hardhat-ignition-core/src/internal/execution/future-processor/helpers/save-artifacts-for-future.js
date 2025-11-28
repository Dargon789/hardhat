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
exports.saveArtifactsForFuture = void 0;
const module_1 = require("../../../../types/module");
function saveArtifactsForFuture(future, artifactResolver, deploymentLoader) {
    return __awaiter(this, void 0, void 0, function* () {
        switch (future.type) {
            case module_1.FutureType.NAMED_ARTIFACT_CONTRACT_DEPLOYMENT:
            case module_1.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT:
            case module_1.FutureType.NAMED_ARTIFACT_CONTRACT_AT:
                return _storeArtifactAndBuildInfoAgainstDeployment(future, {
                    artifactResolver,
                    deploymentLoader,
                });
            case module_1.FutureType.CONTRACT_DEPLOYMENT:
            case module_1.FutureType.LIBRARY_DEPLOYMENT:
            case module_1.FutureType.CONTRACT_AT:
                return deploymentLoader.storeUserProvidedArtifact(future.id, future.artifact);
            case module_1.FutureType.CONTRACT_CALL:
            case module_1.FutureType.STATIC_CALL:
            case module_1.FutureType.ENCODE_FUNCTION_CALL:
            case module_1.FutureType.READ_EVENT_ARGUMENT:
            case module_1.FutureType.SEND_DATA:
                return;
        }
    });
}
exports.saveArtifactsForFuture = saveArtifactsForFuture;
function _storeArtifactAndBuildInfoAgainstDeployment(future, { deploymentLoader, artifactResolver, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const artifact = yield artifactResolver.loadArtifact(future.contractName);
        yield deploymentLoader.storeNamedArtifact(future.id, future.contractName, artifact);
        const buildInfo = yield artifactResolver.getBuildInfo(future.contractName);
        if (buildInfo !== undefined) {
            yield deploymentLoader.storeBuildInfo(future.id, buildInfo);
        }
    });
}
