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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
const verify_1 = require("../src/verify");
describe("verify", () => {
    it("should not verify an unitialized deployment", () => __awaiter(void 0, void 0, void 0, function* () {
        yield chai_1.assert.isRejected((0, src_1.getVerificationInformation)("test").next(), /IGN1000: Cannot verify contracts for nonexistant deployment at test/);
    }));
    it("should not verify a deployment that did not deploy any contracts", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "no-contracts");
        yield chai_1.assert.isRejected((0, src_1.getVerificationInformation)(deploymentDir).next(), /IGN1001: Cannot verify deployment/);
    }));
    it("should not verify a deployment deployed to an unsupported chain", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "unsupported-chain");
        yield chai_1.assert.isRejected((0, src_1.getVerificationInformation)(deploymentDir).next(), /IGN1002: Verification not natively supported for chainId 123456789\. Please use a custom chain configuration to add support\./);
    }));
    it("should yield a verify result", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResult = [
            {
                network: "mainnet",
                chainId: 1,
                urls: {
                    apiURL: "https://api.etherscan.io/api",
                    browserURL: "https://etherscan.io",
                },
            },
            {
                address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                compilerVersion: "v0.8.19+commit.7dd6d404",
                sourceCode: `{"language":"Solidity","sources":{"contracts/Lock.sol":{"content":"// SPDX-License-Identifier: UNLICENSED\\npragma solidity ^0.8.9;\\n\\n// Uncomment this line to use console.log\\n// import \\"hardhat/console.sol\\";\\n\\ncontract Lock {\\n  uint public unlockTime;\\n  address payable public owner;\\n\\n  event Withdrawal(uint amount, uint when);\\n\\n  constructor(uint _unlockTime) payable {\\n    require(\\n      block.timestamp < _unlockTime,\\n      \\"Unlock time should be in the future\\"\\n    );\\n\\n    unlockTime = _unlockTime;\\n    owner = payable(msg.sender);\\n  }\\n\\n  function withdraw() public {\\n    // Uncomment this line, and the import of \\"hardhat/console.sol\\", to print a log in your terminal\\n    // console.log(\\"Unlock time is %o and block timestamp is %o\\", unlockTime, block.timestamp);\\n\\n    require(block.timestamp >= unlockTime, \\"You can't withdraw yet\\");\\n    require(msg.sender == owner, \\"You aren't the owner\\");\\n\\n    emit Withdrawal(address(this).balance, block.timestamp);\\n\\n    owner.transfer(address(this).balance);\\n  }\\n}\\n"}},"settings":{"optimizer":{"enabled":false,"runs":200},"outputSelection":{"*":{"*":["abi","evm.bytecode","evm.deployedBytecode","evm.methodIdentifiers","metadata"],"":["ast"]}}}}`,
                name: "contracts/Lock.sol:Lock",
                args: "00000000000000000000000000000000000000000000000000000000767d1650",
            },
        ];
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "success");
        const result = (yield (0, src_1.getVerificationInformation)(deploymentDir).next())
            .value;
        chai_1.assert.deepEqual(result, expectedResult);
    }));
    it("should yield a null verify result for a contract with external artifacts", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResult1 = [null, "LockModule#Basic"];
        const expectedResult2 = [
            {
                network: "sepolia",
                chainId: 11155111,
                urls: {
                    apiURL: "https://api-sepolia.etherscan.io/api",
                    browserURL: "https://sepolia.etherscan.io",
                },
            },
            {
                address: "0x8f19334E79b16112E2D74E9Bc2246cB3cbA3cfaa",
                compilerVersion: "v0.8.19+commit.7dd6d404",
                sourceCode: `{"language":"Solidity","sources":{"contracts/Lock.sol":{"content":"// SPDX-License-Identifier: UNLICENSED\\npragma solidity ^0.8.9;\\n\\n// Uncomment this line to use console.log\\n// import \\"hardhat/console.sol\\";\\n\\ncontract Lock {\\n  uint public unlockTime;\\n  address payable public owner;\\n\\n  event Withdrawal(uint amount, uint when);\\n\\n  constructor(uint _unlockTime) payable {\\n    require(\\n      block.timestamp < _unlockTime,\\n      \\"Unlock time should be in the future\\"\\n    );\\n\\n    unlockTime = _unlockTime;\\n    owner = payable(msg.sender);\\n  }\\n\\n  function withdraw() public {\\n    // Uncomment this line, and the import of \\"hardhat/console.sol\\", to print a log in your terminal\\n    // console.log(\\"Unlock time is %o and block timestamp is %o\\", unlockTime, block.timestamp);\\n\\n    require(block.timestamp >= unlockTime, \\"You can't withdraw yet\\");\\n    require(msg.sender == owner, \\"You aren't the owner\\");\\n\\n    emit Withdrawal(address(this).balance, block.timestamp);\\n\\n    owner.transfer(address(this).balance);\\n  }\\n}\\n"}},"settings":{"optimizer":{"enabled":false,"runs":200},"outputSelection":{"*":{"*":["abi","evm.bytecode","evm.deployedBytecode","evm.methodIdentifiers","metadata"],"":["ast"]}}}}`,
                name: "contracts/Lock.sol:Lock",
                args: "00000000000000000000000000000000000000000000000000000000767d1650",
            },
        ];
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "external-artifacts");
        const generator = (0, src_1.getVerificationInformation)(deploymentDir);
        const result1 = (yield generator.next()).value;
        chai_1.assert.deepEqual(result1, expectedResult1);
        const result2 = yield (yield generator.next()).value;
        chai_1.assert.deepEqual(result2, expectedResult2);
    }));
    it("should yield a verify result with a custom chain", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResult = [
            {
                network: "mainnet",
                chainId: 1,
                urls: {
                    apiURL: "overridden",
                    browserURL: "also overridden",
                },
            },
            {
                address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                compilerVersion: "v0.8.19+commit.7dd6d404",
                sourceCode: `{"language":"Solidity","sources":{"contracts/Lock.sol":{"content":"// SPDX-License-Identifier: UNLICENSED\\npragma solidity ^0.8.9;\\n\\n// Uncomment this line to use console.log\\n// import \\"hardhat/console.sol\\";\\n\\ncontract Lock {\\n  uint public unlockTime;\\n  address payable public owner;\\n\\n  event Withdrawal(uint amount, uint when);\\n\\n  constructor(uint _unlockTime) payable {\\n    require(\\n      block.timestamp < _unlockTime,\\n      \\"Unlock time should be in the future\\"\\n    );\\n\\n    unlockTime = _unlockTime;\\n    owner = payable(msg.sender);\\n  }\\n\\n  function withdraw() public {\\n    // Uncomment this line, and the import of \\"hardhat/console.sol\\", to print a log in your terminal\\n    // console.log(\\"Unlock time is %o and block timestamp is %o\\", unlockTime, block.timestamp);\\n\\n    require(block.timestamp >= unlockTime, \\"You can't withdraw yet\\");\\n    require(msg.sender == owner, \\"You aren't the owner\\");\\n\\n    emit Withdrawal(address(this).balance, block.timestamp);\\n\\n    owner.transfer(address(this).balance);\\n  }\\n}\\n"}},"settings":{"optimizer":{"enabled":false,"runs":200},"outputSelection":{"*":{"*":["abi","evm.bytecode","evm.deployedBytecode","evm.methodIdentifiers","metadata"],"":["ast"]}}}}`,
                name: "contracts/Lock.sol:Lock",
                args: "00000000000000000000000000000000000000000000000000000000767d1650",
            },
        ];
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "success");
        const result = (yield (0, src_1.getVerificationInformation)(deploymentDir, [
            {
                network: "mainnet",
                chainId: 1,
                urls: {
                    apiURL: "overridden",
                    browserURL: "also overridden",
                },
            },
        ]).next()).value;
        chai_1.assert.deepEqual(result, expectedResult);
    }));
    it("should yield a verify result for contract with libraries", () => __awaiter(void 0, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        const librariesResult = {
            "contracts/Lib.sol": {
                UUUUU: "0x0B014cb3B1AF9F45123195B37538Fb9dB6F5eF5F",
            },
        };
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "libraries");
        let success = false;
        try {
            for (var _d = true, _e = __asyncValues((0, src_1.getVerificationInformation)(deploymentDir)), _f; _f = yield _e.next(), _a = _f.done, !_a;) {
                _c = _f.value;
                _d = false;
                try {
                    const [chainInfo, info] = _c;
                    (0, chai_1.assert)(chainInfo !== null);
                    if (info.name === "contracts/Lock.sol:WAAIT") {
                        const librariesOutput = JSON.parse(info.sourceCode).settings.libraries;
                        chai_1.assert.deepEqual(librariesOutput, librariesResult);
                        success = true;
                        break;
                    }
                }
                finally {
                    _d = true;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_d && !_a && (_b = _e.return)) yield _b.call(_e);
            }
            finally { if (e_1) throw e_1.error; }
        }
        chai_1.assert.isTrue(success);
    }));
    // The build info for the mock used in this test contains compilation info for "Lock.sol" as well,
    // which was not part of the deployment.
    // This test ensures that it is not included in the verification info, as well as that the other
    // contracts in the deployment are not sent if they are not needed for the requested contract.
    it("should yield a verify result containing only the requested contract", () => __awaiter(void 0, void 0, void 0, function* () {
        var _g, e_2, _h, _j;
        const expectedResultMap = {
            "contracts/TestA.sol:TestA": [
                "contracts/TestA.sol",
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestB.sol:TestB": [
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestC.sol:TestC": [
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestD.sol:TestD": ["contracts/TestD.sol"],
        };
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "min-input");
        try {
            for (var _k = true, _l = __asyncValues((0, src_1.getVerificationInformation)(deploymentDir)), _m; _m = yield _l.next(), _g = _m.done, !_g;) {
                _j = _m.value;
                _k = false;
                try {
                    const [contractInfo, info] = _j;
                    (0, chai_1.assert)(contractInfo !== null);
                    const expectedSources = expectedResultMap[info.name];
                    const actualSources = Object.keys(JSON.parse(info.sourceCode).sources);
                    chai_1.assert.deepEqual(actualSources, expectedSources);
                }
                finally {
                    _k = true;
                }
            }
        }
        catch (e_2_1) { e_2 = { error: e_2_1 }; }
        finally {
            try {
                if (!_k && !_g && (_h = _l.return)) yield _h.call(_l);
            }
            finally { if (e_2) throw e_2.error; }
        }
    }));
    it("should yield a verify result containing all available contracts when `includeUnrelatedContracts` is enabled", () => __awaiter(void 0, void 0, void 0, function* () {
        var _o, e_3, _p, _q;
        const expectedResultMap = {
            "contracts/TestA.sol:TestA": [
                "contracts/TestA.sol",
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestB.sol:TestB": [
                "contracts/TestA.sol",
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestC.sol:TestC": [
                "contracts/TestA.sol",
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
            "contracts/TestD.sol:TestD": [
                "contracts/TestA.sol",
                "contracts/TestB.sol",
                "contracts/TestC.sol",
                "contracts/TestD.sol",
            ],
        };
        const deploymentDir = path_1.default.join(__dirname, "mocks", "verify", "min-input");
        try {
            for (var _r = true, _s = __asyncValues((0, src_1.getVerificationInformation)(deploymentDir, undefined, true)), _t; _t = yield _s.next(), _o = _t.done, !_o;) {
                _q = _t.value;
                _r = false;
                try {
                    const [contractInfo, info] = _q;
                    (0, chai_1.assert)(contractInfo !== null);
                    const expectedSources = expectedResultMap[info.name];
                    const actualSources = Object.keys(JSON.parse(info.sourceCode).sources);
                    chai_1.assert.deepEqual(actualSources, expectedSources);
                }
                finally {
                    _r = true;
                }
            }
        }
        catch (e_3_1) { e_3 = { error: e_3_1 }; }
        finally {
            try {
                if (!_r && !_o && (_p = _s.return)) yield _p.call(_s);
            }
            finally { if (e_3) throw e_3.error; }
        }
    }));
    describe("getImportSourceNames", () => {
        const exampleBuildInfo = {
            _format: "hh-sol-artifact-1",
            id: "example",
            solcVersion: "0.8.19",
            solcLongVersion: "0.8.19+commit.7dd6d404",
            input: {
                language: "Solidity",
                settings: {
                    optimizer: {},
                    outputSelection: {},
                },
                sources: {},
            },
            output: {
                contracts: {},
                sources: {},
            },
        };
        it("should handle circular imports", () => {
            const buildInfo = Object.assign(Object.assign({}, exampleBuildInfo), { input: Object.assign(Object.assign({}, exampleBuildInfo.input), { sources: {
                        "contracts/A.sol": {
                            content: 'import "./B.sol";',
                        },
                        "contracts/B.sol": {
                            content: 'import "./A.sol";',
                        },
                    } }) });
            const result = (0, verify_1.getImportSourceNames)("contracts/A.sol", buildInfo);
            chai_1.assert.deepEqual(result, ["contracts/B.sol", "contracts/A.sol"]);
        });
        it("should handle indirect circular imports", () => {
            const buildInfo = Object.assign(Object.assign({}, exampleBuildInfo), { input: Object.assign(Object.assign({}, exampleBuildInfo.input), { sources: {
                        "contracts/A.sol": {
                            content: 'import "./B.sol";',
                        },
                        "contracts/B.sol": {
                            content: 'import "./C.sol";',
                        },
                        "contracts/C.sol": {
                            content: 'import "./A.sol";',
                        },
                    } }) });
            const result = (0, verify_1.getImportSourceNames)("contracts/A.sol", buildInfo);
            chai_1.assert.deepEqual(result, [
                "contracts/B.sol",
                "contracts/C.sol",
                "contracts/A.sol",
            ]);
        });
    });
});
