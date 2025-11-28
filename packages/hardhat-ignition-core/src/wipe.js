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
exports.wipe = void 0;
const ephemeral_deployment_loader_1 = require("./internal/deployment-loader/ephemeral-deployment-loader");
const file_deployment_loader_1 = require("./internal/deployment-loader/file-deployment-loader");
const wiper_1 = require("./internal/wiper");
/**
 * Clear the state against a future within a deployment
 *
 * @param deploymentDir - the file directory of the deployment
 * @param futureId - the future to be cleared
 *
 * @beta
 */
function wipe(deploymentDir, artifactResolver, futureId) {
    return __awaiter(this, void 0, void 0, function* () {
        const deploymentLoader = deploymentDir !== undefined
            ? new file_deployment_loader_1.FileDeploymentLoader(deploymentDir)
            : new ephemeral_deployment_loader_1.EphemeralDeploymentLoader(artifactResolver);
        const wiper = new wiper_1.Wiper(deploymentLoader);
        yield wiper.wipe(futureId);
    });
}
exports.wipe = wipe;
