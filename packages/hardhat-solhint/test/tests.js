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
exports.expectErrorAsync = void 0;
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const sinon_1 = __importDefault(require("sinon"));
const helpers_1 = require("./helpers");
function expectErrorAsync(f, errorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield f();
        }
        catch (err) {
            chai_1.assert.equal(err.message, errorMessage);
        }
    });
}
exports.expectErrorAsync = expectErrorAsync;
describe("Solhint plugin", function () {
    const SOLHINT_CONFIG_FILENAME = ".solhint.json";
    describe("Project with solhint config", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        it("should define solhint task", function () {
            chai_1.assert.isDefined(this.env.tasks["hardhat-solhint:run-solhint"]);
            chai_1.assert.isDefined(this.env.tasks.check);
        });
        it("return a report", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reports = yield this.env.run("hardhat-solhint:run-solhint");
                chai_1.assert.equal(reports.length, 1);
                chai_1.assert.isTrue(
                // This test is a little sloppy, but the actual number doesn't matter
                // and it was failing very often when solhint released new versions
                reports[0].reports.length >= 5);
            });
        });
        it("should run the check task and set the exit code to 1", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const consoleLogStub = sinon_1.default.stub(console, "log");
                yield this.env.run("check");
                chai_1.assert.isTrue(consoleLogStub.calledOnce);
                chai_1.assert.strictEqual(process.exitCode, 1);
                consoleLogStub.restore();
                process.exitCode = undefined;
            });
        });
    });
    describe("Project with no errors", function () {
        (0, helpers_1.useEnvironment)("no-errors-project");
        it("should run the check task and not set the exit code", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const consoleLogStub = sinon_1.default.stub(console, "log");
                yield this.env.run("check");
                chai_1.assert.isTrue(consoleLogStub.calledOnce);
                chai_1.assert.strictEqual(process.exitCode, undefined);
            });
        });
    });
    describe("Project with .solhintignore file", function () {
        (0, helpers_1.useEnvironment)("solhintignore-project");
        it("should not return a report for the ignored files", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reports = yield this.env.run("hardhat-solhint:run-solhint");
                // Greeter.sol is not ignored, Solhint should return a report
                chai_1.assert.isTrue(reports.some((report) => report.file.includes("contracts/Greeter.sol")));
                // Greeter2.sol is ignored in the .solhintignore file, Solhint should not return a report
                chai_1.assert.isFalse(reports.some((report) => report.file.includes("contracts/Greeter2.sol")));
                // Greeter3.sol is ignored in the .solhint.json file, Solhint should not return a report
                chai_1.assert.isFalse(reports.some((report) => report.file.includes("contracts/Greeter2.sol")));
            });
        });
    });
    describe("Project with no solhint config", function () {
        (0, helpers_1.useEnvironment)("no-config-project");
        it("return a report", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const reports = yield this.env.run("hardhat-solhint:run-solhint");
                chai_1.assert.equal(reports.length, 1);
                chai_1.assert.equal(reports[0].reports[0].ruleId, "max-line-length");
            });
        });
    });
    describe("Project with invalid solhint configs", function () {
        (0, helpers_1.useEnvironment)("invalid-config-project");
        it("should throw when using invalid extensions", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const invalidExtensionConfig = {
                    extends: "invalid",
                };
                yield (0, fs_extra_1.writeJson)(SOLHINT_CONFIG_FILENAME, invalidExtensionConfig);
                yield expectErrorAsync(() => this.env.run("hardhat-solhint:run-solhint"), "An error occurred when processing your solhint config.");
            });
        });
        it("should throw when using invalid rules", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const invalidRuleConfig = {
                    rules: {
                        "invalid-rule": false,
                    },
                };
                yield (0, fs_extra_1.writeJson)(SOLHINT_CONFIG_FILENAME, invalidRuleConfig);
                yield expectErrorAsync(() => this.env.run("hardhat-solhint:run-solhint"), "An error occurred when processing your solhint config.");
            });
        });
        it("should throw when using a non parsable config", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const invalidConfig = "asd";
                yield (0, fs_extra_1.writeFile)(SOLHINT_CONFIG_FILENAME, invalidConfig);
                yield expectErrorAsync(() => this.env.run("hardhat-solhint:run-solhint"), "An error occurred when loading your solhint config.");
            });
        });
        after(() => __awaiter(this, void 0, void 0, function* () {
            yield (0, fs_extra_1.unlink)(SOLHINT_CONFIG_FILENAME);
        }));
    });
});
