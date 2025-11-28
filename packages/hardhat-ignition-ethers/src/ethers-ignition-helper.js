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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EthersIgnitionHelper = void 0;
const helpers_1 = require("@nomicfoundation/hardhat-ignition/helpers");
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const plugins_1 = require("hardhat/plugins");
const path_1 = __importDefault(require("path"));
class EthersIgnitionHelper {
    constructor(_hre, _config, provider) {
        this._hre = _hre;
        this._config = _config;
        this.type = "ethers";
        this._provider = provider !== null && provider !== void 0 ? provider : this._hre.network.provider;
    }
    /**
     * Deploys the given Ignition module and returns the results of the module as
     * Ethers contract instances.
     *
     * @param ignitionModule - The Ignition module to deploy.
     * @param options - The options to use for the deployment.
     * @returns Ethers contract instances for each contract returned by the
     * module.
     */
    deploy(ignitionModule, { parameters = {}, config: perDeployConfig = {}, defaultSender = undefined, strategy, strategyConfig, deploymentId: givenDeploymentId = undefined, displayUi = false, } = {
        parameters: {},
        config: {},
        defaultSender: undefined,
        strategy: undefined,
        strategyConfig: undefined,
        deploymentId: undefined,
        displayUi: undefined,
    }) {
        var _a, _b;
        return __awaiter(this, void 0, void 0, function* () {
            const accounts = (yield this._hre.network.provider.request({
                method: "eth_accounts",
            }));
            const artifactResolver = new helpers_1.HardhatArtifactResolver(this._hre);
            const resolvedConfig = Object.assign(Object.assign({}, this._config), perDeployConfig);
            const resolvedStrategyConfig = EthersIgnitionHelper._resolveStrategyConfig(this._hre, strategy, strategyConfig);
            const chainId = Number(yield this._hre.network.provider.request({
                method: "eth_chainId",
            }));
            const deploymentId = (0, helpers_1.resolveDeploymentId)(givenDeploymentId, chainId);
            const deploymentDir = this._hre.network.name === "hardhat"
                ? undefined
                : path_1.default.join(this._hre.config.paths.ignition, "deployments", deploymentId);
            const executionEventListener = displayUi
                ? new helpers_1.PrettyEventHandler()
                : undefined;
            let deploymentParameters;
            if (typeof parameters === "string") {
                deploymentParameters = yield (0, helpers_1.readDeploymentParameters)(parameters);
            }
            else {
                deploymentParameters = parameters;
            }
            const result = yield (0, ignition_core_1.deploy)({
                config: resolvedConfig,
                provider: this._provider,
                deploymentDir,
                executionEventListener,
                artifactResolver,
                ignitionModule,
                deploymentParameters,
                accounts,
                defaultSender,
                strategy,
                strategyConfig: resolvedStrategyConfig,
                maxFeePerGasLimit: (_a = this._hre.config.networks[this._hre.network.name]) === null || _a === void 0 ? void 0 : _a.ignition.maxFeePerGasLimit,
                maxPriorityFeePerGas: (_b = this._hre.config.networks[this._hre.network.name]) === null || _b === void 0 ? void 0 : _b.ignition.maxPriorityFeePerGas,
            });
            if (result.type !== ignition_core_1.DeploymentResultType.SUCCESSFUL_DEPLOYMENT) {
                const message = (0, helpers_1.errorDeploymentResultToExceptionMessage)(result);
                throw new plugins_1.HardhatPluginError("hardhat-ignition-viem", message);
            }
            return EthersIgnitionHelper._toEthersContracts(this._hre, ignitionModule, result);
        });
    }
    static _toEthersContracts(hre, ignitionModule, result) {
        return __awaiter(this, void 0, void 0, function* () {
            return Object.fromEntries(yield Promise.all(Object.entries(ignitionModule.results).map(([name, contractFuture]) => __awaiter(this, void 0, void 0, function* () {
                return [
                    name,
                    yield this._getContract(hre, contractFuture, result.contracts[contractFuture.id]),
                ];
            }))));
        });
    }
    static _getContract(hre, future, deployedContract) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, ignition_core_1.isContractFuture)(future)) {
                throw new plugins_1.HardhatPluginError("hardhat-ignition", `Expected contract future but got ${future.id} with type ${future.type} instead`);
            }
            if ("artifact" in future) {
                return hre.ethers.getContractAt(
                // The abi meets the abi spec and we assume we can convert to
                // an acceptable Ethers abi
                future.artifact.abi, deployedContract.address);
            }
            return hre.ethers.getContractAt(future.contractName, deployedContract.address);
        });
    }
    static _resolveStrategyConfig(hre, strategyName, strategyConfig) {
        var _a, _b;
        if (strategyName === undefined) {
            return undefined;
        }
        if (strategyConfig === undefined) {
            const fromHardhatConfig = (_b = (_a = hre.config.ignition) === null || _a === void 0 ? void 0 : _a.strategyConfig) === null || _b === void 0 ? void 0 : _b[strategyName];
            return fromHardhatConfig;
        }
        return strategyConfig;
    }
}
exports.EthersIgnitionHelper = EthersIgnitionHelper;
