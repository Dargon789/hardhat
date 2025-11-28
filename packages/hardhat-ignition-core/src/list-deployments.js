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
exports.listDeployments = void 0;
const fs_extra_1 = require("fs-extra");
/**
 * Return a list of all deployments in the deployment directory.
 *
 * @param deploymentDir - the directory of the deployments
 *
 * @beta
 */
function listDeployments(deploymentDir) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!(yield (0, fs_extra_1.pathExists)(deploymentDir))) {
            return [];
        }
        return (0, fs_extra_1.readdir)(deploymentDir);
    });
}
exports.listDeployments = listDeployments;
