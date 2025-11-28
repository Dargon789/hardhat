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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const picocolors_1 = __importDefault(require("picocolors"));
const debug_1 = __importDefault(require("debug"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const constants_1 = require("../internal/constants");
const config_env_1 = require("../internal/core/config/config-env");
const errors_1 = require("../internal/core/errors");
const errors_list_1 = require("../internal/core/errors-list");
const construction_1 = require("../internal/core/providers/construction");
const util_1 = require("../internal/core/providers/util");
const server_1 = require("../internal/hardhat-network/jsonrpc/server");
const reporter_1 = require("../internal/sentry/reporter");
const default_config_1 = require("../internal/core/config/default-config");
const task_names_1 = require("./task-names");
const watch_1 = require("./utils/watch");
const log = (0, debug_1.default)("hardhat:core:tasks:node");
function printDefaultConfigWarning() {
  console.log(
    picocolors_1.default.bold(
      "WARNING: These accounts, and their private keys, are publicly known."
    )
  );
  console.log(
    picocolors_1.default.bold(
      "Any funds sent to them on Mainnet or any other live network WILL BE LOST."
    )
  );
}
function logHardhatNetworkAccounts(networkConfig) {
  const isDefaultConfig =
    !Array.isArray(networkConfig.accounts) &&
    networkConfig.accounts.mnemonic ===
      default_config_1.HARDHAT_NETWORK_MNEMONIC;
  const {
    bytesToHex: bufferToHex,
    privateToAddress,
    toBytes,
    toChecksumAddress,
  } = require("@ethereumjs/util");
  console.log("Accounts");
  console.log("========");
  if (isDefaultConfig) {
    console.log();
    printDefaultConfigWarning();
    console.log();
  }
  const accounts = (0, util_1.normalizeHardhatNetworkAccountsConfig)(
    networkConfig.accounts
  );
  for (const [index, account] of accounts.entries()) {
    const address = toChecksumAddress(
      bufferToHex(privateToAddress(toBytes(account.privateKey)))
    );
    const balance = (BigInt(account.balance) / 10n ** 18n).toString(10);
    let entry = `Account #${index}: ${address} (${balance} ETH)`;
    if (isDefaultConfig) {
      const privateKey = bufferToHex(toBytes(account.privateKey));
      entry += `
Private Key: ${privateKey}`;
    }
    console.log(entry);
    console.log();
  }
  if (isDefaultConfig) {
    printDefaultConfigWarning();
    console.log();
  }
}
(0, config_env_1.subtask)(task_names_1.TASK_NODE_GET_PROVIDER)
  .addOptionalParam("forkUrl", undefined, undefined, config_env_1.types.string)
  .addOptionalParam(
    "forkBlockNumber",
    undefined,
    undefined,
    config_env_1.types.int
  )
  .setAction(
    (
      { forkBlockNumber: forkBlockNumberParam, forkUrl: forkUrlParam },
      { artifacts, config, network, userConfig }
    ) =>
      __awaiter(void 0, void 0, void 0, function* () {
        var _a, _b, _c, _d, _e;
        let provider = network.provider;
        if (network.name !== constants_1.HARDHAT_NETWORK_NAME) {
          log(`Creating hardhat provider for JSON-RPC server`);
          provider = yield (0, construction_1.createProvider)(
            config,
            constants_1.HARDHAT_NETWORK_NAME,
            artifacts
          );
        }
        const hardhatNetworkConfig =
          config.networks[constants_1.HARDHAT_NETWORK_NAME];
        const forkUrlConfig =
          (_a = hardhatNetworkConfig.forking) === null || _a === void 0
            ? void 0
            : _a.url;
        const forkBlockNumberConfig =
          (_b = hardhatNetworkConfig.forking) === null || _b === void 0
            ? void 0
            : _b.blockNumber;
        const forkUrl =
          forkUrlParam !== null && forkUrlParam !== void 0
            ? forkUrlParam
            : forkUrlConfig;
        const forkBlockNumber =
          forkBlockNumberParam !== null && forkBlockNumberParam !== void 0
            ? forkBlockNumberParam
            : forkBlockNumberConfig;
        // we throw an error if the user specified a forkBlockNumber but not a
        // forkUrl
        if (forkBlockNumber !== undefined && forkUrl === undefined) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.BUILTIN_TASKS.NODE_FORK_BLOCK_NUMBER_WITHOUT_URL
          );
        }
        // if the url or the block is different to the one in the configuration,
        // we use hardhat_reset to set the fork
        if (
          forkUrl !== forkUrlConfig ||
          forkBlockNumber !== forkBlockNumberConfig
        ) {
          yield provider.request({
            method: "hardhat_reset",
            params: [
              {
                forking: {
                  jsonRpcUrl: forkUrl,
                  blockNumber: forkBlockNumber,
                },
              },
            ],
          });
        }
        const hardhatNetworkUserConfig =
          (_d =
            (_c = userConfig.networks) === null || _c === void 0
              ? void 0
              : _c[constants_1.HARDHAT_NETWORK_NAME]) !== null && _d !== void 0
            ? _d
            : {};
        // enable logging
        yield provider.request({
          method: "hardhat_setLoggingEnabled",
          params: [
            (_e = hardhatNetworkUserConfig.loggingEnabled) !== null &&
            _e !== void 0
              ? _e
              : true,
          ],
        });
        return provider;
      })
  );
