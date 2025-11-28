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
/* eslint-disable import/no-unused-modules */
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const use_ignition_project_1 = require("../../test-helpers/use-ignition-project");
/**
 * On running a deploy, if a transaction fails simulation, we should
 * revert the allocated nonce and complete the rest of the batch.
 *
 * This test ensures that the nonce is reverted and the rest of the batch completes
 * because the second transaction does not fail the nonce check.
 */
describe("execution - revert nonce on simulation error", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should raise the simulation error if there are multiple transactions in a batch and fails simulation", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                // batch 1
                const foo = m.contract("FailureCalls");
                // batch 2
                m.call(foo, "fails");
                m.call(foo, "doesNotFail");
                return { foo };
            });
            // We check that it doesn't fail because of a nonce validation,
            // but because of the actual simulation
            yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition), /Simulating the transaction failed with error: Reverted with reason "fails"/);
        });
    });
});
