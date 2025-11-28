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
exports.createHardhatNetworkProvider =
  exports.EdrProviderWrapper =
  exports.getGlobalEdrContext =
  exports.DEFAULT_COINBASE =
    void 0;
const picocolors_1 = __importDefault(require("picocolors"));
const debug_1 = __importDefault(require("debug"));
const events_1 = require("events");
const fs_extra_1 = __importDefault(require("fs-extra"));
const napi_rs_1 = require("../../../common/napi-rs");
const constants_1 = require("../../constants");
const errors_1 = require("../../core/providers/errors");
const http_1 = require("../../core/providers/http");
const hardforks_1 = require("../../util/hardforks");
const consoleLogger_1 = require("../stack-traces/consoleLogger");
const solidity_errors_1 = require("../stack-traces/solidity-errors");
const packageInfo_1 = require("../../util/packageInfo");
const convertToEdr_1 = require("./utils/convertToEdr");
const logger_1 = require("./modules/logger");
const minimal_vm_1 = require("./vm/minimal-vm");
const log = (0, debug_1.default)("hardhat:core:hardhat-network:provider");
/* eslint-disable @nomicfoundation/hardhat-internal-rules/only-hardhat-error */
exports.DEFAULT_COINBASE = "0xc014ba5ec014ba5ec014ba5ec014ba5ec014ba5e";
let _globalEdrContext;
// Lazy initialize the global EDR context.
function getGlobalEdrContext() {
  const { EdrContext } = (0, napi_rs_1.requireNapiRsModule)(
    "@nomicfoundation/edr"
  );
  if (_globalEdrContext === undefined) {
    // Only one is allowed to exist
    _globalEdrContext = new EdrContext();
  }
  return _globalEdrContext;
}
exports.getGlobalEdrContext = getGlobalEdrContext;
class EdrProviderEventAdapter extends events_1.EventEmitter {}
class EdrProviderWrapper extends events_1.EventEmitter {
  constructor(
    _provider,
    // we add this for backwards-compatibility with plugins like solidity-coverage
    _node
  ) {
    super();
    this._provider = _provider;
    this._node = _node;
    this._failedStackTraces = 0;
  }
  static create(config, loggerConfig, tracingConfig) {
    var _a, _b, _c, _d;
    return __awaiter(this, void 0, void 0, function* () {
      const { Provider } = (0, napi_rs_1.requireNapiRsModule)(
        "@nomicfoundation/edr"
      );
      const coinbase =
        (_a = config.coinbase) !== null && _a !== void 0
          ? _a
          : exports.DEFAULT_COINBASE;
      let fork;
      if (config.forkConfig !== undefined) {
        let httpHeaders;
        if (config.forkConfig.httpHeaders !== undefined) {
          httpHeaders = [];
          for (const [name, value] of Object.entries(
            config.forkConfig.httpHeaders
          )) {
            httpHeaders.push({
              name,
              value,
            });
          }
        }
        fork = {
          jsonRpcUrl: config.forkConfig.jsonRpcUrl,
          blockNumber:
            config.forkConfig.blockNumber !== undefined
              ? BigInt(config.forkConfig.blockNumber)
              : undefined,
          httpHeaders,
        };
      }
      const initialDate =
        config.initialDate !== undefined
          ? BigInt(Math.floor(config.initialDate.getTime() / 1000))
          : undefined;
      // To accommodate construction ordering, we need an adapter to forward events
      // from the EdrProvider callback to the wrapper's listener
      const eventAdapter = new EdrProviderEventAdapter();
      const printLineFn =
        (_b = loggerConfig.printLineFn) !== null && _b !== void 0
          ? _b
          : logger_1.printLine;
      const replaceLastLineFn =
        (_c = loggerConfig.replaceLastLineFn) !== null && _c !== void 0
          ? _c
          : logger_1.replaceLastLine;
      const hardforkName = (0, hardforks_1.getHardforkName)(config.hardfork);
      const provider = yield Provider.withConfig(
        getGlobalEdrContext(),
        {
          allowBlocksWithSameTimestamp:
            (_d = config.allowBlocksWithSameTimestamp) !== null && _d !== void 0
              ? _d
              : false,
          allowUnlimitedContractSize: config.allowUnlimitedContractSize,
          bailOnCallFailure: config.throwOnCallFailures,
          bailOnTransactionFailure: config.throwOnTransactionFailures,
          blockGasLimit: BigInt(config.blockGasLimit),
          chainId: BigInt(config.chainId),
          chains: Array.from(config.chains, ([chainId, hardforkConfig]) => {
            return {
              chainId: BigInt(chainId),
              hardforks: Array.from(
                hardforkConfig.hardforkHistory,
                ([hardfork, blockNumber]) => {
                  return {
                    blockNumber: BigInt(blockNumber),
                    specId: (0, convertToEdr_1.ethereumsjsHardforkToEdrSpecId)(
                      (0, hardforks_1.getHardforkName)(hardfork)
                    ),
                  };
                }
              ),
            };
          }),
          cacheDir: config.forkCachePath,
          coinbase: Buffer.from(coinbase.slice(2), "hex"),
          enableRip7212: config.enableRip7212,
          fork,
          hardfork: (0, convertToEdr_1.ethereumsjsHardforkToEdrSpecId)(
            hardforkName
          ),
          genesisAccounts: config.genesisAccounts.map((account) => {
            return {
              secretKey: account.privateKey,
              balance: BigInt(account.balance),
            };
          }),
          initialDate,
          initialBaseFeePerGas:
            config.initialBaseFeePerGas !== undefined
              ? BigInt(config.initialBaseFeePerGas)
              : undefined,
          minGasPrice: config.minGasPrice,
          mining: {
            autoMine: config.automine,
            interval: (0, convertToEdr_1.ethereumjsIntervalMiningConfigToEdr)(
              config.intervalMining
            ),
            memPool: {
              order: (0,
              convertToEdr_1.ethereumjsMempoolOrderToEdrMineOrdering)(
                config.mempoolOrder
              ),
            },
          },
          networkId: BigInt(config.networkId),
        },
        {
          enable: loggerConfig.enabled,
          decodeConsoleLogInputsCallback:
            consoleLogger_1.ConsoleLogger.getDecodedLogs,
          printLineCallback: (message, replace) => {
            if (replace) {
              replaceLastLineFn(message);
            } else {
              printLineFn(message);
            }
          },
        },
        tracingConfig !== null && tracingConfig !== void 0 ? tracingConfig : {},
        (event) => {
          eventAdapter.emit("ethEvent", event);
        }
      );
      const minimalEthereumJsNode = {
        _vm: (0, minimal_vm_1.getMinimalEthereumJsVm)(provider),
      };
      const wrapper = new EdrProviderWrapper(provider, minimalEthereumJsNode);
      // Pass through all events from the provider
      eventAdapter.addListener(
        "ethEvent",
        wrapper._ethEventListener.bind(wrapper)
      );
      return wrapper;
    });
  }
  request(args) {
    var _a, _b, _c, _d, _e;
    return __awaiter(this, void 0, void 0, function* () {
      if (args.params !== undefined && !Array.isArray(args.params)) {
        throw new errors_1.InvalidInputError(
          "Hardhat Network doesn't support JSON-RPC params sent as an object"
        );
      }
      const params = (_a = args.params) !== null && _a !== void 0 ? _a : [];
      if (args.method === "hardhat_getStackTraceFailuresCount") {
        // stubbed for backwards compatibility
        return 0;
      }
      const stringifiedArgs = JSON.stringify({
        method: args.method,
        params,
      });
      const responseObject = yield this._provider.handleRequest(
        stringifiedArgs
      );
      let response;
      if (typeof responseObject.data === "string") {
        response = JSON.parse(responseObject.data);
      } else {
        response = responseObject.data;
      }
      const needsTraces =
        this._node._vm.evm.events.eventNames().length > 0 ||
        this._node._vm.events.eventNames().length > 0;
      if (needsTraces) {
        const rawTraces = responseObject.traces;
        for (const rawTrace of rawTraces) {
          // For other consumers in JS we need to marshall the entire trace over FFI
          const trace = rawTrace.trace();
          // beforeTx event
          if (this._node._vm.events.listenerCount("beforeTx") > 0) {
            this._node._vm.events.emit("beforeTx");
          }
          for (const traceItem of trace) {
            // step event
            if ("pc" in traceItem) {
              if (this._node._vm.evm.events.listenerCount("step") > 0) {
                this._node._vm.evm.events.emit(
                  "step",
                  (0, convertToEdr_1.edrTracingStepToMinimalInterpreterStep)(
                    traceItem
                  )
                );
              }
            }
            // afterMessage event
            else if ("executionResult" in traceItem) {
              if (this._node._vm.evm.events.listenerCount("afterMessage") > 0) {
                this._node._vm.evm.events.emit(
                  "afterMessage",
                  (0, convertToEdr_1.edrTracingMessageResultToMinimalEVMResult)(
                    traceItem
                  )
                );
              }
            }
            // beforeMessage event
            else {
              if (
                this._node._vm.evm.events.listenerCount("beforeMessage") > 0
              ) {
                this._node._vm.evm.events.emit(
                  "beforeMessage",
                  (0, convertToEdr_1.edrTracingMessageToMinimalMessage)(
                    traceItem
                  )
                );
              }
            }
          }
          // afterTx event
          if (this._node._vm.events.listenerCount("afterTx") > 0) {
            this._node._vm.events.emit("afterTx");
          }
        }
      }
      if ((0, http_1.isErrorResponse)(response)) {
        let error;
        let stackTrace = null;
        try {
          stackTrace = responseObject.stackTrace();
        } catch (e) {
          log("Failed to get stack trace: %O", e);
        }
        if (stackTrace !== null) {
          error = (0, solidity_errors_1.encodeSolidityStackTrace)(
            response.error.message,
            stackTrace
          );
          // Pass data and transaction hash from the original error
          error.data =
            (_c =
              (_b = response.error.data) === null || _b === void 0
                ? void 0
                : _b.data) !== null && _c !== void 0
              ? _c
              : undefined;
          error.transactionHash =
            (_e =
              (_d = response.error.data) === null || _d === void 0
                ? void 0
                : _d.transactionHash) !== null && _e !== void 0
              ? _e
              : undefined;
        } else {
          if (response.error.code === errors_1.InvalidArgumentsError.CODE) {
            error = new errors_1.InvalidArgumentsError(response.error.message);
          } else {
            error = new errors_1.ProviderError(
              response.error.message,
              response.error.code
            );
          }
          error.data = response.error.data;
        }
        // eslint-disable-next-line @nomicfoundation/hardhat-internal-rules/only-hardhat-error
        throw error;
      }
      if (args.method === "hardhat_reset") {
        this.emit(constants_1.HARDHAT_NETWORK_RESET_EVENT);
      } else if (args.method === "evm_revert") {
        this.emit(constants_1.HARDHAT_NETWORK_REVERT_SNAPSHOT_EVENT);
      }
      // Override EDR version string with Hardhat version string with EDR backend,
      // e.g. `HardhatNetwork/2.19.0/@nomicfoundation/edr/0.2.0-dev`
      if (args.method === "web3_clientVersion") {
        return clientVersion(response.result);
      } else if (
        args.method === "debug_traceTransaction" ||
        args.method === "debug_traceCall"
      ) {
        return (0, convertToEdr_1.edrRpcDebugTraceToHardhat)(response.result);
      } else {
        return response.result;
      }
    });
  }
  // temporarily added to make smock work with HH+EDR
  _setCallOverrideCallback(callback) {
    this._callOverrideCallback = callback;
    this._provider.setCallOverrideCallback((address, data) =>
      __awaiter(this, void 0, void 0, function* () {
        var _a;
        return (_a = this._callOverrideCallback) === null || _a === void 0
          ? void 0
          : _a.call(this, address, data);
      })
    );
  }
  _setVerboseTracing(enabled) {
    this._provider.setVerboseTracing(enabled);
  }
  _ethEventListener(event) {
    const subscription = `0x${event.filterId.toString(16)}`;
    const results = Array.isArray(event.result) ? event.result : [event.result];
    for (const result of results) {
      this._emitLegacySubscriptionEvent(subscription, result);
      this._emitEip1193SubscriptionEvent(subscription, result);
    }
  }
  _emitLegacySubscriptionEvent(subscription, result) {
    this.emit("notification", {
      subscription,
      result,
    });
  }
  _emitEip1193SubscriptionEvent(subscription, result) {
    const message = {
      type: "eth_subscription",
      data: {
        subscription,
        result,
      },
    };
    this.emit("message", message);
  }
}
exports.EdrProviderWrapper = EdrProviderWrapper;
function clientVersion(edrClientVersion) {
  return __awaiter(this, void 0, void 0, function* () {
    const hardhatPackage = yield (0, packageInfo_1.getPackageJson)();
    const edrVersion = edrClientVersion.split("/")[1];
    return `HardhatNetwork/${hardhatPackage.version}/@nomicfoundation/edr/${edrVersion}`;
  });
}
function createHardhatNetworkProvider(
  hardhatNetworkProviderConfig,
  loggerConfig,
  artifacts
) {
  return __awaiter(this, void 0, void 0, function* () {
    log("Making tracing config");
    const tracingConfig = yield makeTracingConfig(artifacts);
    log("Creating EDR provider");
    const provider = yield EdrProviderWrapper.create(
      hardhatNetworkProviderConfig,
      loggerConfig,
      tracingConfig
    );
    log("EDR provider created");
    return provider;
  });
}
exports.createHardhatNetworkProvider = createHardhatNetworkProvider;
function makeTracingConfig(artifacts) {
  return __awaiter(this, void 0, void 0, function* () {
    if (artifacts !== undefined) {
      const buildInfoFiles = yield artifacts.getBuildInfoPaths();
      try {
        const buildInfos = yield Promise.all(
          buildInfoFiles.map((filePath) =>
            fs_extra_1.default.readFile(filePath)
          )
        );
        return {
          buildInfos,
        };
      } catch (error) {
        console.warn(
          picocolors_1.default.yellow(
            "Stack traces engine could not be initialized. Run Hardhat with --verbose to learn more."
          )
        );
        log(
          "Solidity stack traces disabled: Failed to read solc's input and output files. Please report this to help us improve Hardhat.\n",
          error
        );
      }
    }
  });
}
