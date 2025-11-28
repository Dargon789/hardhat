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
const plugins_1 = require("hardhat/plugins");
const fixture_1 = require("../src/fixture");
const task_names_1 = require("../src/task-names");
const helpers_1 = require("./helpers");
describe("Truffle fixtures support", function () {
    describe("Migration detection", function () {
        describe("In a project without migrations", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should not detect any", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.isFalse(yield (0, fixture_1.hasMigrations)(this.env.config.paths));
                });
            });
        });
        describe("In a project with migrations", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-migrations", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should detect them", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.isTrue(yield (0, fixture_1.hasMigrations)(this.env.config.paths));
                });
            });
        });
    });
    describe("Fixtures detection", function () {
        describe("In a project without fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should not detect any", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.isFalse(yield (0, fixture_1.hasTruffleFixture)(this.env.config.paths));
                });
            });
        });
        describe("In a project with a js fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-fixture", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should detect them", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.isTrue(yield (0, fixture_1.hasTruffleFixture)(this.env.config.paths));
                });
            });
        });
        describe("In a project with a ts fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-ts-fixture", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should detect them", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    chai_1.assert.isTrue(yield (0, fixture_1.hasTruffleFixture)(this.env.config.paths));
                });
            });
        });
    });
    describe("Fixtures function loading", function () {
        describe("In a project with a js fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-fixture", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should load it correctly", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const fixture = yield (0, fixture_1.getTruffleFixtureFunction)(this.env.config.paths);
                    chai_1.assert.isFunction(fixture);
                });
            });
        });
        describe("In a project with a ts fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-ts-fixture", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should load it correctly", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const fixture = yield (0, fixture_1.getTruffleFixtureFunction)(this.env.config.paths);
                    chai_1.assert.isFunction(fixture);
                });
            });
        });
        describe("In an invalid fixture", function () {
            (0, helpers_1.useEnvironment)("hardhat-project-with-invalid-fixture", plugins_1.HARDHAT_NETWORK_NAME);
            it("Should load it correctly", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        yield (0, fixture_1.getTruffleFixtureFunction)(this.env.config.paths);
                    }
                    catch (error) {
                        chai_1.assert.include(error.message, "Truffle fixture file");
                        chai_1.assert.include(error.message, "must return a function");
                        return;
                    }
                    chai_1.assert.fail("Should have failed");
                });
            });
        });
    });
    describe("Fixtures integration test", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.5", plugins_1.HARDHAT_NETWORK_NAME);
        it("Should detect deployed contracts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.RUN_TRUFFLE_FIXTURE_TASK);
                const Greeter = this.env.artifacts.require("Greeter");
                const greeter = yield Greeter.deployed();
                chai_1.assert.equal(yield greeter.greet(), "Hi");
            });
        });
        it("Should give the right error on non-deployed contracts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.RUN_TRUFFLE_FIXTURE_TASK);
                const Lib = this.env.artifacts.require("Lib");
                try {
                    yield Lib.deployed();
                }
                catch (error) {
                    chai_1.assert.equal(error.message, "Trying to get deployed instance of Lib, but none was set.");
                    return;
                }
                chai_1.assert.fail("Should have failed");
            });
        });
    });
});
