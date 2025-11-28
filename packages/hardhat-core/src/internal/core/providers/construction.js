"use strict";
var __createBinding =
  (this && this.__createBinding) ||
  (Object.create
    ? function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        var desc = Object.getOwnPropertyDescriptor(m, k);
        if (
          !desc ||
          ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)
        ) {
          desc = {
            enumerable: true,
            get: function () {
              return m[k];
            },
          };
        }
        Object.defineProperty(o, k2, desc);
      }
    : function (o, m, k, k2) {
        if (k2 === undefined) k2 = k;
        o[k2] = m[k];
      });
var __setModuleDefault =
  (this && this.__setModuleDefault) ||
  (Object.create
    ? function (o, v) {
        Object.defineProperty(o, "default", { enumerable: true, value: v });
      }
    : function (o, v) {
        o["default"] = v;
      });
var __importStar =
  (this && this.__importStar) ||
  function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null)
      for (var k in mod)
        if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k))
          __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
  };
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.applyProviderWrappers =
  exports.createProvider =
  exports.isHDAccountsConfig =
    void 0;
const constants_1 = require("../../constants");
const date_1 = require("../../util/date");
const util_1 = require("./util");
function isHDAccountsConfig(accounts) {
  return accounts !== undefined && Object.keys(accounts).includes("mnemonic");
}
exports.isHDAccountsConfig = isHDAccountsConfig;
function isResolvedHttpNetworkConfig(netConfig) {
  return "url" in netConfig;
}
// This function is let's you import a provider dynamically in a pretty
// type-safe way.
// `ProviderNameT` and `name` must be the same literal string. TS enforces it.
// `ModuleT` and `filePath` must also be the same, but this is not enforced.
function importProvider(filePath, name) {
  const mod = require(filePath);
  return mod[name];
}
function createProvider(config, networkName, artifacts, extenders = []) {
  var _a, _b, _c, _d, _e, _f, _g;
  return __awaiter(this, void 0, void 0, function* () {
    let eip1193Provider;
    const networkConfig = config.networks[networkName];
    const paths = config.paths;
    if (networkName === constants_1.HARDHAT_NETWORK_NAME) {
      const hardhatNetConfig = networkConfig;
      const { createHardhatNetworkProvider } = yield Promise.resolve().then(
        () => __importStar(require("../../hardhat-network/provider/provider"))
      );
      let forkConfig;
      if (
        ((_a = hardhatNetConfig.forking) === null || _a === void 0
          ? void 0
          : _a.enabled) === true &&
        ((_b = hardhatNetConfig.forking) === null || _b === void 0
          ? void 0
          : _b.url) !== undefined
      ) {
        forkConfig = {
          jsonRpcUrl:
            (_c = hardhatNetConfig.forking) === null || _c === void 0
              ? void 0
              : _c.url,
          blockNumber:
            (_d = hardhatNetConfig.forking) === null || _d === void 0
              ? void 0
              : _d.blockNumber,
          httpHeaders: hardhatNetConfig.forking.httpHeaders,
        };
      }
      const accounts = (0, util_1.normalizeHardhatNetworkAccountsConfig)(
        hardhatNetConfig.accounts
      );
      const {
        getForkCacheDirPath,
      } = require("../../hardhat-network/provider/utils/disk-cache");
      eip1193Provider = yield createHardhatNetworkProvider(
        {
          chainId: hardhatNetConfig.chainId,
          networkId: hardhatNetConfig.chainId,
          hardfork: hardhatNetConfig.hardfork,
          blockGasLimit: hardhatNetConfig.blockGasLimit,
          initialBaseFeePerGas: hardhatNetConfig.initialBaseFeePerGas,
          minGasPrice: hardhatNetConfig.minGasPrice,
          throwOnTransactionFailures:
            hardhatNetConfig.throwOnTransactionFailures,
          throwOnCallFailures: hardhatNetConfig.throwOnCallFailures,
          automine: hardhatNetConfig.mining.auto,
          intervalMining: hardhatNetConfig.mining.interval,
          // This cast is valid because of the config validation and resolution
          mempoolOrder: hardhatNetConfig.mining.mempool.order,
          chains: hardhatNetConfig.chains,
          coinbase: hardhatNetConfig.coinbase,
          genesisAccounts: accounts,
          allowUnlimitedContractSize:
            hardhatNetConfig.allowUnlimitedContractSize,
          allowBlocksWithSameTimestamp:
            (_e = hardhatNetConfig.allowBlocksWithSameTimestamp) !== null &&
            _e !== void 0
              ? _e
              : false,
          initialDate:
            hardhatNetConfig.initialDate !== undefined
              ? (0, date_1.parseDateString)(hardhatNetConfig.initialDate)
              : undefined,
          forkConfig,
          forkCachePath:
            paths !== undefined ? getForkCacheDirPath(paths) : undefined,
          enableTransientStorage:
            (_f = hardhatNetConfig.enableTransientStorage) !== null &&
            _f !== void 0
              ? _f
              : false,
          enableRip7212:
            (_g = hardhatNetConfig.enableRip7212) !== null && _g !== void 0
              ? _g
              : false,
        },
        {
          enabled: hardhatNetConfig.loggingEnabled,
        },
        artifacts
      );
    } else {
      const HttpProvider = importProvider("./http", "HttpProvider");
      const httpNetConfig = networkConfig;
      eip1193Provider = new HttpProvider(
        httpNetConfig.url,
        networkName,
        httpNetConfig.httpHeaders,
        httpNetConfig.timeout
      );
    }
    let wrappedProvider = eip1193Provider;
    for (const extender of extenders) {
      wrappedProvider = yield extender(wrappedProvider, config, networkName);
    }
    wrappedProvider = applyProviderWrappers(
      wrappedProvider,
      networkConfig,
      extenders
    );
    const BackwardsCompatibilityProviderAdapter = importProvider(
      "./backwards-compatibility",
      "BackwardsCompatibilityProviderAdapter"
    );
    return new BackwardsCompatibilityProviderAdapter(wrappedProvider);
  });
}
exports.createProvider = createProvider;
function applyProviderWrappers(provider, netConfig, extenders) {
  // These dependencies are lazy-loaded because they are really big.
  const LocalAccountsProvider = importProvider(
    "./accounts",
    "LocalAccountsProvider"
  );
  const HDWalletProvider = importProvider("./accounts", "HDWalletProvider");
  const FixedSenderProvider = importProvider(
    "./accounts",
    "FixedSenderProvider"
  );
  const AutomaticSenderProvider = importProvider(
    "./accounts",
    "AutomaticSenderProvider"
  );
  const AutomaticGasProvider = importProvider(
    "./gas-providers",
    "AutomaticGasProvider"
  );
  const FixedGasProvider = importProvider(
    "./gas-providers",
    "FixedGasProvider"
  );
  const AutomaticGasPriceProvider = importProvider(
    "./gas-providers",
    "AutomaticGasPriceProvider"
  );
  const FixedGasPriceProvider = importProvider(
    "./gas-providers",
    "FixedGasPriceProvider"
  );
  const ChainIdValidatorProvider = importProvider(
    "./chainId",
    "ChainIdValidatorProvider"
  );
  if (isResolvedHttpNetworkConfig(netConfig)) {
    const accounts = netConfig.accounts;
    if (Array.isArray(accounts)) {
      provider = new LocalAccountsProvider(provider, accounts);
    } else if (isHDAccountsConfig(accounts)) {
      provider = new HDWalletProvider(
        provider,
        accounts.mnemonic,
        accounts.path,
        accounts.initialIndex,
        accounts.count,
        accounts.passphrase
      );
    }
    // TODO: Add some extension mechanism for account plugins here
  }
  if (netConfig.from !== undefined) {
    provider = new FixedSenderProvider(provider, netConfig.from);
  } else {
    provider = new AutomaticSenderProvider(provider);
  }
  if (netConfig.gas === undefined || netConfig.gas === "auto") {
    provider = new AutomaticGasProvider(provider, netConfig.gasMultiplier);
  } else {
    provider = new FixedGasProvider(provider, netConfig.gas);
  }
  if (netConfig.gasPrice === undefined || netConfig.gasPrice === "auto") {
    // If you use a LocalAccountsProvider or HDWalletProvider, your transactions
    // are signed locally. This requires having all of their fields available,
    // including the gasPrice / maxFeePerGas & maxPriorityFeePerGas.
    //
    // We never use those providers when using Hardhat Network, but sign within
    // Hardhat Network itself. This means that we don't need to provide all the
    // fields, as the missing ones will be resolved there.
    //
    // Hardhat Network handles this in a more performant way, so we don't use
    // the AutomaticGasPriceProvider for it unless there are provider extenders.
    // The reason for this is that some extenders (like hardhat-ledger's) might
    // do the signing themselves, and that needs the gas price to be set.
    if (isResolvedHttpNetworkConfig(netConfig) || extenders.length > 0) {
      provider = new AutomaticGasPriceProvider(provider);
    }
  } else {
    provider = new FixedGasPriceProvider(provider, netConfig.gasPrice);
  }
  if (
    isResolvedHttpNetworkConfig(netConfig) &&
    netConfig.chainId !== undefined
  ) {
    provider = new ChainIdValidatorProvider(provider, netConfig.chainId);
  }
  return provider;
}
exports.applyProviderWrappers = applyProviderWrappers;
