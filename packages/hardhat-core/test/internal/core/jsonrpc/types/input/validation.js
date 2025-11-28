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
const util_1 = require("@ethereumjs/util");
const chai_1 = require("chai");
const t = __importStar(require("io-ts"));
const base_types_1 = require("../../../../../../src/internal/core/jsonrpc/types/base-types");
const blockTag_1 = require("../../../../../../src/internal/core/jsonrpc/types/input/blockTag");
const validation_1 = require("../../../../../../src/internal/core/jsonrpc/types/input/validation");
const errors_1 = require("../../../../../../src/internal/core/providers/errors");
function toBuffer(x) {
  return Buffer.from((0, util_1.toBytes)(x));
}
describe("validateParams", function () {
  describe("0-arguments", function () {
    it("Should return an empty array if no argument is given", function () {
      chai_1.assert.deepEqual((0, validation_1.validateParams)([]), []);
    });
    it("Should throw if params are given", function () {
      chai_1.assert.throws(
        () => (0, validation_1.validateParams)([1]),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () => (0, validation_1.validateParams)([1, true]),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () => (0, validation_1.validateParams)([{}]),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () => (0, validation_1.validateParams)(["ASD", 123, false]),
        errors_1.InvalidArgumentsError
      );
    });
  });
  describe("With multiple params", function () {
    it("Should throw if the number of params and arguments doesn't match", function () {
      chai_1.assert.throws(
        () =>
          (0, validation_1.validateParams)(
            [1],
            base_types_1.rpcHash,
            base_types_1.rpcQuantity
          ),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () => (0, validation_1.validateParams)([1, true], base_types_1.rpcHash),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () =>
          (0, validation_1.validateParams)(
            [{}],
            base_types_1.rpcQuantity,
            base_types_1.rpcQuantity
          ),
        errors_1.InvalidArgumentsError
      );
      chai_1.assert.throws(
        () =>
          (0, validation_1.validateParams)(
            ["ASD", 123, false],
            base_types_1.rpcQuantity
          ),
        errors_1.InvalidArgumentsError
      );
    });
    it("Should return the right values", function () {
      chai_1.assert.deepEqual(
        (0, validation_1.validateParams)(
          ["0x0000000000000000000000000000000000000001"],
          base_types_1.rpcAddress
        ),
        [toBuffer("0x0000000000000000000000000000000000000001")]
      );
      chai_1.assert.deepEqual(
        (0, validation_1.validateParams)(
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
            true,
          ],
          base_types_1.rpcHash,
          t.boolean
        ),
        [
          toBuffer(
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ),
          true,
        ]
      );
    });
  });
  describe("Optional params", function () {
    it("Should fail if less than the minimum number of params are received", function () {
      chai_1.assert.throws(
        () =>
          (0, validation_1.validateParams)(
            [],
            base_types_1.rpcHash,
            blockTag_1.optionalRpcNewBlockTag
          ),
        errors_1.InvalidArgumentsError
      );
    });
    it("Should fail if more than the maximum number of params are received", function () {
      chai_1.assert.throws(
        () =>
          (0, validation_1.validateParams)(
            [
              "0x0000000000000000000000000000000000000000000000000000000000000001",
              "latest",
              123,
            ],
            base_types_1.rpcHash,
            blockTag_1.optionalRpcNewBlockTag
          ),
        errors_1.InvalidArgumentsError
      );
    });
    it("Should return undefined if optional params are missing", function () {
      chai_1.assert.deepEqual(
        (0, validation_1.validateParams)(
          [
            "0x0000000000000000000000000000000000000000000000000000000000000001",
          ],
          base_types_1.rpcHash,
          blockTag_1.optionalRpcNewBlockTag
        ),
        [
          toBuffer(
            "0x0000000000000000000000000000000000000000000000000000000000000001"
          ),
          undefined,
        ]
      );
      chai_1.assert.deepEqual(
        (0, validation_1.validateParams)(
          ["0x1111111111111111111111111111111111111111"],
          base_types_1.rpcAddress,
          blockTag_1.optionalRpcNewBlockTag
        ),
        [toBuffer("0x1111111111111111111111111111111111111111"), undefined]
      );
    });
  });
});
