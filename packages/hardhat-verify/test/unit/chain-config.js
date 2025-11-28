"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chain_config_1 = require("../../src/internal/chain-config");
describe("Chain Config", () => {
    describe("builtinChains", () => {
        it("should have no duplicate chain ids", () => {
            // check that xdai/gnosis is the only duplicate
            const xdaiGnosisChains = chain_config_1.builtinChains.filter(({ chainId }) => chainId === 100);
            chai_1.assert.lengthOf(xdaiGnosisChains, 2);
            // check that there are no duplicates in the rest of the list
            const filteredChainIds = chain_config_1.builtinChains.filter(({ chainId }) => chainId !== 100);
            const uniqueIds = [...new Set(filteredChainIds)];
            chai_1.assert.notEqual(0, uniqueIds.length);
            chai_1.assert.equal(uniqueIds.length, filteredChainIds.length);
        });
        it("should be sorted by chainId in ascending order", () => {
            const isAscending = chain_config_1.builtinChains.every(({ chainId }, index) => index === 0 || chainId >= chain_config_1.builtinChains[index - 1].chainId);
            (0, chai_1.assert)(isAscending);
        });
    });
});
