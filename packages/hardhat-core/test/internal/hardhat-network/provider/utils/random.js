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
const random_1 = require("../../../../../src/internal/hardhat-network/provider/utils/random");
const HASH_REGEX = /^0x[a-f\d]{64}$/;
const ADDRESS_REGEX = /^0x[a-f\d]{40}$/;
describe("randomHash", () => {
  it("matches regex pattern", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      chai_1.assert.isTrue(HASH_REGEX.test((0, random_1.randomHash)()));
    }));
});
describe("randomAddress", () => {
  it("matches regex pattern", () =>
    __awaiter(void 0, void 0, void 0, function* () {
      chai_1.assert.isTrue(
        ADDRESS_REGEX.test((0, random_1.randomAddressString)())
      );
    }));
});
