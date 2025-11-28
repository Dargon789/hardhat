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
const chai_1 = require("chai");
const abi_1 = require("../src/internal/execution/abi");
const jsonrpc_client_1 = require("../src/internal/execution/jsonrpc-client");
const execution_result_fixtures_1 = require("../test/helpers/execution-result-fixtures");
const hardhat_projects_1 = require("./helpers/hardhat-projects");
// See ../test/helpers/execution-result-fixtures.ts
describe("execution-result-fixture tests", function () {
    (0, hardhat_projects_1.useHardhatProject)("default");
    it("Should have the right values", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const client = new jsonrpc_client_1.EIP1193JsonRpcClient(this.hre.network.provider);
            for (const [name, artifact] of Object.entries(execution_result_fixtures_1.staticCallResultFixturesArtifacts)) {
                const expectedArtifact = yield this.hre.artifacts.readArtifact(name);
                chai_1.assert.deepEqual(artifact, expectedArtifact, `Artifact ${name} doesn't match`);
            }
            const addresses = {};
            let nonce = 0;
            for (const [name, artifact] of Object.entries(execution_result_fixtures_1.staticCallResultFixturesArtifacts)) {
                const fees = yield client.getNetworkFees();
                const tx = yield client.sendTransaction({
                    data: (0, abi_1.encodeArtifactDeploymentData)(artifact, [], {}),
                    value: 0n,
                    from: this.accounts[0],
                    nonce: nonce++,
                    fees,
                    gasLimit: 1000000n,
                });
                const receipt = yield client.getTransactionReceipt(tx);
                chai_1.assert.isDefined(receipt, `No receipt for deployment of ${name}`);
                chai_1.assert.isDefined(receipt.contractAddress, `No receipt address from deployment of ${name}`);
                addresses[name] = receipt.contractAddress;
            }
            const assertFunctionFixtureMatches = (contractName, functionName) => __awaiter(this, void 0, void 0, function* () {
                (0, chai_1.assert)(contractName in execution_result_fixtures_1.staticCallResultFixturesArtifacts, `Artifact ${contractName} missing from the fixture`);
                const expected = yield client.call({
                    data: (0, abi_1.encodeArtifactFunctionCall)(execution_result_fixtures_1.staticCallResultFixturesArtifacts[contractName], functionName, []),
                    value: 0n,
                    from: this.accounts[0],
                    to: addresses[contractName],
                }, "latest");
                chai_1.assert.deepEqual(execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName], expected, `Fixture for [${contractName}]${functionName} doesn't match`);
            });
            const contractNames = Object.keys(execution_result_fixtures_1.staticCallResultFixturesArtifacts);
            for (const contractName of contractNames) {
                const artifact = execution_result_fixtures_1.staticCallResultFixturesArtifacts[contractName];
                for (const abiItem of artifact.abi) {
                    if (abiItem.type !== "function") {
                        continue;
                    }
                    (0, chai_1.assert)(contractName in execution_result_fixtures_1.staticCallResultFixtures, `Fixture for ${contractName} missing`);
                    (0, chai_1.assert)(abiItem.name in execution_result_fixtures_1.staticCallResultFixtures[contractName], `Fixture for ${contractName}.${abiItem.name} missing`);
                    yield assertFunctionFixtureMatches(contractName, abiItem.name);
                }
            }
            for (const [name, artifact] of Object.entries(execution_result_fixtures_1.deploymentFixturesArtifacts)) {
                const expectedArtifact = yield this.hre.artifacts.readArtifact(name);
                chai_1.assert.deepEqual(artifact, expectedArtifact, `Artifact ${name} doesn't match`);
            }
            for (const [name, artifact] of Object.entries(execution_result_fixtures_1.callEncodingFixtures)) {
                const expectedArtifact = yield this.hre.artifacts.readArtifact(name);
                chai_1.assert.deepEqual(artifact, expectedArtifact, `Artifact ${name} doesn't match`);
            }
        });
    });
});
