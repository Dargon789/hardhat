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
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const cloneDeep_1 = __importDefault(require("lodash/cloneDeep"));
const path = __importStar(require("path"));
const sinon_1 = __importDefault(require("sinon"));
const config_resolution_1 = require("../../../../src/internal/core/config/config-resolution");
const default_config_1 = require("../../../../src/internal/core/config/default-config");
const hardforks_1 = require("../../../../src/internal/util/hardforks");
const project_1 = require("../../../helpers/project");
const fs_utils_1 = require("../../../../src/internal/util/fs-utils");
const environment_1 = require("../../../helpers/environment");
function getBuildInfos() {
  return (0, fs_utils_1.getAllFilesMatchingSync)(
    (0, fs_utils_1.getRealPathSync)("artifacts/build-info"),
    (f) => f.endsWith(".json")
  );
}
describe("Config resolution", () => {
  describe("Default config merging", () => {
    describe("With default config", () => {
      it("should return the default config", () => {
        var _a, _b;
        const config = (0, config_resolution_1.resolveConfig)(__filename, {});
        chai_1.assert.lengthOf(config.solidity.compilers, 1);
        chai_1.assert.equal(
          config.solidity.compilers[0].version,
          default_config_1.DEFAULT_SOLC_VERSION
        );
        chai_1.assert.containsAllKeys(config.networks, ["localhost"]);
        chai_1.assert.isUndefined(
          (_b =
            (_a = config.solidity.compilers[0]) === null || _a === void 0
              ? void 0
              : _a.settings) === null || _b === void 0
            ? void 0
            : _b.evmVersion
        );
        chai_1.assert.equal(config.defaultNetwork, "hardhat");
        const hardhatNetworkConfig = config.networks.hardhat;
        chai_1.assert.equal(
          hardhatNetworkConfig.throwOnTransactionFailures,
          true
        );
        chai_1.assert.equal(hardhatNetworkConfig.throwOnCallFailures, true);
      });
    });
    describe("With custom config", () => {
      let config;
      beforeEach(() => {
        config = (0, config_resolution_1.resolveConfig)(__filename, {
          defaultNetwork: "custom",
          networks: {
            custom: {
              url: "http://127.0.0.1:8545",
            },
            localhost: {
              accounts: [
                "0xa95f9e3e7ae4e4865c5968828fe7c03fffa8a9f3bb52d36d26243f4c868ee166",
              ],
            },
          },
          solidity: "0.5.15",
          unknown: {
            asd: 123,
          },
        });
      });
      it("should return the config merged ", () => {
        chai_1.assert.lengthOf(config.solidity.compilers, 1);
        chai_1.assert.equal(config.solidity.compilers[0].version, "0.5.15");
        chai_1.assert.containsAllKeys(config.networks, ["localhost", "custom"]);
        chai_1.assert.equal(config.defaultNetwork, "custom");
      });
      it("should return the config merged ", () => {
        chai_1.assert.lengthOf(config.solidity.compilers, 1);
        chai_1.assert.equal(config.solidity.compilers[0].version, "0.5.15");
        chai_1.assert.containsAllKeys(config.networks, ["localhost", "custom"]);
        chai_1.assert.equal(
          config.networks.localhost.url,
          "http://127.0.0.1:8545"
        );
        chai_1.assert.deepEqual(config.networks.localhost.accounts, [
          "0xa95f9e3e7ae4e4865c5968828fe7c03fffa8a9f3bb52d36d26243f4c868ee166",
        ]);
      });
      it("should keep any unknown field", () => {
        chai_1.assert.deepEqual(config.unknown, { asd: 123 });
      });
    });
    describe("With custom solidity", () => {
      let config;
      beforeEach(() => {
        const optimizer = {
          enabled: false,
          runs: 200,
        };
        config = (0, config_resolution_1.resolveConfig)(__filename, {
          solidity: {
            compilers: [
              {
                version: "0.5.5",
                settings: {
                  optimizer,
                  metadata: {
                    useLiteralContent: true,
                  },
                  outputSelection: {
                    "*": {
                      "*": ["ir"],
                    },
                  },
                },
              },
              { version: "0.6.7", settings: { optimizer } },
            ],
            overrides: {
              "a.sol": {
                version: "0.6.1",
                settings: {
                  optimizer: {
                    enabled: true,
                  },
                },
              },
            },
          },
        });
      });
      it("should return the user's solidity config", () => {
        const solidityConfig = config.solidity;
        const modifiedOutputSelections = (0, cloneDeep_1.default)(
          default_config_1.defaultSolcOutputSelection
        );
        modifiedOutputSelections["*"]["*"] = [
          "ir",
          ...modifiedOutputSelections["*"]["*"],
        ];
        chai_1.assert.deepEqual(solidityConfig, {
          compilers: [
            {
              version: "0.5.5",
              settings: {
                optimizer: { enabled: false, runs: 200 },
                metadata: {
                  useLiteralContent: true,
                },
                outputSelection: modifiedOutputSelections,
              },
            },
            {
              version: "0.6.7",
              settings: {
                optimizer: { enabled: false, runs: 200 },
                outputSelection: default_config_1.defaultSolcOutputSelection,
              },
            },
          ],
          overrides: {
            "a.sol": {
              version: "0.6.1",
              settings: {
                optimizer: { enabled: true, runs: 200 },
                outputSelection: default_config_1.defaultSolcOutputSelection,
              },
            },
          },
        });
      });
    });
  });
  describe("Paths resolution", () => {
    it("Doesn't override paths.configFile", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {
        paths: { configFile: "asd" },
      });
      chai_1.assert.equal(paths.configFile, __filename);
    });
    it("Should return absolute paths for Hardhat paths, and leave the others as is", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {
        paths: { asd: "asd" },
      });
      Object.entries(paths)
        .filter(([name]) => name !== "asd")
        .forEach(([_, p]) => chai_1.assert.isTrue(path.isAbsolute(p)));
    });
    it("Should use absolute paths 'as is'", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {
        paths: {
          asd: "/asd",
          root: "/root",
          sources: "/c",
          artifacts: "/a",
          cache: "/ca",
          tests: "/t",
        },
      });
      chai_1.assert.equal(paths.root, "/root");
      chai_1.assert.equal(paths.asd, "/asd");
      chai_1.assert.equal(paths.sources, "/c");
      chai_1.assert.equal(paths.artifacts, "/a");
      chai_1.assert.equal(paths.cache, "/ca");
      chai_1.assert.equal(paths.tests, "/t");
    });
    it("Should resolve the root relative to the configFile", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {
        paths: {
          root: "blah",
        },
      });
      chai_1.assert.equal(paths.root, path.join(__dirname, "blah"));
    });
    it("Should resolve the rest relative to the root, except unknown values, that are left as is", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {
        paths: {
          root: "blah",
          asdf: { a: 123 },
          sources: "c",
          artifacts: "a",
          cache: "ca",
          tests: "t",
        },
      });
      const root = path.join(__dirname, "blah");
      chai_1.assert.equal(paths.root, root);
      chai_1.assert.equal(paths.sources, path.join(root, "c"));
      chai_1.assert.equal(paths.artifacts, path.join(root, "a"));
      chai_1.assert.equal(paths.cache, path.join(root, "ca"));
      chai_1.assert.equal(paths.tests, path.join(root, "t"));
      chai_1.assert.deepEqual(paths.asdf, { a: 123 });
    });
    it("Should have the right default values", () => {
      const { paths } = (0, config_resolution_1.resolveConfig)(__filename, {});
      chai_1.assert.equal(paths.root, __dirname);
      chai_1.assert.equal(paths.sources, path.join(__dirname, "contracts"));
      chai_1.assert.equal(paths.artifacts, path.join(__dirname, "artifacts"));
      chai_1.assert.equal(paths.cache, path.join(__dirname, "cache"));
      chai_1.assert.equal(paths.tests, path.join(__dirname, "test"));
    });
  });
  describe("Mocha config resolution", () => {
    it("Should set a default time and leave the rest as is", () => {
      const config = (0, config_resolution_1.resolveConfig)(__filename, {
        mocha: { bail: true },
      });
      chai_1.assert.equal(
        config.mocha.timeout,
        default_config_1.defaultMochaOptions.timeout
      );
      chai_1.assert.isTrue(config.mocha.bail);
    });
    it("Should let the user override the timeout", () => {
      const config = (0, config_resolution_1.resolveConfig)(__filename, {
        mocha: { timeout: 1 },
      });
      chai_1.assert.equal(config.mocha.timeout, 1);
    });
  });
  describe("Networks resolution", function () {
    describe("Hardhat network resolution", function () {
      it("Should always define the hardhat network", function () {
        const config = (0, config_resolution_1.resolveConfig)(__filename, {});
        chai_1.assert.isDefined(config.networks.hardhat);
        chai_1.assert.deepEqual(
          config.networks.hardhat,
          Object.assign(
            Object.assign({}, default_config_1.defaultHardhatNetworkParams),
            {
              // The default values of the next tests are dynamic
              gas: config.networks.hardhat.gas,
              initialDate: config.networks.hardhat.initialDate,
            }
          )
        );
      });
      it("Should use the block gas limit as default gas", function () {
        const configWithoutBlockGasLimit = (0,
        config_resolution_1.resolveConfig)(__filename, {});
        chai_1.assert.deepEqual(
          configWithoutBlockGasLimit.networks.hardhat,
          Object.assign(
            Object.assign({}, default_config_1.defaultHardhatNetworkParams),
            {
              gas: configWithoutBlockGasLimit.networks.hardhat.blockGasLimit,
              initialDate:
                configWithoutBlockGasLimit.networks.hardhat.initialDate,
            }
          )
        );
        const configWithBlockGasLimit = (0, config_resolution_1.resolveConfig)(
          __filename,
          {
            networks: { hardhat: { blockGasLimit: 1 } },
          }
        );
        chai_1.assert.deepEqual(
          configWithBlockGasLimit.networks.hardhat,
          Object.assign(
            Object.assign({}, default_config_1.defaultHardhatNetworkParams),
            {
              blockGasLimit: 1,
              gas: 1,
              initialDate: configWithBlockGasLimit.networks.hardhat.initialDate,
            }
          )
        );
        const configWithBlockGasLimitAndGas = (0,
        config_resolution_1.resolveConfig)(__filename, {
          networks: { hardhat: { blockGasLimit: 2, gas: 3 } },
        });
        chai_1.assert.deepEqual(
          configWithBlockGasLimitAndGas.networks.hardhat,
          Object.assign(
            Object.assign({}, default_config_1.defaultHardhatNetworkParams),
            {
              blockGasLimit: 2,
              gas: 3,
              initialDate:
                configWithBlockGasLimitAndGas.networks.hardhat.initialDate,
            }
          )
        );
      });
      it("Should resolve initialDate to the current time", function () {
        const fakeNow = new Date(
          "Fri Apr 8 2021 15:21:19 GMT-0300 (Argentina Standard Time)"
        );
        let sinonClock;
        try {
          sinonClock = sinon_1.default.useFakeTimers({
            now: fakeNow,
            toFake: [],
          });
          const configWithoutInitialDate = (0,
          config_resolution_1.resolveConfig)(__filename, {});
          chai_1.assert.equal(
            new Date(
              configWithoutInitialDate.networks.hardhat.initialDate
            ).valueOf(),
            fakeNow.valueOf()
          );
        } finally {
          if (sinonClock !== undefined) {
            sinonClock.restore();
          }
        }
        const initialDate =
          "Fri Apr 09 2021 15:21:19 GMT-0300 (Argentina Standard Time)";
        const configWithInitialDate = (0, config_resolution_1.resolveConfig)(
          __filename,
          {
            networks: {
              hardhat: {
                initialDate,
              },
            },
          }
        );
        chai_1.assert.equal(
          configWithInitialDate.networks.hardhat.initialDate,
          initialDate
        );
      });
      it("Should normalize the accounts' private keys", function () {
        const config = (0, config_resolution_1.resolveConfig)(__filename, {
          networks: {
            hardhat: {
              accounts: [
                { privateKey: "  aa00 ", balance: "1" },
                { privateKey: "  0XaA00 ", balance: "1" },
              ],
            },
          },
        });
        const accounts = config.networks.hardhat.accounts;
        const privateKeys = accounts.map((a) => a.privateKey);
        chai_1.assert.deepEqual(privateKeys, ["0xaa00", "0xaa00"]);
      });
      describe("Forking config", function () {
        it("Should enable it if there's an url and no enabled setting", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                forking: {
                  url: "asd",
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.forking, {
            url: "asd",
            enabled: true,
            httpHeaders: {},
          });
        });
        it("Should respect the enabled setting", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                forking: {
                  url: "asd",
                  enabled: false,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.forking, {
            url: "asd",
            enabled: false,
            httpHeaders: {},
          });
        });
        it("Should let you specify a blockNumber ", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                forking: {
                  url: "asd",
                  blockNumber: 123,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.forking, {
            url: "asd",
            enabled: true,
            blockNumber: 123,
            httpHeaders: {},
          });
        });
      });
      describe("Accounts settings", function () {
        it("Should let you specify an array of accounts that's used as is", function () {
          const accounts = [{ privateKey: "0x00000", balance: "123" }];
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                accounts,
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.accounts, accounts);
        });
        it("Should accept an hd account with balance", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                accounts: {
                  mnemonic:
                    "magnet season because hope bind episode labor ready potato glove result modify",
                  path: "m/44'/60'/1'/1",
                  accountsBalance: "12312",
                  count: 1,
                  initialIndex: 2,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.accounts, {
            mnemonic:
              "magnet season because hope bind episode labor ready potato glove result modify",
            path: "m/44'/60'/1'/1",
            accountsBalance: "12312",
            count: 1,
            initialIndex: 2,
            passphrase: "",
          });
        });
        it("Should use default values for hd accounts", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                accounts: {
                  mnemonic:
                    "magnet season because hope bind episode labor ready potato glove result modify",
                },
              },
            },
          });
          chai_1.assert.deepEqual(
            config.networks.hardhat.accounts,
            Object.assign(
              Object.assign(
                {},
                default_config_1.defaultHardhatNetworkHdAccountsConfigParams
              ),
              {
                mnemonic:
                  "magnet season because hope bind episode labor ready potato glove result modify",
              }
            )
          );
        });
      });
      describe("Mining config", function () {
        it("should default use default mining values ", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {});
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: true,
            interval: 0,
            mempool: {
              order: "priority",
            },
          });
        });
        it("should disable automine if interval is configured", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                mining: {
                  interval: 1000,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: false,
            interval: 1000,
            mempool: {
              order: "priority",
            },
          });
        });
        it("should allow configuring only automine", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                mining: {
                  auto: false,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: false,
            interval: 0,
            mempool: {
              order: "priority",
            },
          });
        });
        it("should allow configuring both values", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                mining: {
                  auto: true,
                  interval: 1000,
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: true,
            interval: 1000,
            mempool: {
              order: "priority",
            },
          });
        });
        it("should accept an array for interval mining", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                mining: {
                  interval: [1000, 5000],
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: false,
            interval: [1000, 5000],
            mempool: {
              order: "priority",
            },
          });
        });
        it("should set the mempool order", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                mining: {
                  mempool: {
                    order: "fifo",
                  },
                },
              },
            },
          });
          chai_1.assert.deepEqual(config.networks.hardhat.mining, {
            auto: true,
            interval: 0,
            mempool: {
              order: "fifo",
            },
          });
        });
      });
      describe("minGasPrice", function () {
        it("should default to 0", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {});
          chai_1.assert.equal(config.networks.hardhat.minGasPrice, 0n);
        });
        it("should accept numbers", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                minGasPrice: 10,
              },
            },
          });
          chai_1.assert.equal(config.networks.hardhat.minGasPrice, 10n);
        });
        it("should accept strings", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                minGasPrice: "100000000000",
              },
            },
          });
          chai_1.assert.equal(config.networks.hardhat.minGasPrice, 10n ** 11n);
        });
      });
      it("Should let you configure everything", function () {
        const networkConfig = {
          accounts: [{ privateKey: "0x00000", balance: "123" }],
          chainId: 123,
          from: "from",
          gas: 1,
          gasMultiplier: 1231,
          gasPrice: 2345678,
          throwOnCallFailures: false,
          throwOnTransactionFailures: false,
          loggingEnabled: true,
          allowUnlimitedContractSize: true,
          blockGasLimit: 567,
          minGasPrice: 10,
          mining: {
            auto: false,
            interval: 0,
            mempool: {
              order: "priority",
            },
          },
          hardfork: "hola",
          initialDate: "today",
          chains: {},
        };
        const config = (0, config_resolution_1.resolveConfig)(__filename, {
          networks: { hardhat: networkConfig },
        });
        chai_1.assert.deepEqual(config.networks.hardhat, {
          accounts: [{ privateKey: "0x00000", balance: "123" }],
          chainId: 123,
          from: "from",
          gas: 1,
          gasMultiplier: 1231,
          gasPrice: 2345678,
          throwOnCallFailures: false,
          throwOnTransactionFailures: false,
          loggingEnabled: true,
          allowUnlimitedContractSize: true,
          blockGasLimit: 567,
          minGasPrice: 10n,
          mining: {
            auto: false,
            interval: 0,
            mempool: {
              order: "priority",
            },
          },
          hardfork: "hola",
          initialDate: "today",
          chains: default_config_1.defaultHardhatNetworkParams.chains,
        });
      });
      describe("chains", function () {
        it("should default to default", function () {
          const resolvedConfig = (0, config_resolution_1.resolveConfig)(
            __filename,
            {}
          );
          chai_1.assert.deepEqual(
            Array.from(resolvedConfig.networks.hardhat.chains.entries()),
            Array.from(
              default_config_1.defaultHardhatNetworkParams.chains.entries()
            )
          );
        });
        describe("mixing defaults and user configs", function () {
          const userConfig = {
            networks: {
              hardhat: { chains: { 1: { hardforkHistory: { london: 999 } } } },
            },
          };
          const resolvedConfig = (0, config_resolution_1.resolveConfig)(
            __filename,
            userConfig
          );
          it("If the user provides values for a chain that's included in the default, should use the users' values, and ignore the defaults for that chain.", function () {
            chai_1.assert.deepEqual(
              resolvedConfig.networks.hardhat.chains.get(1),
              {
                hardforkHistory: new Map([
                  [hardforks_1.HardforkName.LONDON, 999],
                ]),
              }
            );
          });
          it("If they don't provide any value for a default chain, should use the default for that one.", function () {
            for (const otherChain of Array.from(
              default_config_1.defaultHardhatNetworkParams.chains.keys()
            )) {
              if (otherChain === 1) continue; // don't expect the default there
              chai_1.assert.deepEqual(
                resolvedConfig.networks.hardhat.chains.get(otherChain),
                default_config_1.defaultHardhatNetworkParams.chains.get(
                  otherChain
                )
              );
            }
          });
        });
        it("If the user provides values for a chain that's not part of the default, should also use those.", function () {
          const resolvedConfig = (0, config_resolution_1.resolveConfig)(
            __filename,
            {
              networks: {
                hardhat: {
                  chains: { 999: { hardforkHistory: { london: 1234 } } },
                },
              },
            }
          );
          chai_1.assert.deepEqual(
            resolvedConfig.networks.hardhat.chains.get(999),
            {
              hardforkHistory: new Map([
                [hardforks_1.HardforkName.LONDON, 1234],
              ]),
            }
          );
        });
      });
      it("should use cancun as the hardfork when enableTransientStorage is set", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                enableTransientStorage: true,
              },
            },
          });
          chai_1.assert.equal(config.networks.hardhat.hardfork, "cancun");
        });
      });
      it("should use shanghai as the hardfork when enableTransientStorage is disabled", function () {
        return __awaiter(this, void 0, void 0, function* () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              hardhat: {
                enableTransientStorage: false,
              },
            },
          });
          chai_1.assert.equal(config.networks.hardhat.hardfork, "shanghai");
        });
      });
    });
    describe("HTTP networks resolution", function () {
      describe("Localhost network resolution", function () {
        it("always defines a localhost network with a default url", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {});
          chai_1.assert.isDefined(config.networks.localhost);
          chai_1.assert.deepEqual(
            config.networks.localhost,
            Object.assign(
              Object.assign({}, default_config_1.defaultHttpNetworkParams),
              default_config_1.defaultLocalhostNetworkParams
            )
          );
        });
        it("let's you override its url and other things", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: { localhost: { url: "asd", timeout: 1 } },
          });
          chai_1.assert.isDefined(config.networks.localhost);
          chai_1.assert.deepEqual(
            config.networks.localhost,
            Object.assign(
              Object.assign({}, default_config_1.defaultHttpNetworkParams),
              { url: "asd", timeout: 1 }
            )
          );
        });
      });
      describe("Other networks", function () {
        it("Should let you define other networks", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: { other: { url: "asd" } },
          });
          chai_1.assert.deepEqual(
            config.networks.other,
            Object.assign(
              Object.assign({}, default_config_1.defaultHttpNetworkParams),
              { url: "asd" }
            )
          );
        });
        it("Should normalize the accounts' private keys", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: {
              other: {
                url: "asd",
                accounts: ["  aa00 ", "  0XaA00 "],
              },
            },
          });
          const privateKeys = config.networks.other.accounts;
          chai_1.assert.deepEqual(privateKeys, ["0xaa00", "0xaa00"]);
        });
        it("Should let you override everything", function () {
          const otherNetworkConfig = {
            url: "asd",
            timeout: 1,
            accounts: ["0x00000"],
            chainId: 123,
            from: "from",
            gas: 1,
            gasMultiplier: 1231,
            gasPrice: 2345678,
            httpHeaders: {
              header: "asd",
            },
          };
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: { other: otherNetworkConfig },
          });
          chai_1.assert.deepEqual(config.networks.other, {
            url: "asd",
            timeout: 1,
            accounts: ["0x00000"],
            chainId: 123,
            from: "from",
            gas: 1,
            gasMultiplier: 1231,
            gasPrice: 2345678,
            httpHeaders: {
              header: "asd",
            },
          });
        });
        it("Should add default values to HD accounts config objects", function () {
          const config = (0, config_resolution_1.resolveConfig)(__filename, {
            networks: { other: { url: "a", accounts: { mnemonic: "mmmmm" } } },
          });
          const httpNetConfig = config.networks.other;
          const accounts = httpNetConfig.accounts;
          chai_1.assert.deepEqual(
            accounts,
            Object.assign(
              { mnemonic: "mmmmm" },
              default_config_1.defaultHdAccountsConfigParams
            )
          );
        });
      });
    });
  });
  describe("evmVersion default", function () {
    it("Should default to paris if solc is gte 0.8.20", () => {
      var _a, _b, _c, _d, _e, _f, _g, _h;
      let config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: "0.8.20",
      });
      chai_1.assert.equal(
        (_b =
          (_a = config.solidity.compilers[0]) === null || _a === void 0
            ? void 0
            : _a.settings) === null || _b === void 0
          ? void 0
          : _b.evmVersion,
        "paris"
      );
      config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: "0.8.21",
      });
      chai_1.assert.equal(
        (_d =
          (_c = config.solidity.compilers[0]) === null || _c === void 0
            ? void 0
            : _c.settings) === null || _d === void 0
          ? void 0
          : _d.evmVersion,
        "paris"
      );
      config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.8.20" }],
          overrides: {
            "contracts/ERC20.sol": {
              version: "0.8.21",
            },
          },
        },
      });
      chai_1.assert.equal(
        (_f =
          (_e = config.solidity.compilers[0]) === null || _e === void 0
            ? void 0
            : _e.settings) === null || _f === void 0
          ? void 0
          : _f.evmVersion,
        "paris"
      );
      chai_1.assert.equal(
        (_h =
          (_g = config.solidity.overrides["contracts/ERC20.sol"]) === null ||
          _g === void 0
            ? void 0
            : _g.settings) === null || _h === void 0
          ? void 0
          : _h.evmVersion,
        "paris"
      );
    });
    it("Should use the solc default if solc is lt 0.8.20", () => {
      var _a, _b, _c, _d, _e, _f;
      let config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: "0.8.19",
      });
      chai_1.assert.isUndefined(
        (_b =
          (_a = config.solidity.compilers[0]) === null || _a === void 0
            ? void 0
            : _a.settings) === null || _b === void 0
          ? void 0
          : _b.evmVersion
      );
      config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.5.7" }],
          overrides: {
            "contracts/ERC20.sol": {
              version: "0.7.6",
            },
          },
        },
      });
      chai_1.assert.isUndefined(
        (_d =
          (_c = config.solidity.compilers[0]) === null || _c === void 0
            ? void 0
            : _c.settings) === null || _d === void 0
          ? void 0
          : _d.evmVersion
      );
      chai_1.assert.isUndefined(
        (_f =
          (_e = config.solidity.overrides["contracts/ERC20.sol"]) === null ||
          _e === void 0
            ? void 0
            : _e.settings) === null || _f === void 0
          ? void 0
          : _f.evmVersion
      );
    });
    it("Should let the user override the evmVersion", () => {
      var _a, _b, _c, _d;
      const config = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [
            { version: "0.8.20", settings: { evmVersion: "istanbul" } },
          ],
          overrides: {
            "contracts/ERC20.sol": {
              version: "0.8.21",
              settings: { evmVersion: "shanghai" },
            },
          },
        },
      });
      chai_1.assert.equal(
        (_b =
          (_a = config.solidity.compilers[0]) === null || _a === void 0
            ? void 0
            : _a.settings) === null || _b === void 0
          ? void 0
          : _b.evmVersion,
        "istanbul"
      );
      chai_1.assert.equal(
        (_d =
          (_c = config.solidity.overrides["contracts/ERC20.sol"]) === null ||
          _c === void 0
            ? void 0
            : _c.settings) === null || _d === void 0
          ? void 0
          : _d.evmVersion,
        "shanghai"
      );
    });
    describe("With a solc 0.8.20 project and default config", () => {
      (0, project_1.useFixtureProject)("project-0.8.20");
      (0, environment_1.useEnvironment)();
      it("Should not emit PUSH0 opcodes when compiling a contract with solc gte 0.8.20 and default config", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("compile");
          const source = "contracts/Lock.sol";
          const contract = "Lock";
          const [buildInfo] = getBuildInfos();
          const { output } = require(buildInfo);
          chai_1.assert.notInclude(
            output.contracts[source][contract].evm.bytecode.opcodes,
            "PUSH0"
          );
        });
      });
    });
    describe("With a solc 0.8.20 project and overriden config", () => {
      (0, project_1.useFixtureProject)("project-0.8.20-override-evm-version");
      (0, environment_1.useEnvironment)();
      it("Should emit PUSH0 opcodes when compiling a contract with solc gte 0.8.20 and overriden config", function () {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.env.run("compile");
          const source = "contracts/Lock.sol";
          const contract = "Lock";
          const [buildInfo] = getBuildInfos();
          const { output } = require(buildInfo);
          chai_1.assert.include(
            output.contracts[source][contract].evm.bytecode.opcodes,
            "PUSH0"
          );
        });
      });
    });
  });
});
