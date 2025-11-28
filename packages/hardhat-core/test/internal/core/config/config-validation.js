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
const chai_1 = require("chai");
const constants_1 = require("../../../../src/internal/constants");
const config_validation_1 = require("../../../../src/internal/core/config/config-validation");
const errors_list_1 = require("../../../../src/internal/core/errors-list");
const errors_1 = require("../../../helpers/errors");
const config_resolution_1 = require("../../../../src/internal/core/config/config-resolution");
describe("Config validation", function () {
  describe("default network config", function () {
    it("Should fail if the wrong type is used", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)({ defaultNetwork: 123 }),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
    });
  });
  describe("Solidity config", function () {
    const invalidSolidityType = {
      solidity: 123,
    };
    const invalidVersionType = {
      solidity: {
        version: 123,
      },
    };
    const invalidOptimizerType = {
      solidity: {
        optimizer: 123,
      },
    };
    const invalidOptimizerEnabledType = {
      solidity: {
        optimizer: {
          enabled: 123,
        },
      },
    };
    const invalidOptimizerRunsType = {
      solidity: {
        optimizer: {
          runs: "",
        },
      },
    };
    const invalidEvmVersionType = {
      solidity: {
        evmVersion: 123,
      },
    };
    it("Should fail with invalid types", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidSolidityType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidVersionType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidOptimizerType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () =>
          (0, config_validation_1.validateConfig)(invalidOptimizerEnabledType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidOptimizerRunsType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidEvmVersionType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
    });
    it("Shouldn't fail with an empty solc config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        solc: {},
      });
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail without a solc config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({});
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail with valid configs", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        solc: {
          version: "123",
          optimizer: {
            enabled: true,
            runs: 123,
          },
          evmVersion: "asd",
        },
      });
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail with unrecognized params", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        solc: {
          unrecognized: 123,
        },
      });
      chai_1.assert.isEmpty(errors);
    });
  });
  describe("paths config", function () {
    const invalidPathsType = {
      paths: 123,
    };
    const invalidCacheType = {
      paths: {
        cache: 123,
      },
    };
    const invalidArtifactsType = {
      paths: {
        artifacts: 123,
      },
    };
    const invalidSourcesType = {
      paths: {
        sources: 123,
      },
    };
    const invalidTestsType = {
      paths: {
        tests: 123,
      },
    };
    const invalidRootType = {
      paths: {
        root: 123,
      },
    };
    it("Should fail with invalid types", function () {
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidPathsType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidCacheType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidArtifactsType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidRootType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidSourcesType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateConfig)(invalidTestsType),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
      );
    });
    it("Shouldn't fail with an empty paths config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        paths: {},
      });
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail without a paths config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({});
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail with valid paths configs", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        paths: {
          root: "root",
          cache: "cache",
          artifacts: "artifacts",
          sources: "sources",
          tests: "tests",
        },
      });
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail with unrecognized params", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        paths: {
          unrecognized: 123,
        },
      });
      chai_1.assert.isEmpty(errors);
    });
  });
  describe("networks config", function () {
    describe("Invalid types", function () {
      describe("Networks object", function () {
        it("Should fail with invalid types", function () {
          (0, errors_1.expectHardhatError)(
            () => (0, config_validation_1.validateConfig)({ networks: 123 }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  asd: 123,
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
        });
      });
      /**
       * This describe block will encompass all private key tests
       * for both Hardhat and HTTP networks
       */
      describe("Private key config", function () {
        describe("HTTP network accounts", function () {
          it("Should allow an array of valid private keys", function () {
            (0, config_validation_1.validateConfig)({
              networks: {
                custom: {
                  url: "http://127.0.0.1",
                  accounts: [
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                    "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                    "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                  ],
                },
              },
            });
          });
          it("Should allow valid private keys with missing hex prefix", function () {
            (0, config_validation_1.validateConfig)({
              networks: {
                custom: {
                  url: "http://127.0.0.1",
                  accounts: [
                    "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  ],
                },
              },
            });
          });
          it("Should not allow hex literals", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      accounts: [
                        0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should not allow private keys of incorrect length", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      accounts: ["0xaaaa"],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      accounts: [
                        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabb",
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should not allow invalid private keys", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      accounts: [
                        "0xgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
        describe("Hardhat Network accounts", function () {
          it("Should allow an array of account objects with valid private keys", function () {
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: [
                    {
                      balance: "123",
                      privateKey:
                        "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                    },
                    {
                      balance: "123",
                      privateKey:
                        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                    },
                    {
                      balance: "123",
                      privateKey:
                        "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                    },
                  ],
                },
              },
            });
          });
          it("Should allow valid private keys with missing hex prefix", function () {
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: [
                    {
                      balance: "123",
                      privateKey:
                        "aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                    },
                  ],
                },
              },
            });
          });
          it("Should not allow an array that contains a value that is not an object", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: [
                        {
                          balance: "123",
                          privateKey:
                            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                        },
                        "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
                        {
                          balance: "123",
                          privateKey:
                            "0xcccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccccc",
                        },
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should not allow hex literals", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: [
                        {
                          balance: "123",
                          privateKey: 0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa,
                        },
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should not allow private keys of incorrect length", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: [
                        {
                          balance: "123",
                          privateKey: "0xaaaa",
                        },
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: [
                        {
                          balance: "123",
                          privateKey:
                            "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaabbbb",
                        },
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should not allow invalid private keys", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: [
                        {
                          balance: "123",
                          privateKey:
                            "0xgggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggggg",
                        },
                      ],
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
      });
      describe("Hardhat Network config", function () {
        it("Should fail with invalid types", function () {
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: 123,
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    chainId: "asd",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    hardfork: "not-supported",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    throwOnCallFailures: "a",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    throwOnTransactionFailures: "a",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    from: 123,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    gas: "asdasd",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    gasPrice: "6789",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    gasMultiplier: "123",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    blockGasLimit: "asd",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    minGasPrice: [],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: 123,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{}],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ balance: "" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: 123 }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ balance: 213 }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "0xxxxx", balance: 213 }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "0xxxxx", balance: "0.1231" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "0xxxxx", balance: "001231" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "0xxxxx", balance: ".02123" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    accounts: [{ privateKey: "0xxxxx", balance: "-123" }],
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    loggingEnabled: 123,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    loggingEnabled: "a",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          // Non boolean allowUnlimitedContractSize
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    allowUnlimitedContractSize: "a",
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          // Non string initialDate
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    initialDate: 123,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          // Invalid forking settings
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    forking: 123,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    forking: {},
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    forking: { url: 123 },
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    forking: { url: "asd", blockNumber: "asd" },
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    forking: { url: "asd", blockNumber: 123, enabled: 123 },
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
        });
        describe("HardhatNetworkHDAccounstConfig", function () {
          it("Should accept a valid HD config", function () {
            let hdConfig = {
              mnemonic: "asd",
            };
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: hdConfig,
                },
              },
            });
            hdConfig = {
              mnemonic: "asd",
              accountsBalance: "123",
              count: 123,
              initialIndex: 1,
              path: "m/1/2",
            };
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: hdConfig,
                },
              },
            });
            hdConfig = {
              mnemonic: "asd",
              accountsBalance: "123",
              count: 123,
              initialIndex: 1,
              path: "m/1/2",
              passphrase: "this is a secret",
            };
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: hdConfig,
                },
              },
            });
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  accounts: {},
                },
              },
            });
          });
          it("Should fail with invalid types", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: {
                        mnemonic: 123,
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: {
                        initialIndex: "asd",
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: {
                        count: "asd",
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: {
                        path: 123,
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      accounts: {
                        mnemonic: "asd",
                        accountsBalance: {},
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
        describe("HardhatNetworkMempoolConfig", function () {
          it("Should accept a valid Mempool config", function () {
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  mining: {
                    auto: true,
                    interval: 0,
                  },
                },
              },
            });
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  mining: {
                    auto: true,
                    interval: [10, 100],
                  },
                },
              },
            });
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  mining: {
                    mempool: {
                      order: "priority",
                    },
                  },
                },
              },
            });
            (0, config_validation_1.validateConfig)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: {
                  mining: {
                    mempool: {
                      order: "fifo",
                    },
                  },
                },
              },
            });
          });
          it("Should fail with invalid types", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      mining: {
                        auto: "not-supported",
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      mining: {
                        auto: true,
                        interval: "not-supported",
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      mining: {
                        mempool: {
                          order: "not-supported",
                        },
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
        describe("Hardhat network's coinbase", function () {
          it("Should fail if it's not a valid address", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      coinbase: "0x123",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      coinbase: 123,
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    [constants_1.HARDHAT_NETWORK_NAME]: {
                      coinbase: "123",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should accept an optional address", function () {
            chai_1.assert.isEmpty(
              (0, config_validation_1.getValidationErrors)({
                networks: {
                  [constants_1.HARDHAT_NETWORK_NAME]: {
                    coinbase: "   0x0000000000000000000000000000000000000001  ",
                  },
                },
              })
            );
          });
        });
      });
      describe("HTTP network config", function () {
        describe("Url field", function () {
          it("Should fail if no url is set for custom networks", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: { custom: {} },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Shouldn't fail if no url is set for localhost network", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: { localhost: {} },
            });
            chai_1.assert.isEmpty(errors);
          });
          it("Should fail if url is set for hardhat network (undefined)", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: { url: undefined },
              },
            });
            chai_1.assert.isNotEmpty(errors);
          });
          it("Should fail if url is set for hardhat network", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: {
                [constants_1.HARDHAT_NETWORK_NAME]: { url: "anyurl" },
              },
            });
            chai_1.assert.isNotEmpty(errors);
          });
          it("Shouldn't fail if no url is set for hardhat network", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: { [constants_1.HARDHAT_NETWORK_NAME]: {} },
            });
            chai_1.assert.isEmpty(errors);
          });
        });
        describe("HttpHeaders", function () {
          it("Should be optional", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: {
                custom: {
                  url: "http://127.0.0.1",
                },
              },
            });
            chai_1.assert.isEmpty(errors);
          });
          it("Should accept a mapping of strings to strings", function () {
            const errors = (0, config_validation_1.getValidationErrors)({
              networks: {
                custom: {
                  url: "http://127.0.0.1",
                  httpHeaders: {
                    a: "asd",
                    b: "a",
                  },
                },
              },
            });
            chai_1.assert.isEmpty(errors);
          });
          it("Should reject other types", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      httpHeaders: 123,
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      httpHeaders: "123",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          it("Should reject non-string values", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      httpHeaders: {
                        a: "a",
                        b: 123,
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    custom: {
                      url: "http://127.0.0.1",
                      httpHeaders: {
                        a: "a",
                        b: false,
                      },
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
        describe("Accounts field", function () {
          it("Shouldn't work with invalid types", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      accounts: 123,
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      accounts: {},
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      accounts: { asd: 123 },
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
          describe("HDAccounstConfig", function () {
            it("Should fail with invalid types", function () {
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: {
                          mnemonic: 123,
                        },
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: {
                          initialIndex: "asd",
                        },
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: {
                          count: "asd",
                        },
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: {
                          path: 123,
                        },
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
            });
          });
          describe("OtherAccountsConfig", function () {
            it("Should fail with invalid types", function () {
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: {
                          type: 123,
                        },
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
            });
          });
          describe("List of private keys", function () {
            it("Shouldn't work with invalid types", function () {
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: [123],
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
            });
          });
          describe("Remote accounts", function () {
            it("Should work with accounts: remote", function () {
              chai_1.assert.isEmpty(
                (0, config_validation_1.getValidationErrors)({
                  networks: {
                    asd: {
                      accounts: "remote",
                      url: "",
                    },
                  },
                })
              );
            });
            it("Shouldn't work with other strings", function () {
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      asd: {
                        accounts: "asd",
                        url: "",
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
            });
          });
        });
        describe("Other fields", function () {
          it("Shouldn't accept invalid types", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      url: "",
                      timeout: "asd",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      chainId: "",
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      from: 123,
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      gas: "asdsad",
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      gasPrice: "asdsad",
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      gasMultiplier: "asdsad",
                      url: "",
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    asd: {
                      url: false,
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
      });
    });
    it("Shouldn't fail with an empty networks config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        networks: {},
      });
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail without a networks config", function () {
      const errors = (0, config_validation_1.getValidationErrors)({});
      chai_1.assert.isEmpty(errors);
    });
    it("Shouldn't fail with valid networks configs", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        networks: {
          commonThings: {
            chainId: 1,
            from: "0x0001",
            gas: "auto",
            gasPrice: "auto",
            gasMultiplier: 123,
            url: "",
          },
          [constants_1.HARDHAT_NETWORK_NAME]: {
            gas: 678,
            gasPrice: 123,
            blockGasLimit: 8000,
            accounts: [
              {
                balance: "123",
                privateKey:
                  "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              },
            ],
            forking: {
              url: "asd",
              blockNumber: 123,
            },
          },
          localhost: {
            gas: 678,
            gasPrice: 123,
            url: "",
          },
          withRemoteAccounts: {
            accounts: "remote",
            url: "",
          },
          withPrivateKeys: {
            accounts: [
              "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
              "0xbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb",
            ],
            url: "",
          },
          withHdKeys: {
            accounts: {
              mnemonic: "asd asd asd",
              initialIndex: 0,
              count: 123,
              path: "m/123",
            },
            url: "",
          },
        },
      });
      chai_1.assert.deepEqual(errors, []);
      chai_1.assert.deepEqual(
        (0, config_validation_1.getValidationErrors)({
          networks: {
            [constants_1.HARDHAT_NETWORK_NAME]: {
              accounts: [
                {
                  privateKey:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  balance: "0",
                },
              ],
            },
          },
        }),
        []
      );
      chai_1.assert.deepEqual(
        (0, config_validation_1.getValidationErrors)({
          networks: {
            [constants_1.HARDHAT_NETWORK_NAME]: {
              accounts: [
                {
                  privateKey:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  balance: "1",
                },
              ],
            },
          },
        }),
        []
      );
      chai_1.assert.deepEqual(
        (0, config_validation_1.getValidationErrors)({
          networks: {
            [constants_1.HARDHAT_NETWORK_NAME]: {
              accounts: [
                {
                  privateKey:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  balance: "100123",
                },
              ],
            },
          },
        }),
        []
      );
      chai_1.assert.deepEqual(
        (0, config_validation_1.getValidationErrors)({
          networks: {
            [constants_1.HARDHAT_NETWORK_NAME]: {
              accounts: [
                {
                  privateKey:
                    "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa",
                  balance: "12300000000123",
                },
              ],
            },
          },
        }),
        []
      );
      chai_1.assert.deepEqual(
        (0, config_validation_1.getValidationErrors)({
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
          unknown: {
            asd: 123,
            url: "",
          },
        }),
        []
      );
    });
    it("Shouldn't fail with unrecognized params", function () {
      const errors = (0, config_validation_1.getValidationErrors)({
        networks: {
          localhost: {
            asd: 1232,
          },
          [constants_1.HARDHAT_NETWORK_NAME]: {
            asdasd: "123",
          },
        },
      });
      chai_1.assert.isEmpty(errors);
    });
    describe("London-specific fields and validations", function () {
      describe("Hardhat network", function () {
        describe("When using a hardfork before London", function () {
          it("Should throw if an initialBaseFeePerGas is used", function () {
            (0, errors_1.expectHardhatError)(
              () =>
                (0, config_validation_1.validateConfig)({
                  networks: {
                    hardhat: {
                      hardfork: "berlin",
                      initialBaseFeePerGas: 123,
                    },
                  },
                }),
              errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
            );
          });
        });
        describe("When using London or later", function () {
          for (const hardfork of ["london", "arrowGlacier"]) {
            it(`Should throw if minGasPrice is used when ${hardfork} is activated`, function () {
              (0, errors_1.expectHardhatError)(
                () =>
                  (0, config_validation_1.validateConfig)({
                    networks: {
                      hardhat: {
                        hardfork,
                        minGasPrice: 123,
                      },
                    },
                  }),
                errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
              );
            });
          }
        });
      });
    });
    describe("Hardfork history usage", function () {
      it("Should validate good config", function () {
        (0, config_validation_1.validateConfig)({
          networks: {
            hardhat: {
              chains: {
                1: {
                  hardforkHistory: {
                    berlin: 12965000 - 1000,
                    london: 12965000,
                  },
                },
              },
            },
          },
        });
      });
      it("Should validate good config with chainId as a string", function () {
        (0, config_validation_1.validateConfig)({
          networks: {
            hardhat: {
              chains: {
                1: {
                  hardforkHistory: {
                    berlin: 12965000 - 1000,
                    london: 12965000,
                  },
                },
              },
            },
          },
        });
      });
      it("should reject an invalid hardfork name", function () {
        (0, errors_1.expectHardhatError)(() => {
          (0, config_validation_1.validateConfig)({
            networks: {
              hardhat: {
                chains: {
                  1: { hardforkHistory: { bogusHardforkName: 12965000 } },
                },
              },
            },
          });
        }, errors_list_1.ERRORS.GENERAL.INVALID_CONFIG);
      });
    });
    describe("enableTransientStorage", function () {
      it("should fail if enableTransientStorage is enabled and the hardfork is not cancun", function () {
        return __awaiter(this, void 0, void 0, function* () {
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  hardhat: {
                    hardfork: "shanghai",
                    enableTransientStorage: true,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
        });
      });
      it("should fail if enableTransientStorage is disabled and the hardfork is cancun", function () {
        return __awaiter(this, void 0, void 0, function* () {
          (0, errors_1.expectHardhatError)(
            () =>
              (0, config_validation_1.validateConfig)({
                networks: {
                  hardhat: {
                    hardfork: "cancun",
                    enableTransientStorage: false,
                  },
                },
              }),
            errors_list_1.ERRORS.GENERAL.INVALID_CONFIG
          );
        });
      });
      it("shouldn't fail if only the hardfork or only enableTransientStorage are set", function () {
        return __awaiter(this, void 0, void 0, function* () {
          (0, config_validation_1.validateConfig)({
            networks: {
              hardhat: {
                hardfork: "shanghai",
              },
            },
          });
          (0, config_validation_1.validateConfig)({
            networks: {
              hardhat: {
                hardfork: "cancun",
              },
            },
          });
          (0, config_validation_1.validateConfig)({
            networks: {
              hardhat: {
                enableTransientStorage: true,
              },
            },
          });
          (0, config_validation_1.validateConfig)({
            networks: {
              hardhat: {
                enableTransientStorage: false,
              },
            },
          });
        });
      });
    });
  });
  describe("Resolved Config validation", function () {
    it("Should fail if the optimizer runs has invalid number", function () {
      const optimizer = {
        enabled: true,
        runs: 2 ** 32,
      };
      const resolved = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.6.7", settings: { optimizer } }],
        },
      });
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateResolvedConfig)(resolved),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG,
        "The number of optimizer runs exceeds the maximum of 2**32 - 1"
      );
    });
    it("Shouldn't fail if the optimizer has a valid runs", function () {
      const optimizer = {
        enabled: true,
        runs: 123,
      };
      const resolved = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.6.7", settings: { optimizer } }],
        },
      });
      (0, config_validation_1.validateResolvedConfig)(resolved);
    });
    it("Should allow using the maximum number of runs", function () {
      const optimizer = {
        enabled: true,
        runs: 2 ** 32 - 1,
      };
      const resolved = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.6.7", settings: { optimizer } }],
        },
      });
      (0, config_validation_1.validateResolvedConfig)(resolved);
    });
    it("Shouldn't fail if the optimizer doesn't have run config", function () {
      const optimizer = {
        enabled: true,
      };
      const resolved = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.6.7", settings: { optimizer } }],
        },
      });
      (0, config_validation_1.validateResolvedConfig)(resolved);
    });
    it("Should fail if the optimizer runs has invalid number in overrides config", function () {
      const optimizer = {
        enabled: true,
        runs: 2 ** 32,
      };
      const resolved = (0, config_resolution_1.resolveConfig)(__filename, {
        solidity: {
          compilers: [{ version: "0.6.7" }],
          overrides: {
            "contracts/Foo.sol": {
              version: "0.6.7",
              settings: {
                optimizer,
              },
            },
          },
        },
      });
      (0, errors_1.expectHardhatError)(
        () => (0, config_validation_1.validateResolvedConfig)(resolved),
        errors_list_1.ERRORS.GENERAL.INVALID_CONFIG,
        "The number of optimizer runs exceeds the maximum of 2**32 - 1"
      );
    });
  });
});
