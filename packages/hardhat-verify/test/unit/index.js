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
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const task_names_1 = require("../../src/internal/task-names");
const helpers_1 = require("../helpers");
describe("verify task", () => {
    (0, helpers_1.useEnvironment)("hardhat-project");
    describe(task_names_1.TASK_VERIFY_ETHERSCAN_RESOLVE_ARGUMENTS, () => {
        it("should throw if address is not provided", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_1.TASK_VERIFY_ETHERSCAN_RESOLVE_ARGUMENTS, {
                    constructorArgsParams: [],
                    constructorArgs: "constructor-args.js",
                    libraries: "libraries.js",
                })).to.be.rejectedWith(/You didn’t provide any address./);
            });
        });
        it("should throw if address is invalid", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_1.TASK_VERIFY_ETHERSCAN_RESOLVE_ARGUMENTS, {
                    address: "invalidAddress",
                    constructorArgsParams: [],
                    constructorArgs: "constructor-args.js",
                    libraries: "libraries.js",
                })).to.be.rejectedWith(/invalidAddress is an invalid address./);
            });
        });
        it("should throw if contract is not a fully qualified name", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_1.TASK_VERIFY_ETHERSCAN_RESOLVE_ARGUMENTS, {
                    address: (0, helpers_1.getRandomAddress)(this.hre),
                    constructorArgsParams: [],
                    constructorArgs: "constructor-args.js",
                    libraries: "libraries.js",
                    contract: "not-a-fully-qualified-name",
                })).to.be.rejectedWith(/A valid fully qualified name was expected./);
            });
        });
        it("should return the processed arguments", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const address = (0, helpers_1.getRandomAddress)(this.hre);
                const expectedArgs = {
                    address,
                    constructorArgs: [
                        50,
                        "a string argument",
                        {
                            x: 10,
                            y: 5,
                        },
                        "0xabcdef",
                    ],
                    libraries: {
                        NormalLib: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
                        ConstructorLib: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                    },
                    contractFQN: "contracts/TestContract.sol:TestContract",
                    force: false,
                };
                const processedArgs = yield this.hre.run(task_names_1.TASK_VERIFY_ETHERSCAN_RESOLVE_ARGUMENTS, {
                    address,
                    constructorArgsParams: [],
                    constructorArgs: "constructor-args.js",
                    libraries: "libraries.js",
                    contract: "contracts/TestContract.sol:TestContract",
                });
                chai_1.assert.deepEqual(processedArgs, expectedArgs);
            });
        });
    });
    describe(task_names_1.TASK_VERIFY_VERIFY, () => {
        it("should throw if constructorArguments is not an array", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_1.TASK_VERIFY_VERIFY, {
                    address: (0, helpers_1.getRandomAddress)(this.hre),
                    constructorArguments: { arg1: 1, arg2: 2 },
                    libraries: {},
                })).to.be.rejectedWith(/The constructorArguments parameter should be an array./);
            });
        });
        it("should throw if libraries is not an object", function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield (0, chai_1.expect)(this.hre.run(task_names_1.TASK_VERIFY_VERIFY, {
                    address: (0, helpers_1.getRandomAddress)(this.hre),
                    constructorArguments: [],
                    libraries: ["0x...1", "0x...2", "0x...3"],
                })).to.be.rejectedWith(/The libraries parameter should be a dictionary./);
            });
        });
    });
    describe(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS, () => {
        // suppress warnings
        let warnStub;
        beforeEach(() => {
            warnStub = sinon_1.default.stub(console, "warn");
        });
        afterEach(() => {
            warnStub.restore();
        });
        it("should return the etherscan subtask by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const verificationSubtasks = yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                chai_1.assert.isTrue(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_ETHERSCAN));
            });
        });
        it("should return the etherscan subtask if it is enabled", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const originalConfig = this.hre.config.etherscan;
                this.hre.config.etherscan = {
                    enabled: true,
                    apiKey: "",
                    customChains: [],
                };
                const verificationSubtasks = yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                this.hre.config.etherscan = originalConfig;
                chai_1.assert.isTrue(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_ETHERSCAN));
            });
        });
        it("should ignore the etherscan subtask if it is disabled", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const originalConfig = this.hre.config.etherscan;
                this.hre.config.etherscan = {
                    enabled: false,
                    apiKey: "",
                    customChains: [],
                };
                const verificationSubtasks = yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                this.hre.config.etherscan = originalConfig;
                chai_1.assert.isFalse(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_ETHERSCAN));
            });
        });
        it("should ignore the sourcify subtask by default", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const verificationSubtasks = yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                chai_1.assert.isFalse(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_SOURCIFY));
            });
        });
        it("should return the sourcify subtask if it is enabled", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const originalConfig = this.hre.config.sourcify;
                this.hre.config.sourcify = {
                    enabled: true,
                };
                const verificationSubtasks = yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                this.hre.config.sourcify = originalConfig;
                chai_1.assert.isTrue(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_SOURCIFY));
                chai_1.assert.isFalse(verificationSubtasks.some(({ subtaskName }) => subtaskName === task_names_1.TASK_VERIFY_SOURCIFY_DISABLED_WARNING));
            });
        });
        it("should provide a warning message if both etherscan and sourcify are disabled", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const originalEtherscanConfig = this.hre.config.etherscan;
                this.hre.config.etherscan = {
                    enabled: false,
                    apiKey: "",
                    customChains: [],
                };
                const originalSourcifyConfig = this.hre.config.etherscan;
                this.hre.config.sourcify = {
                    enabled: false,
                };
                yield this.hre.run(task_names_1.TASK_VERIFY_GET_VERIFICATION_SUBTASKS);
                this.hre.config.etherscan = originalEtherscanConfig;
                this.hre.config.sourcify = originalSourcifyConfig;
                chai_1.assert.isTrue(warnStub.calledOnce);
                (0, chai_1.expect)(warnStub).to.be.calledWith(sinon_1.default.match(/\[WARNING\] No verification services are enabled./));
            });
        });
    });
});