(0, config_env_1.subtask)(task_names_1.TASK_NODE_CREATE_SERVER)
  .addParam("hostname", undefined, undefined, config_env_1.types.string)
  .addParam("port", undefined, undefined, config_env_1.types.int)
  .addParam("provider", undefined, undefined, config_env_1.types.any)
  .setAction(({ hostname, port, provider }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      const serverConfig = {
        hostname,
        port,
        provider,
      };
      const server = new server_1.JsonRpcServer(serverConfig);
      return server;
    })
  );
/**
 * This task will be called when the server was successfully created, but it's
 * not ready for receiving requests yet.
 */
(0, config_env_1.subtask)(task_names_1.TASK_NODE_SERVER_CREATED)
  .addParam("hostname", undefined, undefined, config_env_1.types.string)
  .addParam("port", undefined, undefined, config_env_1.types.int)
  .addParam("provider", undefined, undefined, config_env_1.types.any)
  .addParam("server", undefined, undefined, config_env_1.types.any)
  .setAction(({}) =>
    __awaiter(void 0, void 0, void 0, function* () {
      // this task is meant to be overridden by plugin writers
    })
  );
/**
 * This subtask will be run when the server is ready to accept requests
 */
(0, config_env_1.subtask)(task_names_1.TASK_NODE_SERVER_READY)
  .addParam("address", undefined, undefined, config_env_1.types.string)
  .addParam("port", undefined, undefined, config_env_1.types.int)
  .addParam("provider", undefined, undefined, config_env_1.types.any)
  .addParam("server", undefined, undefined, config_env_1.types.any)
  .setAction(({ address, port }, { config }) =>
    __awaiter(void 0, void 0, void 0, function* () {
      console.log(
        picocolors_1.default.green(
          `Started HTTP and WebSocket JSON-RPC server at http://${address}:${port}/`
        )
      );
      console.log();
      const networkConfig = config.networks[constants_1.HARDHAT_NETWORK_NAME];
      logHardhatNetworkAccounts(networkConfig);
    })
  );
(0, config_env_1.task)(
  task_names_1.TASK_NODE,
  "Starts a JSON-RPC server on top of Hardhat Network"
)
  .addOptionalParam(
    "hostname",
    "The host to which to bind to for new connections (Defaults to 127.0.0.1 running locally, and 0.0.0.0 in Docker)",
    undefined,
    config_env_1.types.string
  )
  .addOptionalParam(
    "port",
    "The port on which to listen for new connections",
    8545,
    config_env_1.types.int
  )
  .addOptionalParam(
    "fork",
    "The URL of the JSON-RPC server to fork from",
    undefined,
    config_env_1.types.string
  )
  .addOptionalParam(
    "forkBlockNumber",
    "The block number to fork from",
    undefined,
    config_env_1.types.int
  )
  .setAction(
    (
      { forkBlockNumber, fork: forkUrl, hostname: hostnameParam, port },
      { config, hardhatArguments, network, run }
    ) =>
      __awaiter(void 0, void 0, void 0, function* () {
        // we throw if the user specified a network argument and it's not hardhat
        if (
          network.name !== constants_1.HARDHAT_NETWORK_NAME &&
          hardhatArguments.network !== undefined
        ) {
          throw new errors_1.HardhatError(
            errors_list_1.ERRORS.BUILTIN_TASKS.JSONRPC_UNSUPPORTED_NETWORK
          );
        }
        try {
          const provider = yield run(task_names_1.TASK_NODE_GET_PROVIDER, {
            forkBlockNumber,
            forkUrl,
          });
          // the default hostname is "127.0.0.1" unless we are inside a docker
          // container, in that case we use "0.0.0.0"
          let hostname;
          if (hostnameParam !== undefined) {
            hostname = hostnameParam;
          } else {
            const insideDocker = fs_extra_1.default.existsSync("/.dockerenv");
            if (insideDocker) {
              hostname = "0.0.0.0";
            } else {
              hostname = "127.0.0.1";
            }
          }
          const server = yield run(task_names_1.TASK_NODE_CREATE_SERVER, {
            hostname,
            port,
            provider,
          });
          yield run(task_names_1.TASK_NODE_SERVER_CREATED, {
            hostname,
            port,
            provider,
            server,
          });
          const { port: actualPort, address } = yield server.listen();
          let watcher;
          try {
            watcher = yield (0, watch_1.watchCompilerOutput)(
              provider,
              config.paths
            );
          } catch (error) {
            console.warn(
              picocolors_1.default.yellow(
                "There was a problem watching the compiler output, changes in the contracts won't be reflected in the Hardhat Network. Run Hardhat with --verbose to learn more."
              )
            );
            log(
              "Compilation output can't be watched. Please report this to help us improve Hardhat.\n",
              error
            );
            if (error instanceof Error) {
              reporter_1.Reporter.reportError(error);
            }
          }
          yield run(task_names_1.TASK_NODE_SERVER_READY, {
            address,
            port: actualPort,
            provider,
            server,
          });
          yield server.waitUntilClosed();
          yield watcher === null || watcher === void 0
            ? void 0
            : watcher.close();
        } catch (error) {
          if (errors_1.HardhatError.isHardhatError(error)) {
            throw error;
          }
          if (error instanceof Error) {
            throw new errors_1.HardhatError(
              errors_list_1.ERRORS.BUILTIN_TASKS.JSONRPC_SERVER_ERROR,
              {
                error: error.message,
              },
              error
            );
          }
          // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
          throw error;
        }
      })
  );
