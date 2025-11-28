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
const check_automined_network_1 = require("../../src/internal/utils/check-automined-network");
describe("check-automin-network", () => {
    it("should confirm a Hardhat network that has automining enabled", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.assert.isTrue(yield (0, check_automined_network_1.checkAutominedNetwork)(setupMockProvider("hardhat", true)), "Hardhat network should have automining enabled");
    }));
    it("should indicate a Hardhat network that has automining disabled", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.assert.isFalse(yield (0, check_automined_network_1.checkAutominedNetwork)(setupMockProvider("hardhat", false)), "Hardhat network should _not_ have automining enabled");
    }));
    it("should confirm a ganache network", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.assert.isTrue(yield (0, check_automined_network_1.checkAutominedNetwork)(setupMockProvider("ganache")), "Ganache networks should have automining enabled");
    }));
    it("should indicate not an automining network for other networks", () => __awaiter(void 0, void 0, void 0, function* () {
        return chai_1.assert.isFalse(yield (0, check_automined_network_1.checkAutominedNetwork)(setupMockProvider("other")), "Other network should _not_ have automining enabled");
    }));
});
function setupMockProvider(network, autominingEnabled = true) {
    return {
        request: ({ method, }) => __awaiter(this, void 0, void 0, function* () {
            if (method === "hardhat_getAutomine") {
                if (network === "hardhat") {
                    return autominingEnabled;
                }
                throw new Error("RPC Method hardhat_getAutomine not supported - TEST");
            }
            if (method === "web3_clientVersion") {
                if (network === "ganache") {
                    return "ganache network";
                }
                if (network === "hardhat") {
                    return "hardhat network";
                }
                throw new Error("RPC Method web3_clientVersion not supported - TEST");
            }
            throw new Error(`RPC Method ${method} not supported - TEST`);
        }),
    };
}
