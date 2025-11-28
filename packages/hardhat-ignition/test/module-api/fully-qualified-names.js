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
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("fully qualified names", () => {
    describe("where there are multiple contracts with the same name in the project", () => {
        (0, use_ignition_project_1.useFileIgnitionProject)("multiple-contracts-with-same-name", "contract-deploy");
        it("should deploy contracts by referring using fully qualified names", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const LaunchModule = (0, ignition_core_1.buildModule)("Apollo", (m) => {
                    const rocket1 = m.contract("contracts/Rocket1.sol:Rocket", ["Rocket 1"], {
                        id: "Rocket1",
                    });
                    const rocket2 = m.contract("contracts/Rocket2.sol:Rocket", ["Rocket 2"], {
                        id: "Rocket2",
                    });
                    return { rocket1, rocket2 };
                });
                const result = yield this.hre.ignition.deploy(LaunchModule);
                chai_1.assert.equal(yield result.rocket1.read.name(), "Rocket 1");
                chai_1.assert.equal(yield result.rocket2.read.name(), "Rocket 2");
            });
        });
    });
});
