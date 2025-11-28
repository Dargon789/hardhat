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
const path_1 = __importDefault(require("path"));
const src_1 = require("../src");
describe("status", () => {
    it("should return a status result for a successful deployment", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResult = {
            started: [],
            successful: ["LockModule#Lock"],
            held: [],
            timedOut: [],
            failed: [],
            chainId: 1,
            contracts: {
                "LockModule#Lock": {
                    id: "LockModule#Lock",
                    contractName: "Lock",
                    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                    sourceName: "contracts/Lock.sol",
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "uint256",
                                    name: "_unlockTime",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "payable",
                            type: "constructor",
                        },
                        {
                            anonymous: false,
                            inputs: [
                                {
                                    indexed: false,
                                    internalType: "uint256",
                                    name: "amount",
                                    type: "uint256",
                                },
                                {
                                    indexed: false,
                                    internalType: "uint256",
                                    name: "when",
                                    type: "uint256",
                                },
                            ],
                            name: "Withdrawal",
                            type: "event",
                        },
                        {
                            inputs: [],
                            name: "owner",
                            outputs: [
                                {
                                    internalType: "address payable",
                                    name: "",
                                    type: "address",
                                },
                            ],
                            stateMutability: "view",
                            type: "function",
                        },
                        {
                            inputs: [],
                            name: "unlockTime",
                            outputs: [
                                {
                                    internalType: "uint256",
                                    name: "",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "view",
                            type: "function",
                        },
                        {
                            inputs: [],
                            name: "withdraw",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ],
                },
            },
        };
        const deploymentDir = path_1.default.join(__dirname, "mocks", "status", "success");
        const result = yield (0, src_1.status)(deploymentDir);
        chai_1.assert.deepEqual(result, expectedResult);
    }));
    it("should return a status result for a successful deployment with external artifacts", () => __awaiter(void 0, void 0, void 0, function* () {
        const expectedResult = {
            started: [],
            successful: ["LockModule#Basic", "LockModule#Basic2", "LockModule#Lock"],
            held: [],
            timedOut: [],
            failed: [],
            chainId: 31337,
            contracts: {
                "LockModule#Basic": {
                    id: "LockModule#Basic",
                    contractName: "Basic",
                    address: "0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
                    sourceName: "contracts/Basic.sol",
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "uint256",
                                    name: "a",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "b",
                                    type: "uint256",
                                },
                            ],
                            name: "add",
                            outputs: [
                                {
                                    internalType: "uint256",
                                    name: "",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "pure",
                            type: "function",
                        },
                    ],
                },
                "LockModule#Basic2": {
                    id: "LockModule#Basic2",
                    contractName: "Basic",
                    address: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
                    sourceName: "contracts/Basic.sol",
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "uint256",
                                    name: "a",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "b",
                                    type: "uint256",
                                },
                            ],
                            name: "add",
                            outputs: [
                                {
                                    internalType: "uint256",
                                    name: "",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "pure",
                            type: "function",
                        },
                    ],
                },
                "LockModule#Lock": {
                    id: "LockModule#Lock",
                    contractName: "Lock",
                    address: "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
                    sourceName: "contracts/Lock.sol",
                    abi: [
                        {
                            inputs: [
                                {
                                    internalType: "uint256",
                                    name: "_unlockTime",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "payable",
                            type: "constructor",
                        },
                        {
                            anonymous: false,
                            inputs: [
                                {
                                    indexed: false,
                                    internalType: "uint256",
                                    name: "amount",
                                    type: "uint256",
                                },
                                {
                                    indexed: false,
                                    internalType: "uint256",
                                    name: "when",
                                    type: "uint256",
                                },
                            ],
                            name: "Withdrawal",
                            type: "event",
                        },
                        {
                            inputs: [],
                            name: "owner",
                            outputs: [
                                {
                                    internalType: "address payable",
                                    name: "",
                                    type: "address",
                                },
                            ],
                            stateMutability: "view",
                            type: "function",
                        },
                        {
                            inputs: [],
                            name: "unlockTime",
                            outputs: [
                                {
                                    internalType: "uint256",
                                    name: "",
                                    type: "uint256",
                                },
                            ],
                            stateMutability: "view",
                            type: "function",
                        },
                        {
                            inputs: [],
                            name: "withdraw",
                            outputs: [],
                            stateMutability: "nonpayable",
                            type: "function",
                        },
                    ],
                },
            },
        };
        const deploymentDir = path_1.default.join(__dirname, "mocks", "status", "external-artifact");
        const result = yield (0, src_1.status)(deploymentDir);
        chai_1.assert.deepEqual(result, expectedResult);
    }));
    it("should throw an error if the deployment is not initialized", () => __awaiter(void 0, void 0, void 0, function* () {
        yield chai_1.assert.isRejected((0, src_1.status)("fake"), /IGN800: Cannot get status for nonexistant deployment at fake/);
    }));
});
