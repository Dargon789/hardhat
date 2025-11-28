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
exports.verifyEtherscanContract = void 0;
function verifyEtherscanContract(etherscanInstance, { address, compilerVersion, sourceCode, name, args }) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const { message: guid } = yield etherscanInstance.verify(address, sourceCode, name, compilerVersion, args);
            const verificationStatus = yield etherscanInstance.getVerificationStatus(guid);
            if (verificationStatus.isSuccess()) {
                const contractURL = etherscanInstance.getContractUrl(address);
                return { type: "success", contractURL };
            }
            else {
                // todo: what case would cause verification status not to succeed without throwing?
                return { type: "failure", reason: new Error(verificationStatus.message) };
            }
        }
        catch (e) {
            if (e instanceof Error) {
                return { type: "failure", reason: e };
            }
            else {
                throw e;
            }
        }
    });
}
exports.verifyEtherscanContract = verifyEtherscanContract;
