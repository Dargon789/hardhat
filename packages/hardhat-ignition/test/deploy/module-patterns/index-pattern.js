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
describe("index pattern deployments", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("index-pattern-success");
    it("should succeed for a standard case", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Mod1 = (0, ignition_core_1.buildModule)("Mod1", (m) => {
                const F1 = m.contract("F1");
                m.call(F1, "first");
                return { F1 };
            });
            const Mod2 = (0, ignition_core_1.buildModule)("Mod2", (m) => {
                const { F1 } = m.useModule(Mod1);
                const F2 = m.contract("F2", [F1]);
                m.call(F2, "second");
                return { F2 };
            });
            const IndexMod = (0, ignition_core_1.buildModule)("IndexMod", (m) => {
                const { F2 } = m.useModule(Mod2);
                return { F2 };
            });
            const moduleDefinition = (0, ignition_core_1.buildModule)("DeployModule", (m) => {
                const { F1 } = m.useModule(Mod1);
                m.call(F1, "third", [], { after: [Mod1, IndexMod] });
                return { F1 };
            });
            yield chai_1.assert.isFulfilled(this.hre.ignition.deploy(moduleDefinition));
        });
    });
    it("should succeed for a malaga case", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const Mod1 = (0, ignition_core_1.buildModule)("Mod1", (m) => {
                const F1 = m.contract("F1");
                return { F1 };
            });
            const Mod2 = (0, ignition_core_1.buildModule)("Mod2", (m) => {
                const { F1 } = m.useModule(Mod1);
                const F2 = m.contract("F2", [F1]);
                const firstCall = m.call(F2, "unrelatedFunc");
                const secondCall = m.call(F2, "unrelatedFunc", [], {
                    after: [firstCall],
                    id: "secondCall",
                });
                const lastCall = m.call(F2, "unrelatedFunc", [], {
                    after: [secondCall],
                    id: "lastCall",
                });
                m.call(F2, "mustBeCalledByTwoSeparateContracts", [], {
                    after: [lastCall],
                });
                return { F2 };
            });
            const Mod3 = (0, ignition_core_1.buildModule)("Mod3", (m) => {
                const { F1 } = m.useModule(Mod1);
                const F3 = m.contract("F2", [F1], { id: "F3" });
                return { F3 };
            });
            const IndexMod = (0, ignition_core_1.buildModule)("IndexMod", (m) => {
                const { F1 } = m.useModule(Mod1);
                const { F2 } = m.useModule(Mod2);
                const { F3 } = m.useModule(Mod3);
                const lastCall = m.call(F3, "mustBeCalledByTwoSeparateContracts");
                const NewF1 = m.contractAt("F1", F1, { after: [lastCall], id: "NewF1" });
                return { NewF1, F2, F3 };
            });
            const moduleDefinition = (0, ignition_core_1.buildModule)("DeployModule", (m) => {
                const { NewF1 } = m.useModule(IndexMod);
                m.call(NewF1, "throwsIfNotCalledTwice");
                return {};
            });
            yield chai_1.assert.isFulfilled(this.hre.ignition.deploy(moduleDefinition));
        });
    });
});
