"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// These are type-checking tests that pass if this file can be compiled.
// They are mainly here to fail if we add a new mandatory field in the config.
function hardhatConfig() {
  return {
    defaultNetwork: "",
    paths: projectPathsConfig(),
    networks: networksConfig(),
    solidity: solidityConfig(),
    mocha: {},
  };
}
function projectPathsConfig() {
  return {
    root: "",
    configFile: "",
    cache: "",
    artifacts: "",
    sources: "",
    tests: "",
  };
}
function networksConfig() {
  return {
    hardhat: hardhatNetworkConfig(),
    localhost: httpNetworkConfig(),
    customNetwork: networkConfig(),
  };
}
function solidityConfig() {
  return {
    compilers: [solcConfig()],
    overrides: {
      "0.1.2": solcConfig(),
    },
  };
}
function solcConfig() {
  return {
    version: "1.2.3",
    settings: {},
  };
}
function networkConfig() {
  return hardhatNetworkConfig();
  return httpNetworkConfig();
}
function hardhatNetworkConfig() {
  const base = {
    chainId: 0,
    gasMultiplier: 0,
    hardfork: "",
    mining: hardhatNetworkMiningConfig(),
    accounts: hardhatNetworkAccountsConfig(),
    blockGasLimit: 0,
    minGasPrice: 0n,
    throwOnTransactionFailures: true,
    throwOnCallFailures: true,
    allowUnlimitedContractSize: true,
    initialDate: "",
    loggingEnabled: true,
    chains: hardhatNetworkChainsConfig(),
  };
  return Object.assign(Object.assign({}, base), {
    gas: "auto",
    gasPrice: "auto",
  });
  return Object.assign(Object.assign({}, base), { gas: 0, gasPrice: "auto" });
  return Object.assign(Object.assign({}, base), { gas: "auto", gasPrice: 0 });
  return Object.assign(Object.assign({}, base), { gas: 0, gasPrice: 0 });
}
function hardhatNetworkMiningConfig() {
  return {
    auto: true,
    interval: 0,
    mempool: hardhatNetworkMempoolConfig(),
  };
  return {
    auto: true,
    interval: [0, 1],
    mempool: hardhatNetworkMempoolConfig(),
  };
}
function hardhatNetworkMempoolConfig() {
  return {
    order: "",
  };
}
function hardhatNetworkAccountsConfig() {
  return hardhatNetworkHDAccountsConfig();
  return [hardhatNetworkAccountConfig()];
}
function hardhatNetworkHDAccountsConfig() {
  return {
    mnemonic: "",
    initialIndex: 0,
    count: 0,
    path: "",
    accountsBalance: "",
    passphrase: "",
  };
}
function hardhatNetworkAccountConfig() {
  return {
    privateKey: "",
    balance: "",
  };
}
function hardhatNetworkChainsConfig() {
  const map = new Map();
  map.set(0, hardhatNetworkChainConfig());
  return map;
}
function hardhatNetworkChainConfig() {
  return {
    hardforkHistory: hardforkHistoryConfig(),
  };
}
function hardforkHistoryConfig() {
  const map = new Map();
  map.set("", 0);
  return map;
}
function httpNetworkConfig() {
  const base = {
    gasMultiplier: 0,
    url: "",
    timeout: 0,
    httpHeaders: {
      foo: "bar",
    },
    accounts: httpNetworkAccountsConfig(),
  };
  return Object.assign(Object.assign({}, base), {
    gas: "auto",
    gasPrice: "auto",
  });
  return Object.assign(Object.assign({}, base), { gas: 0, gasPrice: "auto" });
  return Object.assign(Object.assign({}, base), { gas: "auto", gasPrice: 0 });
  return Object.assign(Object.assign({}, base), { gas: 0, gasPrice: 0 });
}
function httpNetworkAccountsConfig() {
  return "remote";
  return ["", ""];
  return httpNetworkHDAccountsConfig();
}
function httpNetworkHDAccountsConfig() {
  return {
    mnemonic: "",
    initialIndex: 0,
    count: 0,
    path: "",
    passphrase: "",
  };
}
function hardhatNetworkForkingConfig() {
  return {
    enabled: true,
    url: "",
  };
}
function hardhatNetworkForkingUserConfig() {
  return {
    url: "",
  };
}
function hardhatUserConfig() {
  return {};
}
function solidityUserConfig() {
  return "1.2.3";
  return solcUserConfig();
  return multiSolcUserConfig();
}
function solcUserConfig() {
  return {
    version: "1.2.3",
  };
}
function multiSolcUserConfig() {
  return {
    compilers: [solcUserConfig(), solcUserConfig()],
  };
}
function networksUserConfig() {
  return {};
}
function networkUserConfig() {
  return {};
}
function hardforkHistoryUserConfig() {
  return {};
}
function hardhatNetworkChainUserConfig() {
  return {};
}
function hardhatNetworkChainsUserConfig() {
  return {};
}
function hardhatNetworkUserConfig() {
  return {};
}
function hardhatNetworkAccountsUserConfig() {
  return {};
}
function hardhatNetworkAccountUserConfig() {
  return {
    privateKey: "",
    balance: "",
  };
}
function hardhatNetworkHDAccountsUserConfig() {
  return {};
}
function hDAccountsUserConfig() {
  return {
    mnemonic: "",
  };
}
function httpNetworkAccountsUserConfig() {
  return "remote";
  return ["", ""];
  return hDAccountsUserConfig();
}
function httpNetworkUserConfig() {
  return {};
}
function hardhatNetworkMiningUserConfig() {
  return {};
}
function hardhatNetworkMempoolUserConfig() {
  return {};
}
function projectPathsUserConfig() {
  return {};
}
function configExtender() {
  return (config, userConfig) => {};
}
