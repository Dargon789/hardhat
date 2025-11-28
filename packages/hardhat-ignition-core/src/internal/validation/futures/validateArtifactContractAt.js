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
exports.validateArtifactContractAt = void 0;
const errors_1 = require("../../../errors");
const type_guards_1 = require("../../../type-guards");
const errors_list_1 = require("../../errors-list");
const utils_1 = require("../utils");
function validateArtifactContractAt(future, _artifactLoader, deploymentParameters, _accounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        /* stage two */
        if ((0, type_guards_1.isModuleParameterRuntimeValue)(future.address)) {
            const param = (0, utils_1.resolvePotentialModuleParameterValueFrom)(deploymentParameters, future.address);
            if (param === undefined) {
                errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.MISSING_MODULE_PARAMETER, {
                    name: future.address.name,
                }));
            }
            else if (typeof param !== "string") {
                errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.INVALID_MODULE_PARAMETER_TYPE, {
                    name: future.address.name,
                    expectedType: "string",
                    actualType: typeof param,
                }));
            }
        }
        return errors.map((e) => e.message);
    });
}
exports.validateArtifactContractAt = validateArtifactContractAt;
