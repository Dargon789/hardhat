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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const picocolors_1 = __importDefault(require("picocolors"));
const config_1 = require("hardhat/config");
const contract_names_1 = require("hardhat/utils/contract-names");
const plugins_1 = require("hardhat/plugins");
const sourcify_1 = require("../sourcify");
const errors_1 = require("../errors");
const task_names_1 = require("../task-names");
const utilities_1 = require("../utilities");
const bytecode_1 = require("../solc/bytecode");
/**
 * Main Sourcify verification subtask.
 *
 * Verifies a contract in Sourcify by coordinating various subtasks related
 * to contract verification.
 */
(0, config_1.subtask)(task_names_1.TASK_VERIFY_SOURCIFY)
    .addParam("address")
    .addOptionalParam("contract")
    .addOptionalParam("libraries", undefined, undefined, config_1.types.any)
    .setAction((taskArgs, { config, network, run }) => __awaiter(void 0, void 0, void 0, function* () {
    const { address, libraries, contractFQN } = yield run(task_names_1.TASK_VERIFY_SOURCIFY_RESOLVE_ARGUMENTS, taskArgs);
    if (network.name === plugins_1.HARDHAT_NETWORK_NAME) {
        throw new errors_1.HardhatNetworkNotSupportedError();
    }
    const currentChainId = parseInt(yield network.provider.send("eth_chainId"), 16);
    const { apiUrl, browserUrl } = config.sourcify;
    if (apiUrl === undefined) {
        throw new errors_1.HardhatVerifyError("Sourcify `apiUrl` is not defined");
    }
    if (browserUrl === undefined) {
        throw new errors_1.HardhatVerifyError("Sourcify `browserUrl` is not defined");
    }
    const sourcify = new sourcify_1.Sourcify(currentChainId, apiUrl, browserUrl);
    const status = yield sourcify.isVerified(address);
    if (status !== false) {
        const contractURL = sourcify.getContractUrl(address, status);
        console.log(`The contract ${address} has already been verified on Sourcify.
${contractURL}
`);
        return;
    }
    const configCompilerVersions = yield (0, utilities_1.getCompilerVersions)(config.solidity);
    const deployedBytecode = yield bytecode_1.Bytecode.getDeployedContractBytecode(address, network.provider, network.name);
    const matchingCompilerVersions = yield deployedBytecode.getMatchingVersions(configCompilerVersions);
    // don't error if the bytecode appears to be OVM bytecode, because we can't infer a specific OVM solc version from the bytecode
    if (matchingCompilerVersions.length === 0 && !deployedBytecode.isOvm()) {
        throw new errors_1.CompilerVersionsMismatchError(configCompilerVersions, deployedBytecode.getVersion(), network.name);
    }
    const contractInformation = yield run(task_names_1.TASK_VERIFY_GET_CONTRACT_INFORMATION, {
        contractFQN,
        deployedBytecode,
        matchingCompilerVersions,
        libraries,
    });
    const { success: verificationSuccess, message: verificationMessage, } = yield run(task_names_1.TASK_VERIFY_SOURCIFY_ATTEMPT_VERIFICATION, {
        address,
        verificationInterface: sourcify,
        contractInformation,
    });
    if (verificationSuccess) {
        return;
    }
    throw new errors_1.ContractVerificationFailedError(verificationMessage, contractInformation.undetectableLibraries);
}));
(0, config_1.subtask)(task_names_1.TASK_VERIFY_SOURCIFY_RESOLVE_ARGUMENTS)
    .addOptionalParam("address")
    .addOptionalParam("contract")
    .addOptionalParam("libraries", undefined, undefined, config_1.types.any)
    .setAction(({ address, contract, libraries: librariesModule, }) => __awaiter(void 0, void 0, void 0, function* () {
    if (address === undefined) {
        throw new errors_1.MissingAddressError();
    }
    const { isAddress } = yield Promise.resolve().then(() => __importStar(require("@ethersproject/address")));
    if (!isAddress(address)) {
        throw new errors_1.InvalidAddressError(address);
    }
    if (contract !== undefined && !(0, contract_names_1.isFullyQualifiedName)(contract)) {
        throw new errors_1.InvalidContractNameError(contract);
    }
    let libraries;
    if (typeof librariesModule === "object") {
        libraries = librariesModule;
    }
    else {
        libraries = yield (0, utilities_1.resolveLibraries)(librariesModule);
    }
    return {
        address,
        libraries,
        contractFQN: contract,
    };
}));
(0, config_1.subtask)(task_names_1.TASK_VERIFY_SOURCIFY_ATTEMPT_VERIFICATION)
    .addParam("address")
    .addParam("contractInformation", undefined, undefined, config_1.types.any)
    .addParam("verificationInterface", undefined, undefined, config_1.types.any)
    .setAction(({ address, verificationInterface, contractInformation, }) => __awaiter(void 0, void 0, void 0, function* () {
    const { sourceName, contractName, contractOutput, compilerInput } = contractInformation;
    const librarySourcesToContent = Object.keys(contractInformation.libraries).reduce((acc, libSourceName) => {
        const libContent = compilerInput.sources[libSourceName].content;
        acc[libSourceName] = libContent;
        return acc;
    }, {});
    const response = yield verificationInterface.verify(address, Object.assign({ "metadata.json": contractOutput.metadata, [sourceName]: compilerInput.sources[sourceName].content }, librarySourcesToContent));
    if (response.isOk()) {
        const contractURL = verificationInterface.getContractUrl(address, response.status);
        console.log(`Successfully verified contract ${contractName} on Sourcify.
${contractURL}
`);
    }
    return {
        success: response.isSuccess(),
        message: "Contract successfully verified on Sourcify",
    };
}));
(0, config_1.subtask)(task_names_1.TASK_VERIFY_SOURCIFY_DISABLED_WARNING, () => __awaiter(void 0, void 0, void 0, function* () {
    console.info(picocolors_1.default.cyan(`[INFO] Sourcify Verification Skipped: Sourcify verification is currently disabled. To enable it, add the following entry to your Hardhat configuration:

sourcify: {
  enabled: true
}

Or set 'enabled' to false to hide this message.

For more information, visit https://hardhat.org/hardhat-runner/plugins/nomicfoundation-hardhat-verify#verifying-on-sourcify`));
}));
