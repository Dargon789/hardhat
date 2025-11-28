"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.resolveProjectPaths = exports.resolveConfig = void 0;
const path_1 = __importDefault(require("path"));
const semver_1 = __importDefault(require("semver"));
const constants_1 = require("../../constants");
const lang_1 = require("../../util/lang");
const errors_1 = require("../errors");
const fs_utils_1 = require("../../util/fs-utils");
const default_config_1 = require("./default-config");
/**
 * This functions resolves the hardhat config, setting its defaults and
 * normalizing its types if necessary.
 *
 * @param userConfigPath the user config filepath
 * @param userConfig     the user config object
 *
 * @returns the resolved config
 */
function resolveConfig(userConfigPath, userConfig) {
  var _a;
  const cloneDeep = require("lodash/cloneDeep");
  userConfig = cloneDeep(userConfig);
  return Object.assign(Object.assign({}, userConfig), {
    defaultNetwork:
      (_a = userConfig.defaultNetwork) !== null && _a !== void 0
        ? _a
        : default_config_1.defaultDefaultNetwork,
    paths: resolveProjectPaths(userConfigPath, userConfig.paths),
    networks: resolveNetworksConfig(userConfig.networks),
    solidity: resolveSolidityConfig(userConfig),
    mocha: resolveMochaConfig(userConfig),
  });
}
exports.resolveConfig = resolveConfig;
function resolveNetworksConfig(networksConfig = {}) {
  var _a;
  const cloneDeep = require("lodash/cloneDeep");
  const hardhatNetworkConfig = networksConfig[constants_1.HARDHAT_NETWORK_NAME];
  const localhostNetworkConfig =
    (_a = networksConfig.localhost) !== null && _a !== void 0 ? _a : undefined;
  const hardhat = resolveHardhatNetworkConfig(hardhatNetworkConfig);
  const localhost = resolveHttpNetworkConfig(
    Object.assign(
      Object.assign(
        {},
        cloneDeep(default_config_1.defaultLocalhostNetworkParams)
      ),
      localhostNetworkConfig
    )
  );
  const otherNetworks = (0, lang_1.fromEntries)(
    Object.entries(networksConfig)
      .filter(
        ([name, config]) =>
          name !== "localhost" &&
          name !== "hardhat" &&
          config !== undefined &&
          isHttpNetworkConfig(config)
      )
      .map(([name, config]) => [name, resolveHttpNetworkConfig(config)])
  );
  return Object.assign({ hardhat, localhost }, otherNetworks);
}
function isHttpNetworkConfig(config) {
  return "url" in config;
}
function normalizeHexString(str) {
  const normalized = str.trim().toLowerCase();
  if (normalized.startsWith("0x")) {
    return normalized;
  }
  return `0x${normalized}`;
}
function resolveHardhatNetworkConfig(hardhatNetworkConfig = {}) {
  var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
  const cloneDeep = require("lodash/cloneDeep");
  const clonedDefaultHardhatNetworkParams = cloneDeep(
    default_config_1.defaultHardhatNetworkParams
  );
  const accounts =
    hardhatNetworkConfig.accounts === undefined
      ? default_config_1.defaultHardhatNetworkHdAccountsConfigParams
      : Array.isArray(hardhatNetworkConfig.accounts)
      ? hardhatNetworkConfig.accounts.map(({ privateKey, balance }) => ({
          privateKey: normalizeHexString(privateKey),
          balance,
        }))
      : Object.assign(
          Object.assign(
            {},
            default_config_1.defaultHardhatNetworkHdAccountsConfigParams
          ),
          hardhatNetworkConfig.accounts
        );
  const forking =
    hardhatNetworkConfig.forking !== undefined
      ? {
          url: hardhatNetworkConfig.forking.url,
          enabled:
            (_a = hardhatNetworkConfig.forking.enabled) !== null &&
            _a !== void 0
              ? _a
              : true,
          httpHeaders: {},
        }
      : undefined;
  if (forking !== undefined) {
    const blockNumber =
      (_b =
        hardhatNetworkConfig === null || hardhatNetworkConfig === void 0
          ? void 0
          : hardhatNetworkConfig.forking) === null || _b === void 0
        ? void 0
        : _b.blockNumber;
    if (blockNumber !== undefined) {
      forking.blockNumber =
        (_c =
          hardhatNetworkConfig === null || hardhatNetworkConfig === void 0
            ? void 0
            : hardhatNetworkConfig.forking) === null || _c === void 0
          ? void 0
          : _c.blockNumber;
    }
    const httpHeaders =
      (_d = hardhatNetworkConfig.forking) === null || _d === void 0
        ? void 0
        : _d.httpHeaders;
    if (httpHeaders !== undefined) {
      forking.httpHeaders = httpHeaders;
    }
  }
  const mining = resolveMiningConfig(hardhatNetworkConfig.mining);
  const minGasPrice = BigInt(
    (_e = hardhatNetworkConfig.minGasPrice) !== null && _e !== void 0
      ? _e
      : clonedDefaultHardhatNetworkParams.minGasPrice
  );
  const blockGasLimit =
    (_f = hardhatNetworkConfig.blockGasLimit) !== null && _f !== void 0
      ? _f
      : clonedDefaultHardhatNetworkParams.blockGasLimit;
  const gas =
    (_g = hardhatNetworkConfig.gas) !== null && _g !== void 0
      ? _g
      : blockGasLimit;
  const gasPrice =
    (_h = hardhatNetworkConfig.gasPrice) !== null && _h !== void 0
      ? _h
      : clonedDefaultHardhatNetworkParams.gasPrice;
  const initialBaseFeePerGas =
    (_j = hardhatNetworkConfig.initialBaseFeePerGas) !== null && _j !== void 0
      ? _j
      : clonedDefaultHardhatNetworkParams.initialBaseFeePerGas;
  const initialDate =
    (_k = hardhatNetworkConfig.initialDate) !== null && _k !== void 0
      ? _k
      : new Date().toISOString();
  const chains = new Map(default_config_1.defaultHardhatNetworkParams.chains);
  if (hardhatNetworkConfig.chains !== undefined) {
    for (const [chainId, userChainConfig] of Object.entries(
      hardhatNetworkConfig.chains
    )) {
      const chainConfig = {
        hardforkHistory: new Map(),
      };
      if (userChainConfig.hardforkHistory !== undefined) {
        for (const [name, block] of Object.entries(
          userChainConfig.hardforkHistory
        )) {
          chainConfig.hardforkHistory.set(name, block);
        }
      }
      chains.set(parseInt(chainId, 10), chainConfig);
    }
  }
  const config = Object.assign(
    Object.assign(
      Object.assign({}, clonedDefaultHardhatNetworkParams),
      hardhatNetworkConfig
    ),
    {
      accounts,
      forking,
      mining,
      blockGasLimit,
      gas,
      gasPrice,
      initialBaseFeePerGas,
      initialDate,
      minGasPrice,
      chains,
    }
  );
  // We do it this way because ts gets lost otherwise
  if (config.forking === undefined) {
    delete config.forking;
  }
  if (config.initialBaseFeePerGas === undefined) {
    delete config.initialBaseFeePerGas;
  }
  if (
    hardhatNetworkConfig.enableTransientStorage === true &&
    hardhatNetworkConfig.hardfork === undefined
  ) {
    config.hardfork = "cancun";
  }
  if (
    hardhatNetworkConfig.enableTransientStorage === false &&
    hardhatNetworkConfig.hardfork === undefined
  ) {
    config.hardfork = "shanghai";
  }
  return config;
}
function isHdAccountsConfig(accounts) {
  return typeof accounts === "object" && !Array.isArray(accounts);
}
function resolveHttpNetworkConfig(networkConfig) {
  var _a, _b;
  const cloneDeep = require("lodash/cloneDeep");
  const accounts =
    networkConfig.accounts === undefined
      ? default_config_1.defaultHttpNetworkParams.accounts
      : isHdAccountsConfig(networkConfig.accounts)
      ? Object.assign(
          Object.assign({}, default_config_1.defaultHdAccountsConfigParams),
          networkConfig.accounts
        )
      : Array.isArray(networkConfig.accounts)
      ? networkConfig.accounts.map(normalizeHexString)
      : "remote";
  const url = networkConfig.url;
  (0, errors_1.assertHardhatInvariant)(
    url !== undefined,
    "Invalid http network config provided. URL missing."
  );
  return Object.assign(
    Object.assign(
      Object.assign({}, cloneDeep(default_config_1.defaultHttpNetworkParams)),
      networkConfig
    ),
    {
      accounts,
      url,
      gas:
        (_a = networkConfig.gas) !== null && _a !== void 0
          ? _a
          : default_config_1.defaultHttpNetworkParams.gas,
      gasPrice:
        (_b = networkConfig.gasPrice) !== null && _b !== void 0
          ? _b
          : default_config_1.defaultHttpNetworkParams.gasPrice,
    }
  );
}
function resolveMiningConfig(userConfig) {
  const mempool = resolveMempoolConfig(
    userConfig === null || userConfig === void 0 ? void 0 : userConfig.mempool
  );
  if (userConfig === undefined) {
    return {
      auto: true,
      interval: 0,
      mempool,
    };
  }
  const { auto, interval } = userConfig;
  if (auto === undefined && interval === undefined) {
    return {
      auto: true,
      interval: 0,
      mempool,
    };
  }
  if (auto === undefined && interval !== undefined) {
    return {
      auto: false,
      interval,
      mempool,
    };
  }
  if (auto !== undefined && interval === undefined) {
    return {
      auto,
      interval: 0,
      mempool,
    };
  }
  // ts can't infer it, but both values are defined here
  return {
    auto: auto,
    interval: interval,
    mempool,
  };
}
function resolveMempoolConfig(userConfig) {
  if (userConfig === undefined) {
    return {
      order: "priority",
    };
  }
  if (userConfig.order === undefined) {
    return {
      order: "priority",
    };
  }
  return {
    order: userConfig.order,
  };
}
function resolveSolidityConfig(userConfig) {
  var _a, _b;
  const userSolidityConfig =
    (_a = userConfig.solidity) !== null && _a !== void 0
      ? _a
      : default_config_1.DEFAULT_SOLC_VERSION;
  const multiSolcConfig = normalizeSolidityConfig(userSolidityConfig);
  const overrides =
    (_b = multiSolcConfig.overrides) !== null && _b !== void 0 ? _b : {};
  return {
    compilers: multiSolcConfig.compilers.map(resolveCompiler),
    overrides: (0, lang_1.fromEntries)(
      Object.entries(overrides).map(([name, config]) => [
        name,
        resolveCompiler(config),
      ])
    ),
  };
}
function normalizeSolidityConfig(solidityConfig) {
  if (typeof solidityConfig === "string") {
    return {
      compilers: [
        {
          version: solidityConfig,
        },
      ],
    };
  }
  if ("version" in solidityConfig) {
    return { compilers: [solidityConfig] };
  }
  return solidityConfig;
}
function resolveCompiler(compiler) {
  var _a, _b, _c;
  const resolved = {
    version: compiler.version,
    settings: (_a = compiler.settings) !== null && _a !== void 0 ? _a : {},
  };
  if (semver_1.default.gte(resolved.version, "0.8.20")) {
    resolved.settings.evmVersion =
      (_c =
        (_b = compiler.settings) === null || _b === void 0
          ? void 0
          : _b.evmVersion) !== null && _c !== void 0
        ? _c
        : "paris";
  }
  resolved.settings.optimizer = Object.assign(
    { enabled: false, runs: 200 },
    resolved.settings.optimizer
  );
  if (resolved.settings.outputSelection === undefined) {
    resolved.settings.outputSelection = {};
  }
  for (const [file, contractSelection] of Object.entries(
    default_config_1.defaultSolcOutputSelection
  )) {
    if (resolved.settings.outputSelection[file] === undefined) {
      resolved.settings.outputSelection[file] = {};
    }
    for (const [contract, outputs] of Object.entries(contractSelection)) {
      if (resolved.settings.outputSelection[file][contract] === undefined) {
        resolved.settings.outputSelection[file][contract] = [];
      }
      for (const output of outputs) {
        const includesOutput =
          resolved.settings.outputSelection[file][contract].includes(output);
        if (!includesOutput) {
          resolved.settings.outputSelection[file][contract].push(output);
        }
      }
    }
  }
  return resolved;
}
function resolveMochaConfig(userConfig) {
  const cloneDeep = require("lodash/cloneDeep");
  return Object.assign(
    Object.assign({}, cloneDeep(default_config_1.defaultMochaOptions)),
    userConfig.mocha
  );
}
/**
 * This function resolves the ProjectPathsConfig object from the user-provided config
 * and its path. The logic of this is not obvious and should well be document.
 * The good thing is that most users will never use this.
 *
 * Explanation:
 *    - paths.configFile is not overridable
 *    - If a path is absolute it is used "as is".
 *    - If the root path is relative, it's resolved from paths.configFile's dir.
 *    - If any other path is relative, it's resolved from paths.root.
 *    - Plugin-defined paths are not resolved, but encouraged to follow the same pattern.
 */
function resolveProjectPaths(userConfigPath, userPaths = {}) {
  const configFile = (0, fs_utils_1.getRealPathSync)(userConfigPath);
  const configDir = path_1.default.dirname(configFile);
  const root = resolvePathFrom(configDir, "", userPaths.root);
  return Object.assign(Object.assign({}, userPaths), {
    root,
    configFile,
    sources: resolvePathFrom(root, "contracts", userPaths.sources),
    cache: resolvePathFrom(root, "cache", userPaths.cache),
    artifacts: resolvePathFrom(root, "artifacts", userPaths.artifacts),
    tests: resolvePathFrom(root, "test", userPaths.tests),
  });
}
exports.resolveProjectPaths = resolveProjectPaths;
function resolvePathFrom(
  from,
  defaultPath,
  relativeOrAbsolutePath = defaultPath
) {
  if (path_1.default.isAbsolute(relativeOrAbsolutePath)) {
    return relativeOrAbsolutePath;
  }
  return path_1.default.join(from, relativeOrAbsolutePath);
}
