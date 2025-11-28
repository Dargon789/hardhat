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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const BigIntUtils = __importStar(require("../../../src/internal/util/bigint"));
describe("BigIntUtils", function () {
  it("min", function () {
    chai_1.assert.equal(BigIntUtils.min(-1n, -1n), -1n);
    chai_1.assert.equal(BigIntUtils.min(0n, 0n), 0n);
    chai_1.assert.equal(BigIntUtils.min(1n, 1n), 1n);
    chai_1.assert.equal(BigIntUtils.min(-1n, 0n), -1n);
    chai_1.assert.equal(BigIntUtils.min(0n, -1n), -1n);
    chai_1.assert.equal(BigIntUtils.min(-1n, 1n), -1n);
    chai_1.assert.equal(BigIntUtils.min(1n, -1n), -1n);
    chai_1.assert.equal(BigIntUtils.min(0n, 1n), 0n);
    chai_1.assert.equal(BigIntUtils.min(1n, 0n), 0n);
  });
  it("max", function () {
    chai_1.assert.equal(BigIntUtils.max(-1n, -1n), -1n);
    chai_1.assert.equal(BigIntUtils.max(0n, 0n), 0n);
    chai_1.assert.equal(BigIntUtils.max(1n, 1n), 1n);
    chai_1.assert.equal(BigIntUtils.max(-1n, 0n), 0n);
    chai_1.assert.equal(BigIntUtils.max(0n, -1n), 0n);
    chai_1.assert.equal(BigIntUtils.max(-1n, 1n), 1n);
    chai_1.assert.equal(BigIntUtils.max(1n, -1n), 1n);
    chai_1.assert.equal(BigIntUtils.max(0n, 1n), 1n);
    chai_1.assert.equal(BigIntUtils.max(1n, 0n), 1n);
  });
  it("isBigInt", function () {
    chai_1.assert.isTrue(BigIntUtils.isBigInt(0n));
    chai_1.assert.isTrue(BigIntUtils.isBigInt(BigInt(0)));
    chai_1.assert.isFalse(BigIntUtils.isBigInt(0));
    chai_1.assert.isFalse(BigIntUtils.isBigInt("0"));
    chai_1.assert.isFalse(BigIntUtils.isBigInt("0n"));
    chai_1.assert.isFalse(BigIntUtils.isBigInt({}));
  });
  it("divUp", function () {
    chai_1.assert.equal(BigIntUtils.divUp(0n, 1n), 0n);
    chai_1.assert.equal(BigIntUtils.divUp(1n, 1n), 1n);
    chai_1.assert.equal(BigIntUtils.divUp(2n, 2n), 1n);
    chai_1.assert.equal(BigIntUtils.divUp(4n, 2n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(8n, 2n), 4n);
    chai_1.assert.equal(BigIntUtils.divUp(8n, 4n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 1n), 10n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 2n), 5n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 3n), 4n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 4n), 3n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 5n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 6n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 7n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 8n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 9n), 2n);
    chai_1.assert.equal(BigIntUtils.divUp(10n, 10n), 1n);
  });
  it("cmp", function () {
    chai_1.assert.equal(BigIntUtils.cmp(-1n, -1n), 0);
    chai_1.assert.equal(BigIntUtils.cmp(0n, 0n), 0);
    chai_1.assert.equal(BigIntUtils.cmp(1n, 1n), 0);
    chai_1.assert.equal(BigIntUtils.cmp(-1n, 0n), -1);
    chai_1.assert.equal(BigIntUtils.cmp(0n, -1n), 1);
    chai_1.assert.equal(BigIntUtils.cmp(-1n, 1n), -1);
    chai_1.assert.equal(BigIntUtils.cmp(1n, -1n), 1);
    chai_1.assert.equal(BigIntUtils.cmp(0n, 1n), -1);
    chai_1.assert.equal(BigIntUtils.cmp(1n, 0n), 1);
  });
  it("toEvmWord", function () {
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(0),
      "0000000000000000000000000000000000000000000000000000000000000000"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(1),
      "0000000000000000000000000000000000000000000000000000000000000001"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(Number.MAX_SAFE_INTEGER),
      "000000000000000000000000000000000000000000000000001fffffffffffff"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(0n),
      "0000000000000000000000000000000000000000000000000000000000000000"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(1n),
      "0000000000000000000000000000000000000000000000000000000000000001"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(17n),
      "0000000000000000000000000000000000000000000000000000000000000011"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(1n + 256n + 256n ** 2n),
      "0000000000000000000000000000000000000000000000000000000000010101"
    );
    chai_1.assert.equal(
      BigIntUtils.toEvmWord(2n ** 256n - 1n),
      "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
  });
  it("fromBigIntLike", function () {
    chai_1.assert.equal(BigIntUtils.fromBigIntLike(10), 10n);
    chai_1.assert.equal(BigIntUtils.fromBigIntLike(11n), 11n);
    chai_1.assert.equal(BigIntUtils.fromBigIntLike("12"), 12n);
    chai_1.assert.equal(BigIntUtils.fromBigIntLike("0xd"), 13n);
    chai_1.assert.equal(BigIntUtils.fromBigIntLike(Buffer.from([])), 0n);
    chai_1.assert.equal(BigIntUtils.fromBigIntLike(Buffer.from([14])), 14n);
  });
  it("toHex", function () {
    chai_1.assert.equal(BigIntUtils.toHex(0), "0x0");
    chai_1.assert.equal(BigIntUtils.toHex(1), "0x1");
    chai_1.assert.equal(BigIntUtils.toHex(10), "0xa");
    chai_1.assert.equal(BigIntUtils.toHex(0n), "0x0");
    chai_1.assert.equal(BigIntUtils.toHex(1n), "0x1");
    chai_1.assert.equal(BigIntUtils.toHex(10n), "0xa");
    chai_1.assert.equal(
      BigIntUtils.toHex(2n ** 256n - 1n),
      "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff"
    );
    chai_1.assert.throws(() => BigIntUtils.toHex(-1));
    chai_1.assert.throws(() => BigIntUtils.toHex(-1n));
  });
});
