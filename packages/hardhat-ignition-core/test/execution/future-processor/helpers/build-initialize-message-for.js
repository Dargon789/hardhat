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
const build_initialize_message_for_1 = require("../../../../src/internal/execution/future-processor/helpers/build-initialize-message-for");
const deployment_state_reducer_1 = require("../../../../src/internal/execution/reducers/deployment-state-reducer");
const execution_result_1 = require("../../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../../src/internal/execution/types/execution-state");
const jsonrpc_1 = require("../../../../src/internal/execution/types/jsonrpc");
const messages_1 = require("../../../../src/internal/execution/types/messages");
const network_interaction_1 = require("../../../../src/internal/execution/types/network-interaction");
const get_default_sender_1 = require("../../../../src/internal/execution/utils/get-default-sender");
const memory_journal_1 = require("../../../../src/internal/journal/memory-journal");
const module_1 = require("../../../../src/internal/module");
const module_2 = require("../../../../src/types/module");
const helpers_1 = require("../../../helpers");
describe("buildInitializeMessageFor", () => {
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    const libraryAddress = "0x742d35Cc6634C0532925a3b844Bc454e4438f44e";
    const basicStrategy = { name: "basic", config: {} };
    let namedContractDeployment;
    let anotherNamedContractDeployment;
    let safeMathLibraryDeployment;
    let artifactContractDeployment;
    let namedLibraryDeployment;
    let artifactLibraryDeployment;
    let namedContractCall;
    let staticCall;
    let encodedCall;
    let namedContractAt;
    let artifactContractAt;
    let readEventArgument;
    let sendData;
    let exampleDeploymentState;
    let mockDeploymentLoader;
    beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        const fakeModule = {};
        mockDeploymentLoader = (0, helpers_1.setupMockDeploymentLoader)(new memory_journal_1.MemoryJournal());
        safeMathLibraryDeployment = new module_1.NamedLibraryDeploymentFutureImplementation("MyModule:SafeMath", fakeModule, "SafeMath", {}, helpers_1.exampleAccounts[0]);
        anotherNamedContractDeployment =
            new module_1.NamedContractDeploymentFutureImplementation("MyModule:AnotherContract", {}, fakeModule, [], {}, 0n, helpers_1.exampleAccounts[0]);
        namedContractDeployment = new module_1.NamedContractDeploymentFutureImplementation("MyModule:TestContract", fakeModule, "TestContract", [1n, "b", anotherNamedContractDeployment, { sub: "d" }], {
            SafeMath: safeMathLibraryDeployment,
        }, 10n, helpers_1.exampleAccounts[0]);
        // This is typically done by the deployment builder
        namedContractDeployment.dependencies.add(anotherNamedContractDeployment);
        namedContractDeployment.dependencies.add(safeMathLibraryDeployment);
        artifactContractDeployment =
            new module_1.ArtifactContractDeploymentFutureImplementation("MyModule:ArtifactContract", fakeModule, "ArtifactContract", [1n, "b", anotherNamedContractDeployment, { sub: "d" }], helpers_1.fakeArtifact, {
                SafeMath: safeMathLibraryDeployment,
            }, 10n, helpers_1.exampleAccounts[0]);
        artifactContractDeployment.dependencies.add(anotherNamedContractDeployment);
        artifactContractDeployment.dependencies.add(safeMathLibraryDeployment);
        namedLibraryDeployment = new module_1.NamedLibraryDeploymentFutureImplementation("MyModule:NamedLibrary", fakeModule, "NamedLibrary", {
            SafeMath: safeMathLibraryDeployment,
        }, helpers_1.exampleAccounts[0]);
        namedLibraryDeployment.dependencies.add(safeMathLibraryDeployment);
        artifactLibraryDeployment =
            new module_1.ArtifactLibraryDeploymentFutureImplementation("MyModule:ArtifactLibrary", fakeModule, "ArtifactLibrary", helpers_1.fakeArtifact, {
                SafeMath: safeMathLibraryDeployment,
            }, helpers_1.exampleAccounts[0]);
        artifactLibraryDeployment.dependencies.add(safeMathLibraryDeployment);
        namedContractCall = new module_1.NamedContractCallFutureImplementation("MyModule:Call", fakeModule, "test", anotherNamedContractDeployment, [1n, "b", safeMathLibraryDeployment, { sub: "d" }], 0n, helpers_1.exampleAccounts[0]);
        namedContractCall.dependencies.add(anotherNamedContractDeployment);
        namedContractCall.dependencies.add(safeMathLibraryDeployment);
        staticCall = new module_1.NamedStaticCallFutureImplementation("MyModule:StaticCall", fakeModule, "staticTest", anotherNamedContractDeployment, [BigInt(1), "b", safeMathLibraryDeployment, { sub: "d" }], 0, helpers_1.exampleAccounts[0]);
        staticCall.dependencies.add(anotherNamedContractDeployment);
        staticCall.dependencies.add(safeMathLibraryDeployment);
        encodedCall = new module_1.NamedEncodeFunctionCallFutureImplementation("MyModule:EncodeFunctionCall", fakeModule, "test", anotherNamedContractDeployment, [1n, "b", safeMathLibraryDeployment, { sub: "d" }]);
        encodedCall.dependencies.add(anotherNamedContractDeployment);
        encodedCall.dependencies.add(safeMathLibraryDeployment);
        namedContractAt = new module_1.NamedContractAtFutureImplementation("MyModule:NamedContractAt", fakeModule, "NamedContractAt", differentAddress);
        artifactContractAt = new module_1.ArtifactContractAtFutureImplementation("MyModule:ArtifactContractAt", fakeModule, "ArtifactContractAt", differentAddress, helpers_1.fakeArtifact);
        readEventArgument = new module_1.ReadEventArgumentFutureImplementation("MyModule:ReadEventArg", fakeModule, anotherNamedContractDeployment, "event1", "arg1", anotherNamedContractDeployment, 0);
        yield mockDeploymentLoader.storeNamedArtifact("MyModule:AnotherContract", "AnotherContract", Object.assign(Object.assign({}, helpers_1.fakeArtifact), { contractName: "AnotherContract", abi: [
                {
                    type: "event",
                    name: "event1",
                    anonymous: false,
                    inputs: [
                        {
                            name: "arg1",
                            type: "uint256",
                            internalType: "uint256",
                            indexed: false,
                        },
                    ],
                },
                {
                    type: "function",
                    name: "test",
                    inputs: [
                        {
                            name: "a",
                            type: "uint256",
                        },
                        {
                            name: "b",
                            type: "string",
                        },
                        {
                            name: "c",
                            type: "address",
                        },
                        {
                            name: "d",
                            type: "tuple",
                            components: [
                                {
                                    name: "sub",
                                    type: "string",
                                },
                            ],
                        },
                    ],
                },
            ] }));
        sendData = new module_1.SendDataFutureImplementation("MyModule:SendData", fakeModule, helpers_1.exampleAccounts[4], 2n, "fake-data", helpers_1.exampleAccounts[3]);
        exampleDeploymentState = (0, deployment_state_reducer_1.deploymentStateReducer)(undefined);
        const exampleConfirmedTransaction = {
            hash: "0x1234",
            fees: {
                maxPriorityFeePerGas: 10n,
                maxFeePerGas: 100n,
            },
            receipt: {
                blockHash: "0xblock",
                blockNumber: 0,
                contractAddress: differentAddress,
                status: jsonrpc_1.TransactionReceiptStatus.SUCCESS,
                logs: [
                    {
                        address: differentAddress,
                        logIndex: 0,
                        // encoded 1000000000000000000n
                        data: "0x0000000000000000000000000000000000000000000000000de0b6b3a7640000",
                        topics: [
                            "0x84e603adc6c5752ecafe165459551af7ba28bb2e6a2bfacc9ccb8f0ae12c76e6", // matches event1
                        ],
                    },
                ],
            },
        };
        const exampleOnchainInteraction = {
            id: 1,
            type: network_interaction_1.NetworkInteractionType.ONCHAIN_INTERACTION,
            to: undefined,
            data: "0x",
            value: 0n,
            nonce: 1,
            transactions: [exampleConfirmedTransaction],
            shouldBeResent: false,
        };
        const safeMathExState = {
            type: execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE,
            futureType: module_2.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
            result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: libraryAddress,
            },
        };
        exampleDeploymentState.executionStates["MyModule:SafeMath"] =
            safeMathExState;
        const anotherContractExState = {
            type: execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE,
            networkInteractions: [exampleOnchainInteraction],
            result: {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: differentAddress,
            },
        };
        exampleDeploymentState.executionStates["MyModule:AnotherContract"] =
            anotherContractExState;
    }));
    describe("deployment state", () => {
        let message;
        describe("named contract deployment", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message for a deployment", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.equal(message.type, messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE);
            }));
            it("should record the strategy name", () => {
                chai_1.assert.equal(message.strategy, "basic");
            });
            it("should record the strategy config", () => {
                chai_1.assert.deepEqual(message.strategyConfig, {});
            });
            it("should copy across the dependencies", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.dependencies, [
                    "MyModule:AnotherContract",
                    "MyModule:SafeMath",
                ]);
            }));
            it("should record the value", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.value, BigInt(10));
            }));
            it("should resolve the constructor args", () => {
                chai_1.assert.deepStrictEqual(message.constructorArgs, [
                    BigInt(1),
                    "b",
                    differentAddress,
                    { sub: "d" },
                ]);
            });
            it("should resolve the address", () => {
                chai_1.assert.deepStrictEqual(message.from, helpers_1.exampleAccounts[0]);
            });
            it("should resolve the libraries", () => {
                chai_1.assert.deepStrictEqual(message.libraries, {
                    SafeMath: libraryAddress,
                });
            });
        });
        describe("artifact contract deployment", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(artifactContractDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message for a deployment", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:ArtifactContract",
                    futureType: module_2.FutureType.CONTRACT_DEPLOYMENT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: ["MyModule:AnotherContract", "MyModule:SafeMath"],
                    artifactId: "MyModule:ArtifactContract",
                    constructorArgs: [
                        1n,
                        "b",
                        differentAddress,
                        {
                            sub: "d",
                        },
                    ],
                    contractName: "ArtifactContract",
                    libraries: {
                        SafeMath: libraryAddress,
                    },
                    value: 10n,
                    from: helpers_1.exampleAccounts[0],
                });
            }));
        });
        describe("named library deployment", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedLibraryDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message for a deployment", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedLibrary",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_LIBRARY_DEPLOYMENT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: ["MyModule:SafeMath"],
                    artifactId: "MyModule:NamedLibrary",
                    constructorArgs: [],
                    contractName: "NamedLibrary",
                    libraries: {
                        SafeMath: libraryAddress,
                    },
                    value: 0n,
                    from: helpers_1.exampleAccounts[0],
                });
            }));
        });
        describe("artifact library deployment", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(artifactLibraryDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message for a deployment", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.DEPLOYMENT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:ArtifactLibrary",
                    futureType: module_2.FutureType.LIBRARY_DEPLOYMENT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: ["MyModule:SafeMath"],
                    artifactId: "MyModule:ArtifactLibrary",
                    constructorArgs: [],
                    contractName: "ArtifactLibrary",
                    libraries: {
                        SafeMath: libraryAddress,
                    },
                    value: 0n,
                    from: helpers_1.exampleAccounts[0],
                });
            }));
        });
        describe("resolves value when module parameter is used", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                namedContractDeployment.value =
                    new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "passedValue", undefined);
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, {
                    MyModule: {
                        passedValue: BigInt(99),
                    },
                }, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should record the value", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.value, BigInt(99));
            }));
        });
        describe("resolves value when module parameter is a global parameter", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                namedContractDeployment.value =
                    new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "passedValue", undefined);
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, {
                    $global: {
                        passedValue: BigInt(99),
                    },
                }, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should record the value", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.value, BigInt(99));
            }));
        });
        describe("resolves to default value for module parameter when no deployment parameters have been given", () => {
            const expectedDefaultValue = BigInt(100);
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                namedContractDeployment.value =
                    new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "passedValue", expectedDefaultValue);
                const deploymentParameters = undefined;
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, deploymentParameters, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should record the default value", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.value, expectedDefaultValue);
            }));
        });
        describe("resolves from when runtime account used", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                namedContractDeployment.from = new module_1.AccountRuntimeValueImplementation(1);
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should record the value", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.from, helpers_1.exampleAccounts[1]);
            }));
        });
        describe("When the from is undefined", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractDeployment, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should record the default sender", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message.from, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
            }));
        });
    });
    describe("contract call state", () => {
        let message;
        describe("named library", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractCall, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.CALL_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:Call",
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: ["MyModule:AnotherContract", "MyModule:SafeMath"],
                    artifactId: "MyModule:AnotherContract",
                    contractAddress: differentAddress,
                    functionName: "test",
                    args: [1n, "b", libraryAddress, { sub: "d" }],
                    value: 0n,
                    from: helpers_1.exampleAccounts[0],
                });
            }));
        });
    });
    describe("static call state", () => {
        let message;
        describe("named library", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(staticCall, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.STATIC_CALL_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:StaticCall",
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: ["MyModule:AnotherContract", "MyModule:SafeMath"],
                    artifactId: "MyModule:AnotherContract",
                    contractAddress: differentAddress,
                    functionName: "staticTest",
                    args: [1n, "b", libraryAddress, { sub: "d" }],
                    nameOrIndex: 0,
                    from: helpers_1.exampleAccounts[0],
                });
            }));
        });
    });
    describe("encode function call state", () => {
        let message;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(encodedCall, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
        }));
        it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
            chai_1.assert.deepStrictEqual(message, {
                type: messages_1.JournalMessageType.ENCODE_FUNCTION_CALL_EXECUTION_STATE_INITIALIZE,
                futureId: "MyModule:EncodeFunctionCall",
                strategy: "basic",
                strategyConfig: {},
                dependencies: ["MyModule:AnotherContract", "MyModule:SafeMath"],
                artifactId: "MyModule:AnotherContract",
                functionName: "test",
                args: [1n, "b", libraryAddress, { sub: "d" }],
                result: "0xd40c6f1500000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000080000000000000000000000000742d35cc6634c0532925a3b844bc454e4438f44e00000000000000000000000000000000000000000000000000000000000000c000000000000000000000000000000000000000000000000000000000000000016200000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000016400000000000000000000000000000000000000000000000000000000000000",
            });
        }));
    });
    describe("contract at state", () => {
        let message;
        describe("named contract at", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(namedContractAt, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:NamedContractAt",
                    contractAddress: differentAddress,
                    contractName: "NamedContractAt",
                });
            }));
        });
        describe("artifact contract at", () => {
            beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(artifactContractAt, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
            }));
            it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
                chai_1.assert.deepStrictEqual(message, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:ArtifactContractAt",
                    futureType: module_2.FutureType.CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:ArtifactContractAt",
                    contractAddress: differentAddress,
                    contractName: "ArtifactContractAt",
                });
            }));
        });
        describe("resolving address from module param", () => {
            it("should work based on the passed in deployment parameter", () => __awaiter(void 0, void 0, void 0, function* () {
                const m = yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(new module_1.NamedContractAtFutureImplementation("MyModule:NamedContractAt", {}, "ArtifactContractAt", new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "diffAddress", undefined)), exampleDeploymentState, basicStrategy, {
                    MyModule: {
                        diffAddress: differentAddress,
                    },
                }, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
                chai_1.assert.deepStrictEqual(m, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:NamedContractAt",
                    contractAddress: differentAddress,
                    contractName: "ArtifactContractAt",
                });
            }));
        });
        describe("resolving address from a deployment future", () => {
            it("should work based on the address of the deployed future", () => __awaiter(void 0, void 0, void 0, function* () {
                const m = yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(new module_1.NamedContractAtFutureImplementation("MyModule:NamedContractAt", {}, "NamedContractAt", anotherNamedContractDeployment), exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
                chai_1.assert.deepStrictEqual(m, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:NamedContractAt",
                    contractAddress: differentAddress,
                    contractName: "NamedContractAt",
                });
            }));
        });
        describe("resolving address from another contractAt", () => {
            beforeEach(() => {
                const namedContractAtExState = {
                    type: execution_state_1.ExecutionStateType.CONTRACT_AT_EXECUTION_STATE,
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    contractAddress: differentAddress,
                };
                exampleDeploymentState = Object.assign(Object.assign({}, exampleDeploymentState), { executionStates: Object.assign(Object.assign({}, exampleDeploymentState.executionStates), { ["MyModule:NamedContractAt"]: namedContractAtExState }) });
            });
            it("should work based on the address of the deployed future", () => __awaiter(void 0, void 0, void 0, function* () {
                const m = yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(new module_1.NamedContractAtFutureImplementation("MyModule:SecondNamedContractAt", {}, "SecondNamedContractAt", namedContractAt), exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
                chai_1.assert.deepStrictEqual(m, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:SecondNamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:SecondNamedContractAt",
                    contractAddress: differentAddress,
                    contractName: "SecondNamedContractAt",
                });
            }));
        });
        describe("resolving address from read event argument future", () => {
            beforeEach(() => {
                const readEventArgExState = {
                    type: execution_state_1.ExecutionStateType.READ_EVENT_ARGUMENT_EXECUTION_STATE,
                    result: differentAddress,
                };
                exampleDeploymentState = Object.assign(Object.assign({}, exampleDeploymentState), { executionStates: Object.assign(Object.assign({}, exampleDeploymentState.executionStates), { ["MyModule:ReadEventArg"]: readEventArgExState }) });
            });
            it("should work based on the arg result", () => __awaiter(void 0, void 0, void 0, function* () {
                const m = yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(new module_1.NamedContractAtFutureImplementation("MyModule:NamedContractAt", {}, "NamedContractAt", readEventArgument), exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
                chai_1.assert.deepStrictEqual(m, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:NamedContractAt",
                    contractName: "NamedContractAt",
                    contractAddress: differentAddress,
                });
            }));
        });
        describe("resolving address from static call", () => {
            beforeEach(() => {
                const staticCallExState = {
                    type: execution_state_1.ExecutionStateType.STATIC_CALL_EXECUTION_STATE,
                    result: {
                        type: execution_result_1.ExecutionResultType.SUCCESS,
                        value: differentAddress,
                    },
                };
                exampleDeploymentState = Object.assign(Object.assign({}, exampleDeploymentState), { executionStates: Object.assign(Object.assign({}, exampleDeploymentState.executionStates), { ["MyModule:StaticCall"]: staticCallExState }) });
            });
            it("should work based on the result of the static call", () => __awaiter(void 0, void 0, void 0, function* () {
                const m = yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(new module_1.NamedContractAtFutureImplementation("MyModule:NamedContractAt", {}, "NamedContractAt", staticCall), exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts));
                chai_1.assert.deepStrictEqual(m, {
                    type: messages_1.JournalMessageType.CONTRACT_AT_EXECUTION_STATE_INITIALIZE,
                    futureId: "MyModule:NamedContractAt",
                    futureType: module_2.FutureType.NAMED_ARTIFACT_CONTRACT_AT,
                    strategy: "basic",
                    strategyConfig: {},
                    dependencies: [],
                    artifactId: "MyModule:NamedContractAt",
                    contractName: "NamedContractAt",
                    contractAddress: differentAddress,
                });
            }));
        });
    });
    describe("read event argument state", () => {
        let message;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(readEventArgument, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
        }));
        it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
            chai_1.assert.deepStrictEqual(message, {
                type: messages_1.JournalMessageType.READ_EVENT_ARGUMENT_EXECUTION_STATE_INITIALIZE,
                futureId: "MyModule:ReadEventArg",
                strategy: "basic",
                strategyConfig: {},
                dependencies: [],
                artifactId: "MyModule:AnotherContract",
                eventName: "event1",
                nameOrIndex: "arg1",
                txToReadFrom: "0x1234",
                emitterAddress: differentAddress,
                eventIndex: 0,
                result: 1000000000000000000n,
            });
        }));
    });
    describe("send data state", () => {
        let message;
        beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
            message = (yield (0, build_initialize_message_for_1.buildInitializeMessageFor)(sendData, exampleDeploymentState, basicStrategy, {}, mockDeploymentLoader, helpers_1.exampleAccounts, (0, get_default_sender_1.getDefaultSender)(helpers_1.exampleAccounts)));
        }));
        it("should build an initialize message", () => __awaiter(void 0, void 0, void 0, function* () {
            chai_1.assert.deepStrictEqual(message, {
                type: messages_1.JournalMessageType.SEND_DATA_EXECUTION_STATE_INITIALIZE,
                futureId: "MyModule:SendData",
                strategy: "basic",
                strategyConfig: {},
                dependencies: [],
                to: helpers_1.exampleAccounts[4],
                data: "fake-data",
                from: helpers_1.exampleAccounts[3],
                value: 2n,
            });
        }));
    });
});
