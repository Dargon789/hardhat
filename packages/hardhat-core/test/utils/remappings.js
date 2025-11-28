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
const remappings_1 = require("../../src/utils/remappings");
describe("Remappings utils", function () {
  describe("applyRemappings", function () {
    const remappings = {
      foo: "lib/foo",
      foobar: "lib/foo2",
    };
    it("applies a matching remapping", () =>
      __awaiter(this, void 0, void 0, function* () {
        (0, chai_1.expect)(
          (0, remappings_1.applyRemappings)(remappings, "foo/bar.sol")
        ).to.eq("lib/foo/bar.sol");
      }));
    it("only applies a matching remapping to prefixes", () =>
      __awaiter(this, void 0, void 0, function* () {
        (0, chai_1.expect)(
          (0, remappings_1.applyRemappings)(remappings, "baz/foo/bar.sol")
        ).to.eq("baz/foo/bar.sol");
      }));
    it("applies the longest matching prefix", () =>
      __awaiter(this, void 0, void 0, function* () {
        (0, chai_1.expect)(
          (0, remappings_1.applyRemappings)(remappings, "foobar/bar.sol")
        ).to.eq("lib/foo2/bar.sol");
      }));
  });
});
