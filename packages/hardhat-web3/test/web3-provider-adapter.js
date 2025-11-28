"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable @typescript-eslint/strict-boolean-expressions */
const chai_1 = require("chai");
const web3_1 = __importDefault(require("web3"));
const web3_provider_adapter_1 = require("../src/web3-provider-adapter");
const helpers_1 = require("./helpers");
let nextId = 1;
function createJsonRpcRequest(method, params = []) {
    return {
        id: nextId++,
        jsonrpc: "2.0",
        method,
        params,
    };
}
describe("Web3 provider adapter", function () {
    let realWeb3Provider;
    let adaptedProvider;
    (0, helpers_1.useEnvironment)("hardhat-project");
    beforeEach(function () {
        realWeb3Provider = new web3_1.default.providers.HttpProvider("http://127.0.0.1:8545");
        adaptedProvider = new web3_provider_adapter_1.Web3HTTPProviderAdapter(this.env.network.provider);
    });
    it("Should always return true when isConnected is called", function () {
        chai_1.assert.isTrue(adaptedProvider.isConnected());
    });
    it("Should return the same as the real provider for single requests", function (done) {
        const request = createJsonRpcRequest("eth_accounts");
        realWeb3Provider.send(request, (error, response) => {
            adaptedProvider.send(request, (error2, response2) => {
                chai_1.assert.deepEqual(error2, error);
                chai_1.assert.deepEqual(response2, response);
                done();
            });
        });
    });
    it("Should return the same as the real provider for batched requests", function (done) {
        const requests = [
            createJsonRpcRequest("eth_accounts"),
            createJsonRpcRequest("net_version"),
            createJsonRpcRequest("eth_accounts"),
        ];
        realWeb3Provider.send(requests, (error, response) => {
            adaptedProvider.send(requests, (error2, response2) => {
                chai_1.assert.deepEqual(error2, error);
                chai_1.assert.deepEqual(response2, response);
                done();
            });
        });
    });
    it("Should return the same on error", function (done) {
        // We disable this test for RskJ
        // See: https://github.com/rsksmart/rskj/issues/876
        this.env.network.provider
            .send("web3_clientVersion")
            .then((version) => {
            if (version.includes("RskJ")) {
                done();
                return;
            }
            const request = createJsonRpcRequest("error_please");
            return realWeb3Provider.send(request, (error, response) => {
                adaptedProvider.send(request, (error2, response2) => {
                    chai_1.assert.deepEqual(error2, error);
                    chai_1.assert.equal(response2.error.message, response.error.message);
                    done();
                });
            });
        })
            .then(() => { }, () => { });
    });
    it("Should let all requests complete, even if one of them fails", function (done) {
        const requests = [
            createJsonRpcRequest("eth_accounts"),
            createJsonRpcRequest("error_please"),
            createJsonRpcRequest("eth_accounts"),
        ];
        realWeb3Provider.send(requests, (error, response) => {
            adaptedProvider.send(requests, (error2, response2) => {
                chai_1.assert.deepEqual(error2, error);
                chai_1.assert.deepEqual(response2[0], response[0]);
                chai_1.assert.equal(response2[1].error.message, response[1].error.message);
                // Ganache doesn't return a value for requests after the failing one,
                // so we don't either. Otherwise, this should be tested.
                // assert.lengthOf(response2!, response!.length);
                // assert.isUndefined(responseFromAdapted![2]);![2]);
                // We disable this test for RskJ
                // See: https://github.com/rsksmart/rskj/issues/876
                this.env.network.provider
                    .send("web3_clientVersion")
                    .then((version) => {
                    if (version.includes("RskJ")) {
                        chai_1.assert.equal(response2[1].error.message, response[1].error.message);
                    }
                })
                    .then(done, done);
            });
        });
    });
});
