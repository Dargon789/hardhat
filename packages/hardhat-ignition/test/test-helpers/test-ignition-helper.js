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
exports.TestIgnitionHelper = void 0;
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const plugins_1 = require("hardhat/plugins");
const viem_1 = require("viem");
const chains_1 = require("viem/chains");
const hardhat_artifact_resolver_1 = require("../../src/hardhat-artifact-resolver");
const error_deployment_result_to_exception_message_1 = require("../../src/utils/error-deployment-result-to-exception-message");
class TestIgnitionHelper {
    constructor(_hre, _config, provider, deploymentDir) {
        this._hre = _hre;
        this._config = _config;
        this.type = "test";
        this._provider = provider !== null && provider !== void 0 ? provider : this._hre.network.provider;
        this._deploymentDir = deploymentDir;
    }
    deploy(ignitionModule, { parameters = {}, config: perDeployConfig = {}, strategy: strategyName, strategyConfig, defaultSender = undefined, } = {
        parameters: {},
        config: {},
    }) {
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = (yield this._hre.network.provider.request({
                method: "eth_accounts",
            }));
            const artifactResolver = new hardhat_artifact_resolver_1.HardhatArtifactResolver(this._hre);
            const resolvedConfig = Object.assign(Object.assign({}, this._config), perDeployConfig);
            const result = yield (0, ignition_core_1.deploy)({
                config: resolvedConfig,
                provider: this._provider,
                deploymentDir: this._deploymentDir,
                artifactResolver,
                ignitionModule,
                deploymentParameters: parameters,
                accounts,
                defaultSender,
                strategy: strategyName,
                strategyConfig,
            });
            if (result.type !== ignition_core_1.DeploymentResultType.SUCCESSFUL_DEPLOYMENT) {
                const message = (0, error_deployment_result_to_exception_message_1.errorDeploymentResultToExceptionMessage)(result);
                throw new plugins_1.HardhatPluginError("hardhat-ignition-test", message);
            }
            const publicClient = (0, viem_1.createPublicClient)({
                chain: chains_1.hardhat,
                transport: (0, viem_1.custom)(this._hre.network.provider),
            });
            return this._toViemContracts(this._hre, ignitionModule, result, publicClient);
        });
    }
    _toViemContracts(hre, ignitionModule, result, publicClient) {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.fromEntries(yield Promise.all(Object.entries(ignitionModule.results).map(([name, contractFuture]) => __awaiter(this, void 0, void 0, function* () {
                return [
                    name,
                    yield this._getContract(hre, contractFuture, result.contracts[contractFuture.id], publicClient),
                ];
            }))));
        });
    }
    _getContract(hre, future, deployedContract, publicClient) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, ignition_core_1.isContractFuture)(future)) {
                throw new plugins_1.HardhatPluginError("hardhat-ignition-viem", `Expected contract future but got ${future.id} with type ${future.type} instead`);
            }
            const contract = (0, viem_1.getContract)({
                address: this._ensureAddressFormat(deployedContract.address),
                abi: yield this._loadAbiFromHHArtifactFolder(hre, deployedContract.contractName),
                client: { public: publicClient },
            });
            return contract;
        });
    }
    _ensureAddressFormat(address) {
        if (!address.startsWith("0x")) {
            return `0x${address}`;
        }
        return `0x${address.slice(2)}`;
    }
    _loadAbiFromHHArtifactFolder(hre, contractName) {
        return __awaiter(this, void 0, void 0, function* () {
            const artifact = yield hre.artifacts.readArtifact(contractName);
            if (artifact === undefined) {
                throw new Error(`Test error: no hardcoded abi for contract ${contractName}`);
            }
            return artifact.abi;
        });
    }
}
exports.TestIgnitionHelper = TestIgnitionHelper;
