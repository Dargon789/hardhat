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
const use_ignition_project_1 = require("./test-helpers/use-ignition-project");
describe("module parameters", () => {
    describe("a standard hardhat project", () => {
        (0, use_ignition_project_1.useEphemeralIgnitionProject)("lock");
        it("should run if provided with a valid module parameters file", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/Lock.ts",
                    parameters: "./ignition/modules/parameters.json",
                });
            });
        });
        it("should run if provided with a valid module parameters file in JSON5 format", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/Lock.ts",
                    parameters: "./ignition/modules/parameters-json5.json5",
                });
            });
        });
        it("should run if provided with a valid module parameters file encoding a bigint as a string", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/Lock.ts",
                    parameters: "./ignition/modules/parameters-bigints-as-strings.json",
                });
            });
        });
        it("should fail if the module path is invalid", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/nonexistant.ts",
                }), /Could not find a module file at the path: .\/ignition\/modules\/nonexistant.ts/);
            });
        });
        it("should fail if the module parameters path is invalid", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/nonexistant.ts",
                    parameters: "./ignition/modules/nonexistant.json",
                }), /Could not find a module file at the path: .\/ignition\/modules\/nonexistant.ts/);
            });
        });
        it("should fail if parameters file number is larger than allowed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield chai_1.assert.isRejected(this.hre.run({
                    scope: "ignition",
                    task: "deploy",
                }, {
                    modulePath: "./ignition/modules/Lock.ts",
                    parameters: "./ignition/modules/parameters-too-large.json",
                }), /Parameter "unlockTime" exceeds maximum safe integer size. Encode the value as a string using bigint notation: `\${value}n`/);
            });
        });
        it("should use a global parameter if no module parameter is available", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ignitionModule = (0, ignition_core_1.buildModule)("Test", (m) => {
                    const unlockTime = m.getParameter("unlockTime");
                    const lock = m.contract("Lock", [unlockTime]);
                    return { lock };
                });
                const result = yield this.hre.ignition.deploy(ignitionModule, {
                    parameters: { $global: { unlockTime: 1893499200000 } },
                });
                chai_1.assert.equal(yield result.lock.read.unlockTime(), 1893499200000);
            });
        });
        it("should use a global parameter instead of the default value", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ignitionModule = (0, ignition_core_1.buildModule)("Test", (m) => {
                    const unlockTime = m.getParameter("unlockTime", 100);
                    const lock = m.contract("Lock", [unlockTime]);
                    return { lock };
                });
                const result = yield this.hre.ignition.deploy(ignitionModule, {
                    parameters: { $global: { unlockTime: 1893499200000 } },
                });
                chai_1.assert.equal(yield result.lock.read.unlockTime(), 1893499200000);
            });
        });
        it("should use the module parameter even if global parameters exist but not that specific parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ignitionModule = (0, ignition_core_1.buildModule)("Test", (m) => {
                    const unlockTime = m.getParameter("moduleLevelParam");
                    const lock = m.contract("Lock", [unlockTime]);
                    return { lock };
                });
                const result = yield this.hre.ignition.deploy(ignitionModule, {
                    parameters: {
                        $global: { globalLevelParam: "should-not-be-read" },
                        Test: {
                            moduleLevelParam: 1893499200000,
                        },
                    },
                });
                chai_1.assert.equal(yield result.lock.read.unlockTime(), 1893499200000);
            });
        });
        it("should use the global parameter even if module parameters exist but not that specific parameter", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ignitionModule = (0, ignition_core_1.buildModule)("Test", (m) => {
                    const unlockTime = m.getParameter("globalLevelParam");
                    const lock = m.contract("Lock", [unlockTime]);
                    return { lock };
                });
                const result = yield this.hre.ignition.deploy(ignitionModule, {
                    parameters: {
                        $global: { globalLevelParam: 1893499200000 },
                        Test: {
                            moduleLevelParam: "should-not-be-read",
                        },
                    },
                });
                chai_1.assert.equal(yield result.lock.read.unlockTime(), 1893499200000);
            });
        });
        it("should use a module parameter instead of a global parameter if both are present", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const ignitionModule = (0, ignition_core_1.buildModule)("Test", (m) => {
                    const unlockTime = m.getParameter("unlockTime", 100);
                    const lock = m.contract("Lock", [unlockTime]);
                    return { lock };
                });
                const result = yield this.hre.ignition.deploy(ignitionModule, {
                    parameters: {
                        $global: { unlockTime: 1893499200000 },
                        Test: { unlockTime: 9876543210000 },
                    },
                });
                chai_1.assert.equal(yield result.lock.read.unlockTime(), 9876543210000);
            });
        });
    });
});
