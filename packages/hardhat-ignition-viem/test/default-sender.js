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
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const use_ignition_project_1 = require("./test-helpers/use-ignition-project");
describe("support changing default sender", () => {
    (0, use_ignition_project_1.useIgnitionProject)("minimal");
    it("should deploy on the first HH account by default", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [defaultAccount] = yield this.hre.viem.getWalletClients();
            const defaultAccountAddress = defaultAccount.account.address;
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const ownerSender = m.contract("OwnerSender");
                return { ownerSender };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition, {
                defaultSender: undefined,
            });
            chai_1.assert.equal((yield result.ownerSender.read.owner()).toLowerCase(), defaultAccountAddress.toLowerCase());
        });
    });
    it("should allow changing the default sender that the ignition deployment runs against", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const [, notTheDefaultAccount] = yield this.hre.viem.getWalletClients();
            const differentAccountAddress = notTheDefaultAccount.account.address;
            const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                const ownerSender = m.contract("OwnerSender");
                return { ownerSender };
            });
            const result = yield this.hre.ignition.deploy(moduleDefinition, {
                defaultSender: differentAccountAddress,
            });
            chai_1.assert.equal((yield result.ownerSender.read.owner()).toLowerCase(), differentAccountAddress.toLowerCase());
        });
    });
});
