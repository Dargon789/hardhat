"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORKED_PROVIDERS =
  exports.INTERVAL_MINING_PROVIDERS =
  exports.PROVIDERS =
  exports.DEFAULT_ACCOUNTS_BALANCES =
  exports.DEFAULT_ACCOUNTS_ADDRESSES =
  exports.DEFAULT_ACCOUNTS =
  exports.DEFAULT_MINING_CONFIG =
  exports.DEFAULT_MEMPOOL_CONFIG =
  exports.DEFAULT_ALLOW_UNLIMITED_CONTRACT_SIZE =
  exports.DEFAULT_USE_JSON_RPC =
  exports.DEFAULT_BLOCK_GAS_LIMIT =
  exports.DEFAULT_NETWORK_ID =
  exports.DEFAULT_CHAIN_ID =
  exports.DEFAULT_HARDFORK =
    void 0;
const util_1 = require("@ethereumjs/util");
const setup_1 = require("../../../setup");
const useProvider_1 = require("./useProvider");
function toBuffer(x) {
  return Buffer.from((0, util_1.toBytes)(x));
}
exports.DEFAULT_HARDFORK = "shanghai";
exports.DEFAULT_CHAIN_ID = 123;
exports.DEFAULT_NETWORK_ID = 234;
exports.DEFAULT_BLOCK_GAS_LIMIT = 6000000n;
exports.DEFAULT_USE_JSON_RPC = false;
exports.DEFAULT_ALLOW_UNLIMITED_CONTRACT_SIZE = false;
exports.DEFAULT_MEMPOOL_CONFIG = {
  order: "priority",
};
exports.DEFAULT_MINING_CONFIG = {
  auto: true,
  interval: 0,
  mempool: exports.DEFAULT_MEMPOOL_CONFIG,
};
// Assumptions:
// - First account has sent some transactions on mainnet
// - Second and third accounts have a 0 nonce
exports.DEFAULT_ACCOUNTS = [
  {
    privateKey:
      "0xe331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd109",
    balance: 10n ** 21n,
  },
  {
    privateKey:
      "0xe331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd10a",
    balance: 10n ** 21n,
  },
  {
    privateKey:
      "0xe331b6d69882b4cb4ea581d88e0b604039a3de5967688d3dcffdd2270c0fd10b",
    balance: 10n ** 21n,
  },
  {
    privateKey:
      "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    balance: 10n ** 21n,
  },
];
exports.DEFAULT_ACCOUNTS_ADDRESSES = exports.DEFAULT_ACCOUNTS.map((account) =>
  (0, util_1.bytesToHex)(
    (0, util_1.privateToAddress)(toBuffer(account.privateKey))
  ).toLowerCase()
);
exports.DEFAULT_ACCOUNTS_BALANCES = exports.DEFAULT_ACCOUNTS.map(
  (account) => account.balance
);
exports.PROVIDERS = [
  {
    name: "Hardhat Network",
    isFork: false,
    isJsonRpc: false,
    networkId: exports.DEFAULT_NETWORK_ID,
    chainId: exports.DEFAULT_CHAIN_ID,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign({ useJsonRpc: false, loggerEnabled: true }, options)
      );
    },
  },
  {
    name: "JSON-RPC",
    isFork: false,
    isJsonRpc: true,
    networkId: exports.DEFAULT_NETWORK_ID,
    chainId: exports.DEFAULT_CHAIN_ID,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign({ useJsonRpc: true, loggerEnabled: true }, options)
      );
    },
  },
];
exports.INTERVAL_MINING_PROVIDERS = [
  {
    name: "Hardhat Network",
    isFork: false,
    isJsonRpc: false,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: false,
            loggerEnabled: true,
            mining: {
              auto: false,
              interval: 100,
              mempool: exports.DEFAULT_MEMPOOL_CONFIG,
            },
          },
          options
        )
      );
    },
  },
  {
    name: "JSON-RPC",
    isFork: false,
    isJsonRpc: true,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: true,
            loggerEnabled: true,
            mining: {
              auto: false,
              interval: 100,
              mempool: exports.DEFAULT_MEMPOOL_CONFIG,
            },
          },
          options
        )
      );
    },
  },
];
exports.FORKED_PROVIDERS = [];
if (setup_1.ALCHEMY_URL !== undefined) {
  const url = setup_1.ALCHEMY_URL;
  exports.PROVIDERS.push({
    name: "Alchemy Forked",
    isFork: true,
    isJsonRpc: false,
    networkId: exports.DEFAULT_NETWORK_ID,
    chainId: exports.DEFAULT_CHAIN_ID,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: false,
            loggerEnabled: true,
            forkConfig: {
              jsonRpcUrl: url,
              blockNumber: options.forkBlockNumber,
            },
          },
          options
        )
      );
    },
  });
  exports.INTERVAL_MINING_PROVIDERS.push({
    name: "Alchemy Forked",
    isFork: true,
    isJsonRpc: false,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: false,
            loggerEnabled: true,
            forkConfig: {
              jsonRpcUrl: url,
              blockNumber: options.forkBlockNumber,
            },
            mining: {
              auto: false,
              interval: 100,
              mempool: exports.DEFAULT_MEMPOOL_CONFIG,
            },
          },
          options
        )
      );
    },
  });
  exports.FORKED_PROVIDERS.push({
    rpcProvider: "Alchemy",
    jsonRpcUrl: url,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: false,
            loggerEnabled: true,
            forkConfig: {
              jsonRpcUrl: url,
              blockNumber: options.forkBlockNumber,
            },
          },
          options
        )
      );
    },
  });
}
if (setup_1.INFURA_URL !== undefined) {
  const url = setup_1.INFURA_URL;
  exports.FORKED_PROVIDERS.push({
    rpcProvider: "Infura",
    jsonRpcUrl: url,
    useProvider: (options = {}) => {
      (0, useProvider_1.useProvider)(
        Object.assign(
          {
            useJsonRpc: false,
            loggerEnabled: true,
            forkConfig: {
              jsonRpcUrl: url,
              blockNumber: options.forkBlockNumber,
            },
          },
          options
        )
      );
    },
  });
}
