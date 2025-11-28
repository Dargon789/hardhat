"use strict";
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
exports.useProvider = void 0;
const default_config_1 = require("../../../../src/internal/core/config/default-config");
const backwards_compatibility_1 = require("../../../../src/internal/core/providers/backwards-compatibility");
const server_1 = require("../../../../src/internal/hardhat-network/jsonrpc/server");
const provider_1 = require("../../../../src/internal/hardhat-network/provider/provider");
const fakeLogger_1 = require("./fakeLogger");
const providers_1 = require("./providers");
const isEdrProvider_1 = require("./isEdrProvider");
function useProvider({
  useJsonRpc = providers_1.DEFAULT_USE_JSON_RPC,
  loggerEnabled = true,
  forkConfig,
  mining = providers_1.DEFAULT_MINING_CONFIG,
  hardfork = providers_1.DEFAULT_HARDFORK,
  chainId = providers_1.DEFAULT_CHAIN_ID,
  networkId = providers_1.DEFAULT_NETWORK_ID,
  blockGasLimit = providers_1.DEFAULT_BLOCK_GAS_LIMIT,
  accounts = providers_1.DEFAULT_ACCOUNTS,
  allowUnlimitedContractSize = providers_1.DEFAULT_ALLOW_UNLIMITED_CONTRACT_SIZE,
  allowBlocksWithSameTimestamp = false,
  initialBaseFeePerGas,
  mempool = providers_1.DEFAULT_MEMPOOL_CONFIG,
  coinbase,
  chains = default_config_1.defaultHardhatNetworkParams.chains,
} = {}) {
  beforeEach("Initialize provider", function () {
    return __awaiter(this, void 0, void 0, function* () {
      this.logger = new fakeLogger_1.FakeModulesLogger();
      this.hardhatNetworkProvider = yield (0,
      provider_1.createHardhatNetworkProvider)(
        {
          hardfork,
          chainId,
          networkId,
          blockGasLimit: Number(blockGasLimit),
          initialBaseFeePerGas:
            initialBaseFeePerGas === undefined
              ? undefined
              : Number(initialBaseFeePerGas),
          minGasPrice: 0n,
          throwOnTransactionFailures: true,
          throwOnCallFailures: true,
          automine: mining.auto,
          intervalMining: mining.interval,
          mempoolOrder: mempool.order,
          chains,
          genesisAccounts: accounts,
          allowUnlimitedContractSize,
          forkConfig,
          coinbase,
          allowBlocksWithSameTimestamp,
          enableTransientStorage: false,
          enableRip7212: false,
        },
        {
          enabled: loggerEnabled,
          printLineFn: this.logger.printLineFn(),
          replaceLastLineFn: this.logger.replaceLastLineFn(),
        }
      );
      const provider =
        new backwards_compatibility_1.BackwardsCompatibilityProviderAdapter(
          this.hardhatNetworkProvider
        );
      this.provider = provider;
      if (useJsonRpc) {
        this.server = new server_1.JsonRpcServer({
          port: 0,
          hostname: "127.0.0.1",
          provider: this.provider,
        });
        this.serverInfo = yield this.server.listen();
        this.provider =
          new backwards_compatibility_1.BackwardsCompatibilityProviderAdapter(
            this.server.getProvider()
          );
      }
      this.isEdr = (0, isEdrProvider_1.isEdrProvider)(provider);
    });
  });
  afterEach("Remove provider", function () {
    return __awaiter(this, void 0, void 0, function* () {
      // These two deletes are unsafe, but we use this properties
      // in very locally and are ok with the risk.
      // To make this safe the properties should be optional, which
      // would be really uncomfortable for testing.
      delete this.provider;
      delete this.hardhatNetworkProvider;
      if (this.server !== undefined) {
        // close server and fail if it takes too long
        const beforeClose = Date.now();
        yield this.server.close();
        const afterClose = Date.now();
        const elapsedTime = afterClose - beforeClose;
        if (elapsedTime > 1500) {
          throw new Error(
            `Closing the server took more than 1 second (${elapsedTime}ms), which can lead to incredibly slow tests. Please fix it.`
          );
        }
        delete this.server;
        delete this.serverInfo;
      }
    });
  });
}
exports.useProvider = useProvider;
