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
exports.validateNamedLibraryDeployment = void 0;
const errors_1 = require("../../../errors");
const type_guards_1 = require("../../../type-guards");
const errors_list_1 = require("../../errors-list");
const libraries_1 = require("../../execution/libraries");
const utils_1 = require("../utils");
function validateNamedLibraryDeployment(future, artifactLoader, _deploymentParameters, accounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        /* stage one */
        const artifact = yield artifactLoader.loadArtifact(future.contractName);
        if (!(0, type_guards_1.isArtifactType)(artifact)) {
            errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.INVALID_ARTIFACT, {
                contractName: future.contractName,
            }));
        }
        else {
            errors.push(...(0, libraries_1.validateLibraryNames)(artifact, Object.keys(future.libraries)));
        }
        /* stage two */
        if ((0, type_guards_1.isAccountRuntimeValue)(future.from)) {
            errors.push(...(0, utils_1.validateAccountRuntimeValue)(future.from, accounts));
        }
        return errors.map((e) => e.message);
    });
}
exports.validateNamedLibraryDeployment = validateNamedLibraryDeployment;
