"use strict";
/* eslint-disable import/no-unused-modules */
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
describe("config", () => {
    describe("loading", () => {
        (0, use_ignition_project_1.useEphemeralIgnitionProject)("with-config");
        let loadedOptions;
        beforeEach(function () {
            loadedOptions = this.hre.config.ignition;
        });
        it("should apply requiredConfirmations", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(loadedOptions.requiredConfirmations, 10);
            });
        });
        it("should apply blockPollingInterval", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(loadedOptions.blockPollingInterval, 100);
            });
        });
        it("should apply timeBeforeBumpingFees", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(loadedOptions.timeBeforeBumpingFees, 60 * 1000);
            });
        });
        it("should apply maxFeeBumps", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(loadedOptions.maxFeeBumps, 2);
            });
        });
        it("should apply strategyConfig", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(loadedOptions.strategyConfig, {
                    create2: { salt: "custom-salt" },
                });
            });
        });
        it("should apply disableFeeBumping at the top level", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(loadedOptions.disableFeeBumping, true);
            });
        });
        it("should apply maxFeePerGasLimit", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(this.hre.config.networks.hardhat.ignition.maxFeePerGasLimit, 2n);
            });
        });
        it("should apply maxPriorityFeePerGas", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(this.hre.config.networks.hardhat.ignition.maxPriorityFeePerGas, 3n);
            });
        });
        it("should apply gasPrice", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(this.hre.config.networks.hardhat.ignition.gasPrice, 1n);
            });
        });
        it("should apply disableFeeBumping at the network level", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.equal(this.hre.config.networks.hardhat.ignition.disableFeeBumping, false);
            });
        });
        it("should only have known config", () => {
            const configOptions = [
                "blockPollingInterval",
                "disableFeeBumping",
                "maxFeeBumps",
                "requiredConfirmations",
                "strategyConfig",
                "timeBeforeBumpingFees",
            ];
            chai_1.assert.deepStrictEqual(Object.keys(loadedOptions).sort(), configOptions);
        });
    });
    describe("validating", () => {
        (0, use_ignition_project_1.useEphemeralIgnitionProject)("with-invalid-config");
        it("should throw when given a `requiredConfirmations` value less than 1", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("FooModule", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition, {
                    config: {
                        requiredConfirmations: 0,
                    },
                }), `Configured value 'requiredConfirmations' cannot be less than 1. Value given: '0'`);
            });
        });
    });
});
