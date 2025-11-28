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
const util_1 = require("@ethereumjs/util");
const chai_1 = require("chai");
const fs_extra_1 = __importDefault(require("fs-extra"));
const sinon_1 = __importDefault(require("sinon"));
const client_1 = require("../../../../src/internal/hardhat-network/jsonrpc/client");
const random_1 = require("../../../../src/internal/hardhat-network/provider/utils/random");
const makeForkClient_1 = require("../../../../src/internal/hardhat-network/provider/utils/makeForkClient");
const fs_1 = require("../../../helpers/fs");
const workaround_windows_ci_failures_1 = require("../../../utils/workaround-windows-ci-failures");
const constants_1 = require("../helpers/constants");
const providers_1 = require("../helpers/providers");
function toBuffer(x) {
  return Buffer.from((0, util_1.toBytes)(x));
}
function assertBufferContents(buff, hexEncodedContents) {
  chai_1.assert.isTrue(
    hexEncodedContents.startsWith("0x"),
    "The contents should be 0x-prefixed hex encoded"
  );
  chai_1.assert.equal(
    buff.toString("hex").toLowerCase(),
    hexEncodedContents.substring(2).toLowerCase()
  );
}
describe("JsonRpcClient", () => {
  describe("Using fake providers", function () {
    describe("Caching", () => {
      const response1 =
        "0x00000000000000000000000000000000000000000067bafa8fb7228f04ffa792";
      const response2 =
        "0x00000000000000000000000000000000000000000067bafa8fb7228f04ffa793";
      let fakeProvider;
      let clientWithFakeProvider;
      function getStorageAt(blockNumber) {
        return clientWithFakeProvider.getStorageAt(
          constants_1.DAI_ADDRESS,
          (0, util_1.bytesToBigInt)(
            constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
          ),
          blockNumber
        );
      }
      beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
          fakeProvider = {
            request: sinon_1.default
              .stub()
              .onFirstCall()
              .resolves(response1)
              .onSecondCall()
              .resolves(response2),
            url: "fake",
            sendBatch: () => Promise.resolve([]),
          };
        });
      });
      it("Doesn't cache things for blocks that can be reorg'd out", () =>
        __awaiter(this, void 0, void 0, function* () {
          clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          assertBufferContents(yield getStorageAt(121n), response1);
          assertBufferContents(yield getStorageAt(121n), response2);
          chai_1.assert.isTrue(fakeProvider.request.calledTwice);
        }));
      it("caches fetched data when its safe", () =>
        __awaiter(this, void 0, void 0, function* () {
          clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          assertBufferContents(yield getStorageAt(120n), response1);
          assertBufferContents(yield getStorageAt(120n), response1);
          chai_1.assert.isTrue(fakeProvider.request.calledOnce);
        }));
      it("is parameter aware", () =>
        __awaiter(this, void 0, void 0, function* () {
          clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          assertBufferContents(yield getStorageAt(110n), response1);
          assertBufferContents(yield getStorageAt(120n), response2);
          assertBufferContents(yield getStorageAt(110n), response1);
          assertBufferContents(yield getStorageAt(120n), response2);
          chai_1.assert.isTrue(fakeProvider.request.calledTwice);
        }));
      describe("Disk caching", () => {
        (0, fs_1.useTmpDir)("hardhat-network-forking-disk-cache");
        beforeEach(function () {
          clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n,
            this.tmpDir
          );
        });
        function makeCall() {
          return __awaiter(this, void 0, void 0, function* () {
            assertBufferContents(yield getStorageAt(120n), response1);
            chai_1.assert.isTrue(fakeProvider.request.calledOnce);
          });
        }
        it("Stores to disk after a request", function () {
          return __awaiter(this, void 0, void 0, function* () {
            yield makeCall();
            chai_1.assert.lengthOf(
              yield fs_extra_1.default.readdir(this.tmpDir),
              1
            );
          });
        });
        it("Reads from disk if available, not making any request a request", function () {
          return __awaiter(this, void 0, void 0, function* () {
            // We make a first call with the disk caching enabled, this will populate the disk
            // cache, and also the in-memory one
            yield makeCall();
            chai_1.assert.isTrue(fakeProvider.request.calledOnce);
            // We create a new client, using the same cache dir, but with an empty in-memory cache.
            // It should read from the disk, instead of making a new request.
            clientWithFakeProvider = new client_1.JsonRpcClient(
              fakeProvider,
              1,
              123n,
              3n,
              this.tmpDir
            );
            yield makeCall();
            // We created a new client, but used the same provider, so it was already called once.
            chai_1.assert.isTrue(fakeProvider.request.calledOnce);
          });
        });
      });
    });
    describe("Retry on Infura's error", () => {
      const fakeInfuraUrl = "http://infura.com";
      const response =
        "0x00000000000000000000000000000000000000000067bafa8fb7228f04ffa792";
      it("makes a retry on the 'header not found' error", () =>
        __awaiter(this, void 0, void 0, function* () {
          const fakeProvider = {
            url: fakeInfuraUrl,
            request: sinon_1.default
              .stub()
              .onFirstCall()
              .rejects(new Error("header not found"))
              .onSecondCall()
              .resolves(response),
            sendBatch: () => Promise.resolve([]),
          };
          const clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          const value = yield clientWithFakeProvider.getStorageAt(
            constants_1.DAI_ADDRESS,
            (0, util_1.bytesToBigInt)(
              constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
            ),
            120n
          );
          chai_1.assert.equal(fakeProvider.request.callCount, 2);
          chai_1.assert.isTrue(value.equals(toBuffer(response)));
        }));
      it("does not retry more than once", () =>
        __awaiter(this, void 0, void 0, function* () {
          const fakeProvider = {
            url: fakeInfuraUrl,
            request: sinon_1.default
              .stub()
              .onFirstCall()
              .rejects(new Error("header not found"))
              .onSecondCall()
              .rejects(new Error("header not found"))
              .onThirdCall()
              .resolves(response),
            sendBatch: () => Promise.resolve([]),
          };
          const clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          yield chai_1.assert.isRejected(
            clientWithFakeProvider.getStorageAt(
              constants_1.DAI_ADDRESS,
              (0, util_1.bytesToBigInt)(
                constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
              ),
              120n
            ),
            "header not found"
          );
        }));
      it("does not retry on a different error", () =>
        __awaiter(this, void 0, void 0, function* () {
          const fakeProvider = {
            url: fakeInfuraUrl,
            request: sinon_1.default
              .stub()
              .onFirstCall()
              .rejects(new Error("different error"))
              .onSecondCall()
              .resolves(response),
            sendBatch: () => Promise.resolve([]),
          };
          const clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          yield chai_1.assert.isRejected(
            clientWithFakeProvider.getStorageAt(
              constants_1.DAI_ADDRESS,
              (0, util_1.bytesToBigInt)(
                constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
              ),
              120n
            ),
            "different error"
          );
        }));
      it("does not retry when other RPC provider is used", () =>
        __awaiter(this, void 0, void 0, function* () {
          const fakeProvider = {
            url: "other",
            request: sinon_1.default
              .stub()
              .onFirstCall()
              .rejects(new Error("header not found"))
              .onSecondCall()
              .resolves(response),
            sendBatch: () => Promise.resolve([]),
          };
          const clientWithFakeProvider = new client_1.JsonRpcClient(
            fakeProvider,
            1,
            123n,
            3n
          );
          yield chai_1.assert.isRejected(
            clientWithFakeProvider.getStorageAt(
              constants_1.DAI_ADDRESS,
              (0, util_1.bytesToBigInt)(
                constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
              ),
              120n
            ),
            "header not found"
          );
        }));
    });
  });
  describe("Using actual providers", function () {
    providers_1.FORKED_PROVIDERS.forEach(({ rpcProvider, jsonRpcUrl }) => {
      workaround_windows_ci_failures_1.workaroundWindowsCiFailures.call(this, {
        isFork: true,
      });
      describe(`Using ${rpcProvider}`, () => {
        let client;
        let forkNumber;
        beforeEach(() =>
          __awaiter(this, void 0, void 0, function* () {
            const clientResult = yield (0, makeForkClient_1.makeForkClient)({
              jsonRpcUrl,
            });
            client = clientResult.forkClient;
            forkNumber = clientResult.forkBlockNumber;
          })
        );
        describe("Basic tests", () => {
          it("can be constructed", () => {
            chai_1.assert.instanceOf(client, client_1.JsonRpcClient);
          });
          it("can actually fetch real json-rpc", () =>
            __awaiter(this, void 0, void 0, function* () {
              // This is just a random tx from mainnet
              const tx = yield client.getTransactionByHash(
                toBuffer(
                  "0xc008e9f9bb92057dd0035496fbf4fb54f66b4b18b370928e46d6603933054d5a"
                )
              );
              const blockNumber =
                tx === null || tx === void 0 ? void 0 : tx.blockNumber;
              if (blockNumber === null || blockNumber === undefined) {
                chai_1.assert.fail();
              }
              chai_1.assert.isTrue(blockNumber >= 10964958n);
            }));
        });
        describe("eth_getBlockByNumber", () => {
          it("can fetch the data with transaction hashes", () =>
            __awaiter(this, void 0, void 0, function* () {
              var _a;
              const block = yield client.getBlockByNumber(
                constants_1.BLOCK_NUMBER_OF_10496585
              );
              chai_1.assert.isTrue(
                (_a =
                  block === null || block === void 0 ? void 0 : block.hash) ===
                  null || _a === void 0
                  ? void 0
                  : _a.equals(constants_1.BLOCK_HASH_OF_10496585)
              );
              chai_1.assert.equal(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.length,
                192
              );
              chai_1.assert.isTrue(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.every((tx) => tx instanceof Buffer)
              );
            }));
          it("can fetch the data with transactions", () =>
            __awaiter(this, void 0, void 0, function* () {
              const block = yield client.getBlockByNumber(
                constants_1.BLOCK_NUMBER_OF_10496585,
                true
              );
              chai_1.assert.isTrue(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.every((tx) => !(tx instanceof Buffer))
              );
            }));
          it("returns null for non-existent block", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const block = yield client.getBlockByNumber(
                forkNumber + 1000n,
                true
              );
              chai_1.assert.isNull(block);
            });
          });
        });
        describe("eth_getBlockByHash", () => {
          it("can fetch the data with transaction hashes", () =>
            __awaiter(this, void 0, void 0, function* () {
              var _a;
              const block = yield client.getBlockByHash(
                constants_1.BLOCK_HASH_OF_10496585
              );
              chai_1.assert.isTrue(
                (_a =
                  block === null || block === void 0 ? void 0 : block.hash) ===
                  null || _a === void 0
                  ? void 0
                  : _a.equals(constants_1.BLOCK_HASH_OF_10496585)
              );
              chai_1.assert.equal(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.length,
                192
              );
              chai_1.assert.isTrue(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.every((tx) => tx instanceof Buffer)
              );
            }));
          it("can fetch the data with transactions", () =>
            __awaiter(this, void 0, void 0, function* () {
              const block = yield client.getBlockByHash(
                constants_1.BLOCK_HASH_OF_10496585,
                true
              );
              chai_1.assert.isTrue(
                block === null || block === void 0
                  ? void 0
                  : block.transactions.every((tx) => !(tx instanceof Buffer))
              );
            }));
          it("returns null for non-existent block", () =>
            __awaiter(this, void 0, void 0, function* () {
              const block = yield client.getBlockByHash(
                Buffer.from((0, random_1.randomHashBuffer)()),
                true
              );
              chai_1.assert.isNull(block);
            }));
        });
        describe("eth_getStorageAt", () => {
          it("can fetch value from storage of an existing contract", () =>
            __awaiter(this, void 0, void 0, function* () {
              const totalSupply = yield client.getStorageAt(
                constants_1.DAI_ADDRESS,
                (0, util_1.bytesToBigInt)(
                  constants_1.DAI_TOTAL_SUPPLY_STORAGE_POSITION
                ),
                forkNumber
              );
              const totalSupplyBN = (0, util_1.bytesToBigInt)(totalSupply);
              chai_1.assert.isTrue(totalSupplyBN > 0n);
            }));
          it("can fetch empty value from storage of an existing contract", () =>
            __awaiter(this, void 0, void 0, function* () {
              const value = yield client.getStorageAt(
                constants_1.DAI_ADDRESS,
                BigInt("0xbaddcafe"),
                forkNumber
              );
              const valueBN = (0, util_1.bytesToBigInt)(value);
              chai_1.assert.isTrue(valueBN === 0n);
            }));
          it("can fetch empty value from storage of a non-existent contract", () =>
            __awaiter(this, void 0, void 0, function* () {
              const value = yield client.getStorageAt(
                constants_1.EMPTY_ACCOUNT_ADDRESS,
                1n,
                forkNumber
              );
              const valueBN = (0, util_1.bytesToBigInt)(value);
              chai_1.assert.isTrue(valueBN === 0n);
            }));
        });
        describe("getTransactionByHash", () => {
          it("can fetch existing transactions", () =>
            __awaiter(this, void 0, void 0, function* () {
              var _a;
              const transaction = yield client.getTransactionByHash(
                constants_1.FIRST_TX_HASH_OF_10496585
              );
              chai_1.assert.isTrue(
                transaction === null || transaction === void 0
                  ? void 0
                  : transaction.hash.equals(
                      constants_1.FIRST_TX_HASH_OF_10496585
                    )
              );
              chai_1.assert.isTrue(
                (_a =
                  transaction === null || transaction === void 0
                    ? void 0
                    : transaction.blockHash) === null || _a === void 0
                  ? void 0
                  : _a.equals(constants_1.BLOCK_HASH_OF_10496585)
              );
            }));
          it("returns null for non-existent transactions", () =>
            __awaiter(this, void 0, void 0, function* () {
              const transaction = yield client.getTransactionByHash(
                Buffer.from((0, random_1.randomHashBuffer)())
              );
              chai_1.assert.equal(transaction, null);
            }));
        });
        describe("getTransactionReceipt", () => {
          it("can fetch existing receipts", () =>
            __awaiter(this, void 0, void 0, function* () {
              var _a;
              const receipt = yield client.getTransactionReceipt(
                constants_1.FIRST_TX_HASH_OF_10496585
              );
              chai_1.assert.isTrue(
                receipt === null || receipt === void 0
                  ? void 0
                  : receipt.transactionHash.equals(
                      constants_1.FIRST_TX_HASH_OF_10496585
                    )
              );
              chai_1.assert.isTrue(
                (receipt === null || receipt === void 0
                  ? void 0
                  : receipt.transactionIndex) === 0n
              );
              chai_1.assert.isTrue(
                (_a =
                  receipt === null || receipt === void 0
                    ? void 0
                    : receipt.blockHash) === null || _a === void 0
                  ? void 0
                  : _a.equals(constants_1.BLOCK_HASH_OF_10496585)
              );
              chai_1.assert.isTrue(
                (receipt === null || receipt === void 0
                  ? void 0
                  : receipt.blockNumber) ===
                  constants_1.BLOCK_NUMBER_OF_10496585
              );
            }));
          it("returns null for non-existent transactions", () =>
            __awaiter(this, void 0, void 0, function* () {
              const transaction = yield client.getTransactionReceipt(
                Buffer.from((0, random_1.randomHashBuffer)())
              );
              chai_1.assert.equal(transaction, null);
            }));
        });
        describe("getLogs", () => {
          it("can fetch existing logs", () =>
            __awaiter(this, void 0, void 0, function* () {
              const logs = yield client.getLogs({
                fromBlock: constants_1.BLOCK_NUMBER_OF_10496585,
                toBlock: constants_1.BLOCK_NUMBER_OF_10496585,
                address: toBuffer("0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"),
              });
              chai_1.assert.equal(logs.length, 12);
            }));
        });
        describe("getAccountData", () => {
          it("Should return the right data", function () {
            return __awaiter(this, void 0, void 0, function* () {
              const data = yield client.getAccountData(
                constants_1.DAI_ADDRESS,
                forkNumber
              );
              chai_1.assert.equal(data.balance, 0n);
              chai_1.assert.equal(data.transactionCount, 1n);
              chai_1.assert.lengthOf(
                data.code,
                constants_1.DAI_CONTRACT_LENGTH
              );
            });
          });
        });
      });
    });
  });
});
