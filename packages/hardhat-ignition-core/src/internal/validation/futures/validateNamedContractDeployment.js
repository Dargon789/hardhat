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
exports.validateNamedContractDeployment = void 0;
const errors_1 = require("../../../errors");
const type_guards_1 = require("../../../type-guards");
const errors_list_1 = require("../../errors-list");
const abi_1 = require("../../execution/abi");
const libraries_1 = require("../../execution/libraries");
const utils_1 = require("../utils");
function validateNamedContractDeployment(future, artifactLoader, deploymentParameters, accounts) {
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
            errors.push(...(0, abi_1.validateContractConstructorArgsLength)(artifact, future.contractName, future.constructorArgs));
        }
        /* stage two */
        const runtimeValues = (0, utils_1.retrieveNestedRuntimeValues)(future.constructorArgs);
        const moduleParams = runtimeValues.filter(type_guards_1.isModuleParameterRuntimeValue);
        const accountParams = [
            ...(0, utils_1.filterToAccountRuntimeValues)(runtimeValues),
            ...((0, type_guards_1.isAccountRuntimeValue)(future.from) ? [future.from] : []),
        ];
        errors.push(...accountParams.flatMap((arv) => (0, utils_1.validateAccountRuntimeValue)(arv, accounts)));
        const missingParams = moduleParams.filter((param) => (0, utils_1.resolvePotentialModuleParameterValueFrom)(deploymentParameters, param) ===
            undefined);
        if (missingParams.length > 0) {
            errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.MISSING_MODULE_PARAMETER, {
                name: missingParams[0].name,
            }));
        }
        if ((0, type_guards_1.isModuleParameterRuntimeValue)(future.value)) {
            const param = (0, utils_1.resolvePotentialModuleParameterValueFrom)(deploymentParameters, future.value);
            if (param === undefined) {
                errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.MISSING_MODULE_PARAMETER, {
                    name: future.value.name,
                }));
            }
            else if (typeof param !== "bigint") {
                errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.INVALID_MODULE_PARAMETER_TYPE, {
                    name: future.value.name,
                    expectedType: "bigint",
                    actualType: typeof param,
                }));
            }
        }
        return errors.map((e) => e.message);
    });
}
exports.validateNamedContractDeployment = validateNamedContractDeployment;
