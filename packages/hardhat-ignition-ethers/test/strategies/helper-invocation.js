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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const chai_1 = require("chai");
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
describe("strategies - invocation via helper", () => {
    const example32ByteSalt = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
    describe("no Hardhat config setup", () => {
        const fixtureProjectName = "minimal";
        beforeEach("Load environment", function () {
            return __awaiter(this, void 0, void 0, function* () {
                process.chdir(path_1.default.join(__dirname, "../fixture-projects", fixtureProjectName));
                const hre = require("hardhat");
                yield hre.network.provider.send("evm_setAutomine", [true]);
                yield hre.run("compile", { quiet: true });
                this.hre = hre;
            });
        });
        afterEach("reset hardhat context", function () {
            (0, plugins_testing_1.resetHardhatContext)();
        });
        it("should execute create2 when passed config programmatically via helper", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: example32ByteSalt,
                    },
                });
                chai_1.assert.equal(yield result.foo.getAddress(), "0x647fB9ef6cd97537C553f6cC3c7f60395f81b410");
            });
        });
        it("should error on create2 when passed bad config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                yield chai_1.assert.isRejected(this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                    strategyConfig: {
                        salt: undefined,
                    },
                }), /IGN1102: Missing required strategy configuration parameter 'salt' for the strategy 'create2'/);
            });
        });
    });
    describe("Hardhat config setup with create2 config", () => {
        const fixtureProjectName = "create2";
        beforeEach("Load environment", function () {
            return __awaiter(this, void 0, void 0, function* () {
                process.chdir(path_1.default.join(__dirname, "../fixture-projects", fixtureProjectName));
                const hre = require("hardhat");
                yield hre.network.provider.send("evm_setAutomine", [true]);
                yield hre.run("compile", { quiet: true });
                this.hre = hre;
            });
        });
        afterEach("reset hardhat context", function () {
            (0, plugins_testing_1.resetHardhatContext)();
        });
        it("should execute create2 with the helper loading the Hardhat config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const moduleDefinition = (0, ignition_core_1.buildModule)("Module", (m) => {
                    const foo = m.contract("Foo");
                    return { foo };
                });
                const result = yield this.hre.ignition.deploy(moduleDefinition, {
                    strategy: "create2",
                });
                chai_1.assert.equal(yield result.foo.getAddress(), "0x8C1c4E6Fd637C7aa7165F19beFeAEab5E53095Bf");
            });
        });
    });
});
