"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomicfoundation/hardhat-verify");
const etherscan_1 = require("@nomicfoundation/hardhat-verify/etherscan");
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = require("fs-extra");
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
const json5_1 = require("json5");
const path_1 = __importDefault(require("path"));
require("./type-extensions");
const calculate_deployment_status_display_1 = require("./ui/helpers/calculate-deployment-status-display");
const bigintReviver_1 = require("./utils/bigintReviver");
const getApiKeyAndUrls_1 = require("./utils/getApiKeyAndUrls");
const read_deployment_parameters_1 = require("./utils/read-deployment-parameters");
const resolve_deployment_id_1 = require("./utils/resolve-deployment-id");
const shouldBeHardhatPluginError_1 = require("./utils/shouldBeHardhatPluginError");
const verifyEtherscanContract_1 = require("./utils/verifyEtherscanContract");
/* ignition config defaults */
const IGNITION_DIR = "ignition";
const ignitionScope = (0, config_1.scope)("ignition", "Deploy your smart contracts using Hardhat Ignition");
const log = (0, debug_1.default)("hardhat:ignition");
(0, config_1.extendConfig)((config, userConfig) => {
    var _a, _b, _c;
    /* setup path configs */
    const userPathsConfig = (_a = userConfig.paths) !== null && _a !== void 0 ? _a : {};
    config.paths = Object.assign(Object.assign({}, config.paths), { ignition: path_1.default.resolve(config.paths.root, (_b = userPathsConfig.ignition) !== null && _b !== void 0 ? _b : IGNITION_DIR) });
    Object.keys(config.networks).forEach((networkName) => {
        var _a, _b, _c, _d, _e, _f, _g;
        const userNetworkConfig = (_b = (_a = userConfig.networks) === null || _a === void 0 ? void 0 : _a[networkName]) !== null && _b !== void 0 ? _b : {};
        config.networks[networkName].ignition = {
            maxFeePerGasLimit: (_c = userNetworkConfig.ignition) === null || _c === void 0 ? void 0 : _c.maxFeePerGasLimit,
            maxPriorityFeePerGas: (_d = userNetworkConfig.ignition) === null || _d === void 0 ? void 0 : _d.maxPriorityFeePerGas,
            gasPrice: (_e = userNetworkConfig.ignition) === null || _e === void 0 ? void 0 : _e.gasPrice,
            disableFeeBumping: (_f = userNetworkConfig.ignition) === null || _f === void 0 ? void 0 : _f.disableFeeBumping,
            explorerUrl: (_g = userNetworkConfig.ignition) === null || _g === void 0 ? void 0 : _g.explorerUrl,
        };
    });
    /* setup core configs */
    const userIgnitionConfig = (_c = userConfig.ignition) !== null && _c !== void 0 ? _c : {};
    config.ignition = userIgnitionConfig;
});
/**
 * Add an `ignition` stub to throw
 */
