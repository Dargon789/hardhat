"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hardforks_1 = require("../../../src/internal/util/hardforks");
const errors_1 = require("../../helpers/errors");
const errors_list_1 = require("../../../src/internal/core/errors-list");
describe("Hardfork utils", function () {
  describe("getHardforkName", function () {
    it("Throws on invalid hardforks", function () {
      (0, errors_1.expectHardhatError)(() => {
        (0, hardforks_1.getHardforkName)("asd");
      }, errors_list_1.ERRORS.GENERAL.ASSERTION_ERROR);
      (0, errors_1.expectHardhatError)(() => {
        (0, hardforks_1.getHardforkName)("berling");
      }, errors_list_1.ERRORS.GENERAL.ASSERTION_ERROR);
    });
    it("Returns the right hardfork name", function () {
      chai_1.assert.equal(
        "spuriousDragon",
        hardforks_1.HardforkName.SPURIOUS_DRAGON
      );
      chai_1.assert.equal("byzantium", hardforks_1.HardforkName.BYZANTIUM);
      chai_1.assert.equal("berlin", hardforks_1.HardforkName.BERLIN);
      chai_1.assert.equal("london", hardforks_1.HardforkName.LONDON);
      chai_1.assert.equal(
        "arrowGlacier",
        hardforks_1.HardforkName.ARROW_GLACIER
      );
      chai_1.assert.equal("grayGlacier", hardforks_1.HardforkName.GRAY_GLACIER);
      chai_1.assert.equal("merge", hardforks_1.HardforkName.MERGE);
      chai_1.assert.equal("shanghai", hardforks_1.HardforkName.SHANGHAI);
      chai_1.assert.equal("cancun", hardforks_1.HardforkName.CANCUN);
      chai_1.assert.equal("prague", hardforks_1.HardforkName.PRAGUE);
    });
  });
});
