"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const fsExtra = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const node_fs_1 = __importDefault(require("node:fs"));
const constants_1 = require("../src/constants");
const helpers_1 = require("./helpers");
(0, chai_1.use)(chai_as_promised_1.default);
describe("Vyper plugin", function () {
    beforeEach(function () {
        fsExtra.removeSync("artifacts");
        fsExtra.removeSync(path_1.default.join("cache", constants_1.VYPER_FILES_CACHE_FILENAME));
    });
    describe("project with single file", function () {
        (0, helpers_1.useFixtureProject)("compilation-single-file");
        (0, helpers_1.useEnvironment)();
        it("should compile and emit artifacts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.TASK_COMPILE);
                (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
            });
        });
    });
    describe("project with two files with different compiler versions", function () {
        (0, helpers_1.useFixtureProject)("compilation-two-files-different-versions");
        (0, helpers_1.useEnvironment)();
        it("should compile and emit artifacts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.TASK_COMPILE);
                (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "B.vy", "B.json"));
            });
        });
    });
    describe("vyper settings", function () {
        describe("compilation with different settings", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-vyper-settings");
            (0, helpers_1.useEnvironment)();
            it("should compile and emit artifacts", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                    (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "B.vy", "B.json"));
                });
            });
        });
        describe("optimize, as boolean type, can always be set to false in versions >= 0.3.10 (flag --optimize none)", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-set-to-false-always-available-new-versions");
            (0, helpers_1.useEnvironment)();
            it("should compile successfully", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                });
            });
        });
        describe("optimize, as boolean type, can always be set to false in versions 0.3.0 < v < 0.3.10 (flag --no-optimize)", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-set-to-false-always-available-old-versions-after-0.3.0");
            (0, helpers_1.useEnvironment)();
            it("should compile successfully", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                });
            });
        });
        describe("optimize, as boolean type, cannot be set to false in versions <= 0.3.0", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-set-to-false-not-available-old-versions");
            (0, helpers_1.useEnvironment)();
            it("should fail the compilation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(Error, "The 'optimize' setting with value 'false' is not supported for versions of the Vyper compiler older than or equal to 0.3.0. You are currently using version 0.3.0.");
                });
            });
        });
        describe("optimize setting set to true in supported versions", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-set-to-true");
            (0, helpers_1.useEnvironment)();
            it("should compile successfully", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    (0, helpers_1.assertFileExists)(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                });
            });
        });
        describe("optimize set to true is not available for versions >= 0.3.10", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-true-not-available-new-versions");
            (0, helpers_1.useEnvironment)();
            it("should fail the compilation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(Error, "The 'optimize' setting with value 'true' is not supported for versions of the Vyper compiler older than or equal to 0.3.0 or newer than or equal to 0.3.10. You are currently using version 0.3.10.");
                });
            });
        });
        describe("optimize set to true is not available for versions <= 0.3.0", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-true-not-available-old-versions");
            (0, helpers_1.useEnvironment)();
            it("should fail the compilation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(Error, "The 'optimize' setting with value 'true' is not supported for versions of the Vyper compiler older than or equal to 0.3.0 or newer than or equal to 0.3.10. You are currently using version 0.3.0.");
                });
            });
        });
        describe("optimize setting cannot be a string for version < 0.3.10", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-string-not-available-old-versions");
            (0, helpers_1.useEnvironment)();
            it("should fail the compilation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(Error, "The 'optimize' setting, when specified as a string value, is available only starting from the Vyper compiler version 0.3.10. You are currently using version 0.3.9.");
                });
            });
        });
        describe("optimize setting must be a string or boolean type", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-settings-option-variants/optimize-invalid-type");
            (0, helpers_1.useEnvironment)();
            it("should fail the compilation", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(Error, "The 'optimize' setting has an invalid type value: number. Type should be either string or boolean.");
                });
            });
        });
    });
    describe("caching mechanism", function () {
        describe("caching mechanism without vyper settings", function () {
            (0, helpers_1.useFixtureProject)("compilation-single-file");
            (0, helpers_1.useEnvironment)();
            it("should not re-compile the contract because of the cache", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    const stats1 = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                    // it should not compile again so the contract should not be modified
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    const stats2 = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                    chai_1.assert.equal(stats1.mtimeMs, stats2.mtimeMs);
                });
            });
        });
        describe("caching mechanism with vyper settings", function () {
            (0, helpers_1.useFixtureProject)("compilation-with-vyper-settings");
            (0, helpers_1.useEnvironment)();
            it("should not re-compile the contract because of the cache", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    const stats1A = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                    const stats1B = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "B.vy", "B.json"));
                    // it should not compile again so the contracts should not be modified
                    yield this.env.run(task_names_1.TASK_COMPILE);
                    const stats2A = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "A.vy", "A.json"));
                    const stats2B = node_fs_1.default.statSync(path_1.default.join("artifacts", "contracts", "B.vy", "B.json"));
                    chai_1.assert.equal(stats1A.mtimeMs, stats2A.mtimeMs);
                    chai_1.assert.equal(stats1B.mtimeMs, stats2B.mtimeMs);
                });
            });
        });
    });
    describe("old versions of vyper", function () {
        (0, helpers_1.useFixtureProject)("old-vyper-versions");
        describe("project with an old version of vyper", function () {
            (0, helpers_1.useEnvironment)("old-vyper-version.js");
            it("should throw an error", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.expectVyperErrorAsync)(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.env.run(task_names_1.TASK_COMPILE);
                    }), "Unsupported vyper version: 0.1.0-beta.15");
                });
            });
        });
        describe("project with an old version of vyper (multiple compilers)", function () {
            (0, helpers_1.useEnvironment)("old-vyper-version-multiple-compilers.js");
            it("should throw an error", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield (0, helpers_1.expectVyperErrorAsync)(() => __awaiter(this, void 0, void 0, function* () {
                        yield this.env.run(task_names_1.TASK_COMPILE);
                    }), "Unsupported vyper version: 0.1.0-beta.15");
                });
            });
        });
    });
    describe("Mixed language", function () {
        (0, helpers_1.useFixtureProject)("mixed-language");
        (0, helpers_1.useEnvironment)();
        it("Should successfully compile the contracts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.TASK_COMPILE);
                chai_1.assert.equal(this.env.artifacts.readArtifactSync("test").contractName, "test");
                chai_1.assert.equal(this.env.artifacts.readArtifactSync("Greeter").contractName, "Greeter");
            });
        });
    });
    describe("project with file that cannot be compiled", function () {
        (0, helpers_1.useFixtureProject)("unmatched-compiler-version");
        (0, helpers_1.useEnvironment)();
        it("should throw an error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, helpers_1.expectVyperErrorAsync)(() => __awaiter(this, void 0, void 0, function* () {
                    yield this.env.run(task_names_1.TASK_COMPILE);
                }), "The Vyper version pragma statement in this file doesn't match any of the configured compilers in your config.");
            });
        });
    });
    describe("project produces abi without gas field", function () {
        (0, helpers_1.useFixtureProject)("generates-gas-field");
        (0, helpers_1.useEnvironment)();
        it("Should remove the gas field", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.TASK_COMPILE);
                chai_1.assert.isUndefined(JSON.parse(JSON.stringify(this.env.artifacts.readArtifactSync("A").abi))
                    .gas);
            });
        });
    });
    describe("project should not compile", function () {
        (0, helpers_1.useFixtureProject)("compilation-single-file-test-directive");
        (0, helpers_1.useEnvironment)();
        it("should throw an error because a test directive is present in the source file", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const filePath = path_1.default.join(__dirname, "fixture-projects", "compilation-single-file-test-directive", "contracts", "A.vy");
                yield (0, chai_1.expect)(this.env.run(task_names_1.TASK_COMPILE)).to.be.rejectedWith(`We found a test directive in the file at path ${filePath}.` +
                    ` Test directives are a Brownie feature not supported by Hardhat.` +
                    ` Learn more at https://hardhat.org/hardhat-runner/plugins/nomiclabs-hardhat-vyper#test-directives`);
            });
        });
    });
    describe("compile project with different ouput identifiers returned from the vyper compiler", function () {
        (0, helpers_1.useFixtureProject)("compilation-with-vyper-output-breakable-version");
        (0, helpers_1.useEnvironment)();
        it("Should successfully compile the contracts for versions >= 0.4.0", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield this.env.run(task_names_1.TASK_COMPILE);
                chai_1.assert.equal(this.env.artifacts.readArtifactSync("A").contractName, "A");
                chai_1.assert.equal(this.env.artifacts.readArtifactSync("B").contractName, "B");
            });
        });
    });
});
