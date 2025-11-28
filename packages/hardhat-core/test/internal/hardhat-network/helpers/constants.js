"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORK_TESTS_CACHE_PATH =
  exports.NULL_BYTES_32 =
  exports.LAST_TX_HASH_OF_10496585 =
  exports.FIRST_TX_HASH_OF_10496585 =
  exports.TOTAL_DIFFICULTY_OF_BLOCK_10496585 =
  exports.BLOCK_HASH_OF_10496585 =
  exports.BLOCK_NUMBER_OF_10496585 =
  exports.DAI_TOTAL_SUPPLY_STORAGE_POSITION =
  exports.BITFINEX_WALLET_ADDRESS =
  exports.EMPTY_ACCOUNT_ADDRESS =
  exports.UNISWAP_FACTORY_ADDRESS =
  exports.WETH_ADDRESS =
  exports.DAI_CONTRACT_LENGTH =
  exports.DAI_ADDRESS =
    void 0;
// reused from ethers.js
const util_1 = require("@ethereumjs/util");
const path_1 = __importDefault(require("path"));
function toBuffer(x) {
  return Buffer.from((0, util_1.toBytes)(x));
}
exports.DAI_ADDRESS = util_1.Address.fromString(
  "0x6b175474e89094c44da98b954eedeac495271d0f"
);
exports.DAI_CONTRACT_LENGTH = 7904;
exports.WETH_ADDRESS = util_1.Address.fromString(
  "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
);
exports.UNISWAP_FACTORY_ADDRESS = util_1.Address.fromString(
  "0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95"
);
exports.EMPTY_ACCOUNT_ADDRESS = util_1.Address.fromString(
  "0x246a566a96ae9fa8dcf04d4c6c094c7c492f018f"
);
// top Ether holder as of 24.08.2020
exports.BITFINEX_WALLET_ADDRESS = util_1.Address.fromString(
  "0x742d35Cc6634C0532925a3b844Bc454e4438f44e"
);
exports.DAI_TOTAL_SUPPLY_STORAGE_POSITION = toBuffer(`0x${"0".repeat(63)}1`);
// 10496585 block number was chosen for no particular reason
exports.BLOCK_NUMBER_OF_10496585 = 10496585n;
exports.BLOCK_HASH_OF_10496585 = toBuffer(
  "0x71d5e7c8ff9ea737034c16e333a75575a4a94d29482e0c2b88f0a6a8369c1812"
);
exports.TOTAL_DIFFICULTY_OF_BLOCK_10496585 = 16430631039734293348166n;
exports.FIRST_TX_HASH_OF_10496585 = toBuffer(
  "0xed0b0b132bd693ef34a72084f090df07c5c3a2ec019d76316da040d4222cdfb8"
);
exports.LAST_TX_HASH_OF_10496585 = toBuffer(
  "0xd809fb6f7060abc8de068c7a38e9b2b04530baf0cc4ce9a2420d59388be10ee7"
);
exports.NULL_BYTES_32 = toBuffer(`0x${"0".repeat(64)}`);
exports.FORK_TESTS_CACHE_PATH = path_1.default.join(
  __dirname,
  "..",
  "provider",
  ".hardhat_node_test_cache"
);
