"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const errors_1 = require("../src/errors");
const loadFixture_1 = require("../src/loadFixture");
const test_utils_1 = require("./test-utils");
describe("loadFixture", function () {
    (0, test_utils_1.useEnvironment)("simple");
    const mineBlock = () => __awaiter(this, void 0, void 0, function* () {
        yield this.ctx.hre.network.provider.request({
            method: "evm_mine",
        });
    });
    const getBlockNumber = () => __awaiter(this, void 0, void 0, function* () {
        const blockNumber = yield this.ctx.hre.network.provider.send("eth_blockNumber");
        return (0, test_utils_1.rpcQuantityToNumber)(blockNumber);
    });
    it("calls the fixture the first time it's used", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let calledCount = 0;
            function mineBlockFixture() {
                return __awaiter(this, void 0, void 0, function* () {
                    calledCount++;
                    yield mineBlock();
                });
            }
            const blockNumberBefore = yield getBlockNumber();
            yield (0, loadFixture_1.loadFixture)(mineBlockFixture);
            const blockNumberAfter = yield getBlockNumber();
            chai_1.assert.equal(calledCount, 1);
            chai_1.assert.equal(blockNumberAfter, blockNumberBefore + 1);
        });
    });
    it("doesn't call the fixture the second time it's used", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let calledCount = 0;
            function mineBlockFixture() {
                return __awaiter(this, void 0, void 0, function* () {
                    calledCount++;
                    yield mineBlock();
                });
            }
            const blockNumberBefore = yield getBlockNumber();
            yield (0, loadFixture_1.loadFixture)(mineBlockFixture);
            chai_1.assert.equal(calledCount, 1);
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 1);
            yield mineBlock();
            yield mineBlock();
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 3);
            yield (0, loadFixture_1.loadFixture)(mineBlockFixture);
            chai_1.assert.equal(calledCount, 1);
            chai_1.assert.equal(yield getBlockNumber(), blockNumberBefore + 1);
        });
    });
    it("the result of the fixture is returned", function () {
        return __awaiter(this, void 0, void 0, function* () {
            function mineBlockFixture() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield mineBlock();
                    return 123;
                });
            }
            chai_1.assert.equal(yield (0, loadFixture_1.loadFixture)(mineBlockFixture), 123);
            chai_1.assert.equal(yield (0, loadFixture_1.loadFixture)(mineBlockFixture), 123);
        });
    });
    it("should take snapshot again when trying to revert to future state", function () {
        return __awaiter(this, void 0, void 0, function* () {
            let calledCount = 0;
            function mineBlockFixture() {
                return __awaiter(this, void 0, void 0, function* () {
                    yield mineBlock();
                });
            }
            function mineTwoBlocksFixture() {
                return __awaiter(this, void 0, void 0, function* () {
                    calledCount++;
                    yield mineBlock();
                    yield mineBlock();
                });
            }
            yield (0, loadFixture_1.loadFixture)(mineBlockFixture);
            yield (0, loadFixture_1.loadFixture)(mineTwoBlocksFixture);
            yield (0, loadFixture_1.loadFixture)(mineBlockFixture);
            yield (0, loadFixture_1.loadFixture)(mineTwoBlocksFixture);
            chai_1.assert.equal(calledCount, 2);
        });
    });
    it("should take snapshot again when trying to revert to future state (edge case)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // This tests is meant to check that snapshot ids are compared as numbers
            // and not as strings.
            // We run 16 fixtures, so that the last one has a snapshot id of 0x10, and
            // then we run again the second one (with a snapshot id of 0x2). The last
            // one should be removed because 0x2 <= 0x10, but this won't happen if they
            // are compared as strings.
            // keep track of how many times each fixture is called
            const calledCount = new Map();
            const fixturesFunctions = [...Array(16)].map((x, i) => {
                calledCount.set(i, 0);
                return function mineBlockFixture() {
                    return __awaiter(this, void 0, void 0, function* () {
                        calledCount.set(i, calledCount.get(i) + 1);
                    });
                };
            });
            // run all fixtures and check they were called once
            for (const fixtureFunction of fixturesFunctions) {
                yield (0, loadFixture_1.loadFixture)(fixtureFunction);
            }
            for (let i = 0; i < fixturesFunctions.length; i++) {
                chai_1.assert.equal(calledCount.get(i), 1);
            }
            // we run the second fixture again, this should remove all the ones that
            // are afte rit
            yield (0, loadFixture_1.loadFixture)(fixturesFunctions[1]);
            chai_1.assert.equal(calledCount.get(1), 1);
            // the last fixture should be run again
            yield (0, loadFixture_1.loadFixture)(fixturesFunctions[15]);
            chai_1.assert.equal(calledCount.get(15), 2);
            // the first one shouldn't be removed
            yield (0, loadFixture_1.loadFixture)(fixturesFunctions[0]);
            chai_1.assert.equal(calledCount.get(0), 1);
        });
    });
    it("should throw when an anonymous regular function is used", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isRejected((0, loadFixture_1.loadFixture)(function () {
                return __awaiter(this, void 0, void 0, function* () { });
            }), errors_1.FixtureAnonymousFunctionError);
        });
    });
    it("should throw when an anonymous arrow function is used", function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield chai_1.assert.isRejected((0, loadFixture_1.loadFixture)(() => __awaiter(this, void 0, void 0, function* () { })), errors_1.FixtureAnonymousFunctionError);
        });
    });
});