(0, config_1.extendEnvironment)((hre) => {
    if (hre.ignition === undefined) {
        hre.ignition = {
            type: "stub",
            deploy: () => {
                throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", "Please install either `@nomicfoundation/hardhat-ignition-viem` or `@nomicfoundation/hardhat-ignition-ethers` to use Ignition in your Hardhat tests");
            },
        };
    }
});
ignitionScope
    .task("deploy")
    .addPositionalParam("modulePath", "The path to the module file to deploy")
    .addOptionalParam("parameters", "A relative path to a JSON file to use for the module parameters")
    .addOptionalParam("deploymentId", "Set the id of the deployment")
    .addOptionalParam("defaultSender", "Set the default sender for the deployment")
    .addOptionalParam("strategy", "Set the deployment strategy to use", "basic")
    .addFlag("reset", "Wipes the existing deployment state before deploying")
    .addFlag("verify", "Verify the deployment on Etherscan")
    .addFlag("writeLocalhostDeployment", "Write deployment information to disk when deploying to the in-memory network")
    .setDescription("Deploy a module to the specified network")
    .setAction(({ modulePath, parameters: parametersInput, deploymentId: givenDeploymentId, defaultSender, reset, verify, strategy: strategyName, writeLocalhostDeployment, }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f;
    const { default: chalk } = yield Promise.resolve().then(() => __importStar(require("chalk")));
    const { default: Prompt } = yield Promise.resolve().then(() => __importStar(require("prompts")));
    const { deploy } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const { HardhatArtifactResolver } = yield Promise.resolve().then(() => __importStar(require("./hardhat-artifact-resolver")));
    const { loadModule } = yield Promise.resolve().then(() => __importStar(require("./utils/load-module")));
    const { PrettyEventHandler } = yield Promise.resolve().then(() => __importStar(require("./ui/pretty-event-handler")));
    if (verify) {
        if (hre.config.etherscan === undefined ||
            hre.config.etherscan.apiKey === undefined ||
            hre.config.etherscan.apiKey === "") {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "No etherscan API key configured");
        }
    }
    const chainId = Number(yield hre.network.provider.request({
        method: "eth_chainId",
    }));
    const deploymentId = (0, resolve_deployment_id_1.resolveDeploymentId)(givenDeploymentId, chainId);
    const deploymentDir = hre.network.name === "hardhat" && !writeLocalhostDeployment
        ? undefined
        : path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    if (chainId !== 31337) {
        if (process.env.HARDHAT_IGNITION_CONFIRM_DEPLOYMENT === undefined) {
            const prompt = yield Prompt({
                type: "confirm",
                name: "networkConfirmation",
                message: `Confirm deploy to network ${hre.network.name} (${chainId})?`,
                initial: false,
            });
            if (prompt.networkConfirmation !== true) {
                console.log("Deploy cancelled");
                return;
            }
        }
        if (reset && process.env.HARDHAT_IGNITION_CONFIRM_RESET === undefined) {
            const resetPrompt = yield Prompt({
                type: "confirm",
                name: "resetConfirmation",
                message: `Confirm reset of deployment "${deploymentId}" on chain ${chainId}?`,
                initial: false,
            });
            if (resetPrompt.resetConfirmation !== true) {
                console.log("Deploy cancelled");
                return;
            }
        }
    }
    else if (deploymentDir !== undefined) {
        // since we're on hardhat-network
        // check for a previous run of this deploymentId and compare instanceIds
        // if they're different, wipe deployment state
        const instanceFilePath = path_1.default.join(hre.config.paths.cache, ".hardhat-network-instances.json");
        const instanceFileExists = yield (0, fs_extra_1.pathExists)(instanceFilePath);
        const instanceFile = instanceFileExists ? require(instanceFilePath) : {};
        const metadata = (yield hre.network.provider.request({
            method: "hardhat_metadata",
        }));
        if (instanceFile[deploymentId] !== metadata.instanceId) {
            yield (0, fs_extra_1.rm)(deploymentDir, { recursive: true, force: true });
        }
        // save current instanceId to instanceFile for future runs
        instanceFile[deploymentId] = metadata.instanceId;
        yield (0, fs_extra_1.ensureDir)(path_1.default.dirname(instanceFilePath));
        yield (0, fs_extra_1.writeJSON)(instanceFilePath, instanceFile, { spaces: 2 });
    }
    if (reset) {
        if (deploymentDir === undefined) {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "Deploy cancelled: Cannot reset deployment on ephemeral Hardhat network");
        }
        else {
            yield (0, fs_extra_1.rm)(deploymentDir, { recursive: true, force: true });
        }
    }
    if (strategyName !== "basic" && strategyName !== "create2") {
        throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", "Invalid strategy name, must be either 'basic' or 'create2'");
    }
    yield hre.run("compile", { quiet: true });
    const userModule = loadModule(hre.config.paths.ignition, modulePath);
    if (userModule === undefined) {
        throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "No Ignition modules found");
    }
    let parameters;
    if (parametersInput === undefined) {
        parameters = yield resolveParametersFromModuleName(userModule.id, hre.config.paths.ignition);
    }
    else if (parametersInput.endsWith(".json") ||
        parametersInput.endsWith(".json5")) {
        parameters = yield resolveParametersFromFileName(parametersInput);
    }
    else {
        parameters = resolveParametersString(parametersInput);
    }
    const accounts = (yield hre.network.provider.request({
        method: "eth_accounts",
    }));
    const artifactResolver = new HardhatArtifactResolver(hre);
    const executionEventListener = new PrettyEventHandler();
    const strategyConfig = (_a = hre.config.ignition.strategyConfig) === null || _a === void 0 ? void 0 : _a[strategyName];
    try {
        const ledgerConnectionStart = () => executionEventListener.ledgerConnectionStart();
        const ledgerConnectionSuccess = () => executionEventListener.ledgerConnectionSuccess();
        const ledgerConnectionFailure = () => executionEventListener.ledgerConnectionFailure();
        const ledgerConfirmationStart = () => executionEventListener.ledgerConfirmationStart();
        const ledgerConfirmationSuccess = () => executionEventListener.ledgerConfirmationSuccess();
        const ledgerConfirmationFailure = () => executionEventListener.ledgerConfirmationFailure();
        try {
            yield hre.network.provider.send("hardhat_setLedgerOutputEnabled", [
                false,
            ]);
            hre.network.provider.once("connection_start", ledgerConnectionStart);
            hre.network.provider.once("connection_success", ledgerConnectionSuccess);
            hre.network.provider.once("connection_failure", ledgerConnectionFailure);
            hre.network.provider.on("confirmation_start", ledgerConfirmationStart);
            hre.network.provider.on("confirmation_success", ledgerConfirmationSuccess);
            hre.network.provider.on("confirmation_failure", ledgerConfirmationFailure);
        }
        catch (error) {
            log(error);
        }
        const result = yield deploy({
            config: hre.config.ignition,
            provider: hre.network.provider,
            executionEventListener,
            artifactResolver,
            deploymentDir,
            ignitionModule: userModule,
            deploymentParameters: parameters !== null && parameters !== void 0 ? parameters : {},
            accounts,
            defaultSender,
            strategy: strategyName,
            strategyConfig,
            maxFeePerGasLimit: (_b = hre.config.networks[hre.network.name]) === null || _b === void 0 ? void 0 : _b.ignition.maxFeePerGasLimit,
            maxPriorityFeePerGas: (_c = hre.config.networks[hre.network.name]) === null || _c === void 0 ? void 0 : _c.ignition.maxPriorityFeePerGas,
            gasPrice: (_d = hre.config.networks[hre.network.name]) === null || _d === void 0 ? void 0 : _d.ignition.gasPrice,
            disableFeeBumping: (_e = hre.config.ignition.disableFeeBumping) !== null && _e !== void 0 ? _e : (_f = hre.config.networks[hre.network.name]) === null || _f === void 0 ? void 0 : _f.ignition.disableFeeBumping,
        });
        try {
            yield hre.network.provider.send("hardhat_setLedgerOutputEnabled", [
                true,
            ]);
            hre.network.provider.off("connection_start", ledgerConnectionStart);
            hre.network.provider.off("connection_success", ledgerConnectionSuccess);
            hre.network.provider.off("connection_failure", ledgerConnectionFailure);
            hre.network.provider.off("confirmation_start", ledgerConfirmationStart);
            hre.network.provider.off("confirmation_success", ledgerConfirmationSuccess);
            hre.network.provider.off("confirmation_failure", ledgerConfirmationFailure);
        }
        catch (error) {
            log(error);
        }
        if (result.type === "SUCCESSFUL_DEPLOYMENT" && verify) {
            console.log("");
            console.log(chalk.bold("Verifying deployed contracts"));
            console.log("");
            yield hre.run({ scope: "ignition", task: "verify" }, { deploymentId });
        }
        if (result.type !== "SUCCESSFUL_DEPLOYMENT") {
            process.exitCode = 1;
        }
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
}));
ignitionScope
    .task("track-tx")
    .addPositionalParam("txHash", "The hash of the transaction to track")
    .addPositionalParam("deploymentId", "The id of the deployment to add the tx to")
    .setDescription("Track a transaction that is missing from a given deployment. Only use if a Hardhat Ignition error message suggests to do so.")
    .setAction(({ txHash, deploymentId }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { trackTransaction } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    let output;
    try {
        output = yield trackTransaction(deploymentDir, txHash, hre.network.provider, hre.config.ignition.requiredConfirmations);
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
    console.log(output !== null && output !== void 0 ? output : `Thanks for providing the transaction hash, your deployment has been fixed.

Now you can re-run Hardhat Ignition to continue with your deployment.`);
}));
ignitionScope
    .task("visualize")
    .addFlag("noOpen", "Disables opening report in browser")
    .addPositionalParam("modulePath", "The path to the module file to visualize")
    .setDescription("Visualize a module as an HTML report")
    .setAction(({ noOpen = false, modulePath }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { IgnitionModuleSerializer, batches } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const { loadModule } = yield Promise.resolve().then(() => __importStar(require("./utils/load-module")));
    const { open } = yield Promise.resolve().then(() => __importStar(require("./utils/open")));
    const { writeVisualization } = yield Promise.resolve().then(() => __importStar(require("./visualization/write-visualization")));
    yield hre.run("compile", { quiet: true });
    const userModule = loadModule(hre.config.paths.ignition, modulePath);
    if (userModule === undefined) {
        throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "No Ignition modules found");
    }
    else {
        try {
            const serializedIgnitionModule = IgnitionModuleSerializer.serialize(userModule);
            const batchInfo = batches(userModule);
            yield writeVisualization({ module: serializedIgnitionModule, batches: batchInfo }, {
                cacheDir: hre.config.paths.cache,
            });
        }
        catch (e) {
            if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
                throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
            }
            throw e;
        }
    }
    if (!noOpen) {
        const indexFile = path_1.default.join(hre.config.paths.cache, "visualization", "index.html");
        console.log(`Deployment visualization written to ${indexFile}`);
        open(indexFile);
    }
}));
ignitionScope
    .task("status")
    .addPositionalParam("deploymentId", "The id of the deployment to show")
    .setDescription("Show the current status of a deployment")
    .setAction(({ deploymentId }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { status } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const { HardhatArtifactResolver } = yield Promise.resolve().then(() => __importStar(require("./hardhat-artifact-resolver")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    const artifactResolver = new HardhatArtifactResolver(hre);
    let statusResult;
    try {
        statusResult = yield status(deploymentDir, artifactResolver);
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
    console.log((0, calculate_deployment_status_display_1.calculateDeploymentStatusDisplay)(deploymentId, statusResult));
}));
ignitionScope
    .task("deployments")
    .setDescription("List all deployment IDs")
    .setAction((_, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { listDeployments } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments");
    try {
        const deployments = yield listDeployments(deploymentDir);
        for (const deploymentId of deployments) {
            console.log(deploymentId);
        }
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
}));
ignitionScope
    .task("wipe")
    .addPositionalParam("deploymentId", "The id of the deployment with the future to wipe")
    .addPositionalParam("futureId", "The id of the future to wipe")
    .setDescription("Reset a deployment's future to allow rerunning")
    .setAction(({ deploymentId, futureId }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    const { wipe } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const { HardhatArtifactResolver } = yield Promise.resolve().then(() => __importStar(require("./hardhat-artifact-resolver")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    try {
        yield wipe(deploymentDir, new HardhatArtifactResolver(hre), futureId);
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
    console.log(`${futureId} state has been cleared`);
}));
ignitionScope
    .task("verify")
    .addFlag("includeUnrelatedContracts", "Include all compiled contracts in the verification")
    .addPositionalParam("deploymentId", "The id of the deployment to verify")
    .setDescription("Verify contracts from a deployment against the configured block explorers")
    .setAction(({ deploymentId, includeUnrelatedContracts = false, }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    var _g, e_1, _h, _j;
    const { getVerificationInformation } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    if (hre.config.etherscan === undefined ||
        hre.config.etherscan.apiKey === undefined ||
        hre.config.etherscan.apiKey === "") {
        throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "No etherscan API key configured");
    }
    try {
        try {
            for (var _k = true, _l = __asyncValues(getVerificationInformation(deploymentDir, hre.config.etherscan.customChains, includeUnrelatedContracts)), _m; _m = yield _l.next(), _g = _m.done, !_g;) {
                _j = _m.value;
                _k = false;
                try {
                    const [chainConfig, contractInfo,] = _j;
                    if (chainConfig === null) {
                        console.log(`Could not resolve contract artifacts for contract "${contractInfo}". Skipping verification.`);
                        console.log("");
                        continue;
                    }
                    const apiKeyAndUrls = (0, getApiKeyAndUrls_1.getApiKeyAndUrls)(hre.config.etherscan.apiKey, chainConfig);
                    const instance = new etherscan_1.Etherscan(...apiKeyAndUrls);
                    console.log(`Verifying contract "${contractInfo.name}" for network ${chainConfig.network}...`);
                    const result = yield (0, verifyEtherscanContract_1.verifyEtherscanContract)(instance, contractInfo);
                    if (result.type === "success") {
                        console.log(`Successfully verified contract "${contractInfo.name}" for network ${chainConfig.network}:\n  - ${result.contractURL}`);
                        console.log("");
                    }
                    else {
                        if (/already verified/gi.test(result.reason.message)) {
                            const contractURL = instance.getContractUrl(contractInfo.address);
                            console.log(`Contract ${contractInfo.name} already verified on network ${chainConfig.network}:\n  - ${contractURL}`);
                            console.log("");
                            continue;
                        }
                        else {
                            if (!includeUnrelatedContracts) {
                                throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", `Verification failed. Please run \`hardhat ignition verify ${deploymentId} --include-unrelated-contracts\` to attempt verifying all contracts.`);
                            }
                            else {
                                throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", result.reason.message);
                            }
                        }
                    }
                }
                finally {
                    _k = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_k && !_g && (_h = _l.return)) yield _h.call(_l);
            }
            finally { if (e_1) throw e_1.error; }
        }
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
}));
ignitionScope
    .task("transactions")
    .addPositionalParam("deploymentId", "The id of the deployment to show transactions for")
    .setDescription("Show all transactions for a given deployment")
    .setAction(({ deploymentId }, hre) => __awaiter(void 0, void 0, void 0, function* () {
    var _o, _p;
    const { listTransactions } = yield Promise.resolve().then(() => __importStar(require("@nomicfoundation/ignition-core")));
    const { HardhatArtifactResolver } = yield Promise.resolve().then(() => __importStar(require("./hardhat-artifact-resolver")));
    const { calculateListTransactionsDisplay } = yield Promise.resolve().then(() => __importStar(require("./ui/helpers/calculate-list-transactions-display")));
    const deploymentDir = path_1.default.join(hre.config.paths.ignition, "deployments", deploymentId);
    const artifactResolver = new HardhatArtifactResolver(hre);
    let listTransactionsResult;
    try {
        listTransactionsResult = yield listTransactions(deploymentDir, artifactResolver);
    }
    catch (e) {
        if (e instanceof ignition_core_1.IgnitionError && (0, shouldBeHardhatPluginError_1.shouldBeHardhatPluginError)(e)) {
            throw new plugins_1.NomicLabsHardhatPluginError("hardhat-ignition", e.message, e);
        }
        throw e;
    }
    console.log(calculateListTransactionsDisplay(deploymentId, listTransactionsResult, (_p = (_o = hre.config.networks[hre.network.name]) === null || _o === void 0 ? void 0 : _o.ignition) === null || _p === void 0 ? void 0 : _p.explorerUrl));
}));
function resolveParametersFromModuleName(moduleName, ignitionPath) {
    return __awaiter(this, void 0, void 0, function* () {
        const files = (0, fs_extra_1.readdirSync)(ignitionPath);
        const configFilename = `${moduleName}.config.json`;
        return files.includes(configFilename)
            ? (0, read_deployment_parameters_1.readDeploymentParameters)(path_1.default.resolve(ignitionPath, configFilename))
            : undefined;
    });
}
function resolveParametersFromFileName(fileName) {
    return __awaiter(this, void 0, void 0, function* () {
        const filepath = path_1.default.resolve(process.cwd(), fileName);
        return (0, read_deployment_parameters_1.readDeploymentParameters)(filepath);
    });
}
function resolveParametersString(paramString) {
    try {
        return (0, json5_1.parse)(paramString, bigintReviver_1.bigintReviver);
    }
    catch (e) {
        if (e instanceof plugins_1.NomicLabsHardhatPluginError) {
            throw e;
        }
        if (e instanceof Error) {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomicfoundation/hardhat-ignition", "Could not parse JSON parameters", e);
        }
        throw e;
    }
}
