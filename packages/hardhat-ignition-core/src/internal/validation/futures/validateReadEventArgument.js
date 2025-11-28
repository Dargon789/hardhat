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
exports.validateReadEventArgument = void 0;
const errors_1 = require("../../../errors");
const type_guards_1 = require("../../../type-guards");
const errors_list_1 = require("../../errors-list");
const abi_1 = require("../../execution/abi");
function validateReadEventArgument(future, artifactLoader, _deploymentParameters, _accounts) {
    return __awaiter(this, void 0, void 0, function* () {
        const errors = [];
        /* stage one */
        const artifact = "artifact" in future.emitter
            ? future.emitter.artifact
            : yield artifactLoader.loadArtifact(future.emitter.contractName);
        if (!(0, type_guards_1.isArtifactType)(artifact)) {
            errors.push(new errors_1.IgnitionError(errors_list_1.ERRORS.VALIDATION.INVALID_ARTIFACT, {
                contractName: future.emitter.contractName,
            }));
        }
        else {
            errors.push(...(0, abi_1.validateArtifactEventArgumentParams)(artifact, future.eventName, future.nameOrIndex));
        }
        return errors.map((e) => e.message);
    });
}
exports.validateReadEventArgument = validateReadEventArgument;
