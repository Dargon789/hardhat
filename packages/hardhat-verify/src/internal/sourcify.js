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
exports.Sourcify = void 0;
const errors_1 = require("./errors");
const undici_1 = require("./undici");
const sourcify_types_1 = require("./sourcify.types");
class Sourcify {
    constructor(chainId, apiUrl, browserUrl) {
        this.chainId = chainId;
        this.apiUrl = apiUrl;
        this.browserUrl = browserUrl;
    }
    // https://sourcify.dev/server/api-docs/#/Repository/get_check_all_by_addresses
    isVerified(address) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = new URLSearchParams({
                addresses: address,
                chainIds: `${this.chainId}`,
            });
            const url = new URL(`${this.apiUrl}/check-all-by-addresses`);
            url.search = parameters.toString();
            let response;
            let json;
            try {
                response = yield (0, undici_1.sendGetRequest)(url);
                json = (yield response.body.json());
            }
            catch (e) {
                throw new errors_1.NetworkRequestError(e);
            }
            if (!(0, undici_1.isSuccessStatusCode)(response.statusCode)) {
                throw new errors_1.ContractVerificationInvalidStatusCodeError(url.toString(), response.statusCode, JSON.stringify(json));
            }
            if (!Array.isArray(json)) {
                throw new errors_1.VerificationAPIUnexpectedMessageError(`Unexpected response body: ${JSON.stringify(json)}`);
            }
            const contract = json.find((match) => match.address.toLowerCase() === address.toLowerCase());
            if (contract === undefined) {
                return false;
            }
            if ("status" in contract && contract.status === sourcify_types_1.ContractStatus.NOT_FOUND) {
                return false;
            }
            if ("chainIds" in contract && contract.chainIds.length === 1) {
                const { status } = contract.chainIds[0];
                if (status === sourcify_types_1.ContractStatus.PERFECT ||
                    status === sourcify_types_1.ContractStatus.PARTIAL) {
                    return status;
                }
            }
            throw new errors_1.VerificationAPIUnexpectedMessageError(`Unexpected response body: ${JSON.stringify(json)}`);
        });
    }
    // https://sourcify.dev/server/api-docs/#/Stateless%20Verification/post_verify
    verify(address, files, chosenContract) {
        return __awaiter(this, void 0, void 0, function* () {
            const parameters = {
                address,
                files,
                chain: `${this.chainId}`,
            };
            if (chosenContract !== undefined) {
                parameters.chosenContract = `${chosenContract}`;
            }
            const url = new URL(this.apiUrl);
            let response;
            let json;
            try {
                response = yield (0, undici_1.sendPostRequest)(url, JSON.stringify(parameters), {
                    "Content-Type": "application/json",
                });
                json = (yield response.body.json());
            }
            catch (e) {
                throw new errors_1.NetworkRequestError(e);
            }
            if (!(0, undici_1.isSuccessStatusCode)(response.statusCode)) {
                throw new errors_1.ContractVerificationInvalidStatusCodeError(url.toString(), response.statusCode, JSON.stringify(json));
            }
            const sourcifyResponse = new SourcifyResponse(json);
            if (!sourcifyResponse.isOk()) {
                throw new errors_1.VerificationAPIUnexpectedMessageError(`Verify response is not ok: ${JSON.stringify(json)}`);
            }
            return sourcifyResponse;
        });
    }
    getContractUrl(address, contractStatus) {
        const matchType = contractStatus === sourcify_types_1.ContractStatus.PERFECT
            ? "full_match"
            : "partial_match";
        return `${this.browserUrl}/contracts/${matchType}/${this.chainId}/${address}/`;
    }
}
exports.Sourcify = Sourcify;
class SourcifyResponse {
    constructor(response) {
        if ("error" in response) {
            this.error = response.error;
        }
        else if (response.result[0].status === sourcify_types_1.ContractStatus.PERFECT) {
            this.status = sourcify_types_1.ContractStatus.PERFECT;
        }
        else if (response.result[0].status === sourcify_types_1.ContractStatus.PARTIAL) {
            this.status = sourcify_types_1.ContractStatus.PARTIAL;
        }
    }
    isPending() {
        return false;
    }
    isFailure() {
        return this.error !== undefined;
    }
    isSuccess() {
        return this.error === undefined;
    }
    isOk() {
        return (this.status === sourcify_types_1.ContractStatus.PERFECT ||
            this.status === sourcify_types_1.ContractStatus.PARTIAL);
    }
}
