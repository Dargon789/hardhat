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
exports.expectErrorAsync = void 0;
const chai_1 = require("chai");
const fs_1 = require("fs");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const path_1 = require("path");
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
describe("Solpp plugin", function () {
    describe("js-config-project", function () {
        (0, helpers_1.useEnvironment)("js-config-project");
        it("should evaluate symbols as javascript functions", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
                const generatedContractA = (0, fs_1.readFileSync)(paths[0]).toString();
                chai_1.assert.include(generatedContractA, "1337");
            });
        });
        it("should compile without errors", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.doesNotThrow(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                }));
            });
        });
    });
    describe("json-config-project", function () {
        (0, helpers_1.useEnvironment)("json-config-project");
        it("should load definitions from json", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
                const generatedContractA = (0, fs_1.readFileSync)(paths[0]).toString();
                chai_1.assert.include(generatedContractA, "48192.418291248");
            });
        });
        it("should load the config properly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                chai_1.assert.isDefined(this.env.config.solpp);
                chai_1.assert.equal(this.env.config.solpp.collapseEmptyLines, false);
                chai_1.assert.equal(this.env.config.solpp.noFlatten, true);
                chai_1.assert.equal(this.env.config.solpp.tolerant, true);
            });
        });
    });
    describe("hardhat-project", function () {
        (0, helpers_1.useEnvironment)("hardhat-project");
        it("should create processed contracts in the cache directory", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const paths = yield this.env.run(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS);
                paths.forEach((path) => {
                    chai_1.assert.include(path, "solpp-generated-contracts");
                });
            });
        });
        it("should collapse empty lines", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractPath = (0, path_1.join)(this.env.config.paths.sources, "B.sol");
                const content = (0, fs_1.readFileSync)(contractPath).toString();
                const files = [[contractPath, content]];
                const opts = {
                    collapseEmptyLines: true,
                    noPreprocessor: false,
                };
                const paths = yield this.env.run("hardhat-solpp:run-solpp", {
                    files,
                    opts,
                });
                chai_1.assert.equal(paths.length, 1);
                const generatedContent = (0, fs_1.readFileSync)(paths[0]).toString();
                function countEmptyLines(text) {
                    if (text === "") {
                        return 0;
                    }
                    const match = text.match(/^[ \t]*$/gm);
                    if (match === null) {
                        return 0;
                    }
                    return match.length;
                }
                chai_1.assert.isBelow(countEmptyLines(generatedContent), countEmptyLines(content));
            });
        });
        // This test skipped because solpp won't fail if a contract has an non-defined symbol.
        describe.skip("fail-project", function () {
            (0, helpers_1.useEnvironment)("fail-project");
            it("should fail when symbol does not exist", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const contractPath = (0, path_1.join)(this.env.config.paths.sources, "A.sol");
                    const content = (0, fs_1.readFileSync)(contractPath).toString();
                    const files = [[contractPath, content]];
                    const opts = {};
                    yield expectErrorAsync(() => __awaiter(this, void 0, void 0, function* () {
                        return this.env.run("hardhat-solpp:run-solpp", {
                            files,
                            opts,
                        });
                    }));
                });
            });
        });
    });
});
