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
const abi_1 = require("../../src/internal/execution/abi");
const libraries_1 = require("../../src/internal/execution/libraries");
const evm_execution_1 = require("../../src/internal/execution/types/evm-execution");
const helpers_1 = require("../helpers");
const execution_result_fixtures_1 = require("../helpers/execution-result-fixtures");
describe("abi", () => {
    // These tests validate that type conversions from the underlying abi library
    // (ethers v6 as of this writing) are working as expected, and that no type
    // of the library is used directly in the public API.
    describe("Type conversions", () => {
        // To decrease the amount of fixtures, these tests work like this:
        // We have functions that take and receive the same values.
        // Encoding the call and removing the selector would be equivalent to
        // an encoded result, which we decode and test.
        function getDecodedResults(artifact, functionName, args) {
            const encoded = (0, abi_1.encodeArtifactFunctionCall)(artifact, functionName, args);
            // If we remove the selector we should be able to decode the arguments
            // because the result has the same ABI
            const decodeResult = (0, abi_1.decodeArtifactFunctionCallResult)(artifact, functionName, `0x${encoded.substring(10)}` // Remove the selector
            );
            (0, chai_1.assert)(decodeResult.type === evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT);
            return decodeResult.values;
        }
        it("Should decode number types as bigint", () => {
            const args = [1n, -1n, 2n, -2n, 3n, -3n, 4n, -4n];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "numberTypes", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {},
            });
        });
        it("Should decode booleans as booleans", () => {
            const args = [true, false];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "booleans", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: { f: false },
            });
        });
        it("Should decode byte arrays (sized and dynamic) as strings", () => {
            const args = ["0x00112233445566778899", "0x100122"];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "byteArrays", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {},
            });
        });
        it("Should decode strings as strings", () => {
            const args = ["hello"];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "strings", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {},
            });
        });
        it("Should decode addresses as strings", () => {
            const args = ["0x1122334455667788990011223344556677889900"];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "addresses", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {},
            });
        });
        it("Should decode array (sized and dynamic) as arrays", () => {
            const args = [
                [1n, 2n, 3n],
                ["a", "b"],
                [1n, -2n, 3n, 4n, 5n, 6n, 7n, 8n, 9n, 0n],
            ];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "arrays", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {},
            });
        });
        it("Should decode structs as EvmTuples", () => {
            const args = [{ i: 1n }];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "structs", args);
            chai_1.assert.deepEqual(decoded, {
                positional: [
                    {
                        positional: [1n],
                        named: {
                            i: 1n,
                        },
                    },
                ],
                named: {},
            });
        });
        it("Should decode tuples as EvmTuples (including named and unnamed fields)", () => {
            const args = [1n, 2n];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "tuple", args);
            chai_1.assert.deepEqual(decoded, {
                positional: args,
                named: {
                    named: 2n,
                },
            });
        });
        it("Should apply this rules recursively", () => {
            const args = [[{ i: 1n }, [2n]], [[{ i: 3n }]]];
            const decoded = getDecodedResults(execution_result_fixtures_1.callEncodingFixtures.ToTestEthersEncodingConversion, "recursiveApplication", args);
            chai_1.assert.deepEqual(decoded, {
                positional: [
                    [
                        {
                            positional: [1n],
                            named: {
                                i: 1n,
                            },
                        },
                        {
                            positional: [2n],
                            named: { i: 2n },
                        },
                    ],
                    [
                        [
                            {
                                positional: [3n],
                                named: {
                                    i: 3n,
                                },
                            },
                        ],
                    ],
                ],
                named: {},
            });
        });
    });
    describe("decodeArtifactFunctionCallResult", () => {
        function decodeResult(contractName, functionName) {
            chai_1.assert.isDefined(execution_result_fixtures_1.staticCallResultFixturesArtifacts[contractName], `No artifact for ${contractName}`);
            chai_1.assert.isDefined(execution_result_fixtures_1.staticCallResultFixtures[contractName], `No fixtures for ${contractName}`);
            chai_1.assert.isDefined(execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName], `No fixtures for ${contractName}.${functionName}`);
            const decoded = (0, abi_1.decodeArtifactFunctionCallResult)(execution_result_fixtures_1.staticCallResultFixturesArtifacts[contractName], functionName, execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName].returnData);
            return {
                decoded,
                returnData: execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName].returnData,
            };
        }
        it("Should validate function names", () => {
            const artifact = execution_result_fixtures_1.callEncodingFixtures.WithComplexArguments;
            chai_1.assert.throws(() => {
                (0, abi_1.decodeArtifactFunctionCallResult)(artifact, "nonExistent", "0x");
            }, "Function 'nonExistent' not found in contract WithComplexArguments");
        });
        it("Should be able to decode a single successful result", () => {
            const { decoded } = decodeResult("C", "returnString");
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT,
                values: {
                    positional: ["hello"],
                    named: {},
                },
            });
        });
        it("Should be able to decode a succesful result without return values", () => {
            const { decoded } = decodeResult("C", "returnNothing");
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT,
                values: {
                    positional: [],
                    named: {},
                },
            });
        });
        it("Should be able to decode a succesful result with named and unnamed values", () => {
            const { decoded } = decodeResult("C", "withNamedAndUnamedOutputs");
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT,
                values: {
                    positional: [1n, true, "hello"],
                    named: { b: true, h: "hello" },
                },
            });
        });
        it("Should decode all numbers as bigint and byte types as 0x-prefixed hex strings", () => {
            const { decoded } = decodeResult("C", "withReturnTypes");
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT,
                values: {
                    positional: [
                        2n,
                        3n,
                        4n,
                        5n,
                        "0x11000000000000000000",
                        "0xaa",
                        [1n, 2n],
                        [123n],
                    ],
                    named: {},
                },
            });
        });
        it("Should be able to decode structs", () => {
            const { decoded } = decodeResult("C", "getStruct");
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT,
                values: {
                    positional: [
                        {
                            named: {
                                i: 123n,
                            },
                            positional: [123n],
                        },
                    ],
                    named: {},
                },
            });
        });
        // TODO: Validate that we throw a nice error in these cases
        describe.skip("Unsupported return types", () => {
            it("Should throw if a result type is a function", () => { });
            it("Should throw if a result type is a fixed<M>x<N>", () => { });
            it("Should throw if a result type is a ufixed<M>x<N>", () => { });
        });
    });
    describe("encodeArtifactDeploymentData", () => {
        it("Should encode the constructor arguments and append them", () => __awaiter(void 0, void 0, void 0, function* () {
            const artifact = execution_result_fixtures_1.deploymentFixturesArtifacts.WithComplexDeploymentArguments;
            const encoded = (0, abi_1.encodeArtifactDeploymentData)(artifact, [[1n]], {});
            // It should include the number padded to 32 bytes
            chai_1.assert.equal(encoded, artifact.bytecode + "1".padStart(64, "0"));
        }));
        it("Should link libraries", () => __awaiter(void 0, void 0, void 0, function* () {
            const artifact = execution_result_fixtures_1.deploymentFixturesArtifacts.WithLibrary;
            const libAddress = "0x00000000219ab540356cBB839Cbe05303d7705Fa";
            const libraries = { Lib: libAddress };
            const encoded = (0, abi_1.encodeArtifactDeploymentData)(artifact, [], libraries);
            chai_1.assert.notEqual(encoded, artifact.bytecode);
            chai_1.assert.isTrue(encoded.startsWith((0, libraries_1.linkLibraries)(artifact, libraries)));
        }));
        // TODO: Validate that we throw a nice error in these cases
        describe.skip("Unsupported return types", () => {
            it("Should throw if an argument type is a function", () => { });
            it("Should throw if an argument type is a fixed<M>x<N>", () => { });
            it("Should throw if an argument type is a ufixed<M>x<N>", () => { });
        });
    });
    describe("encodeArtifactFunctionCall", () => {
        it("Should validate function names", () => {
            const artifact = execution_result_fixtures_1.callEncodingFixtures.WithComplexArguments;
            chai_1.assert.throws(() => {
                (0, abi_1.encodeArtifactFunctionCall)(artifact, "nonExistent", []);
            }, "Function 'nonExistent' not found in contract WithComplexArguments");
        });
        it("Should encode the arguments and return them", () => {
            const artifact = execution_result_fixtures_1.callEncodingFixtures.WithComplexArguments;
            // S memory s,
            // bytes32 b32,
            // bytes memory b,
            // string[] memory ss
            const args = [
                [1n],
                "0x1122334455667788990011223344556677889900112233445566778899001122",
                "0x1234",
                ["hello", "world"],
            ];
            const encoded = (0, abi_1.encodeArtifactFunctionCall)(artifact, "foo", args);
            // If we remove the selector we should be able to decode the arguments
            // because the result has the same ABI
            const decodeResult = (0, abi_1.decodeArtifactFunctionCallResult)(artifact, "foo", `0x${encoded.substring(10)}` // Remove the selector
            );
            (0, chai_1.assert)(decodeResult.type === evm_execution_1.EvmExecutionResultTypes.SUCESSFUL_RESULT);
            chai_1.assert.deepEqual(decodeResult.values, {
                positional: [
                    {
                        positional: [1n],
                        named: { i: 1n },
                    },
                    "0x1122334455667788990011223344556677889900112233445566778899001122",
                    "0x1234",
                    ["hello", "world"],
                ],
                named: {},
            });
        });
        // TODO: Validate that we throw a nice error in these cases
        describe.skip("Unsupported return types", () => {
            it("Should throw if an argument type is a function", () => { });
            it("Should throw if an argument type is a fixed<M>x<N>", () => { });
            it("Should throw if an argument type is a ufixed<M>x<N>", () => { });
        });
    });
    describe("decodeArtifactCustomError", () => {
        it("Should succesfully decode a custom error", () => {
            const artifact = execution_result_fixtures_1.staticCallResultFixturesArtifacts.C;
            const decoded = (0, abi_1.decodeArtifactCustomError)(artifact, execution_result_fixtures_1.staticCallResultFixtures.C.revertWithCustomError.returnData);
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_CUSTOM_ERROR,
                errorName: "CustomError",
                args: {
                    positional: [1n, true],
                    named: {
                        b: true,
                    },
                },
            });
        });
        it("Should return invalid data error if the custom error is recognized but can't be decoded", () => {
            const artifact = execution_result_fixtures_1.staticCallResultFixturesArtifacts.C;
            const decoded = (0, abi_1.decodeArtifactCustomError)(artifact, execution_result_fixtures_1.staticCallResultFixtures.C.revertWithInvalidCustomError.returnData);
            chai_1.assert.deepEqual(decoded, {
                type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA,
                data: execution_result_fixtures_1.staticCallResultFixtures.C.revertWithInvalidCustomError
                    .returnData,
            });
        });
        it("Should return undefined if no custom error is recognized", () => {
            const artifact = execution_result_fixtures_1.staticCallResultFixturesArtifacts.C;
            const decoded = (0, abi_1.decodeArtifactCustomError)(artifact, execution_result_fixtures_1.staticCallResultFixtures.C.revertWithUnknownCustomError.returnData);
            chai_1.assert.isUndefined(decoded);
        });
    });
    describe("Error decoding", () => {
        function decode(contractName, functionName) {
            const decoded = (0, abi_1.decodeError)(execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName].returnData, execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName]
                .customErrorReported, (returnData) => (0, abi_1.decodeArtifactCustomError)(execution_result_fixtures_1.staticCallResultFixturesArtifacts[contractName], returnData));
            return {
                decoded,
                returnData: execution_result_fixtures_1.staticCallResultFixtures[contractName][functionName].returnData,
            };
        }
        describe("decodeError", () => {
            describe("Revert without reason", () => {
                describe("When the function doesn't return anything so its a clash with a revert without reason", () => {
                    it("should return RevertWithoutReason", () => __awaiter(void 0, void 0, void 0, function* () {
                        const { decoded } = decode("C", "revertWithoutReasonClash");
                        chai_1.assert.deepEqual(decoded, {
                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITHOUT_REASON,
                        });
                    }));
                });
                describe("When the function returns something and there's no clash", () => {
                    it("should return RevertWithoutReason", () => __awaiter(void 0, void 0, void 0, function* () {
                        const { decoded } = decode("C", "revertWithoutReasonWithoutClash");
                        chai_1.assert.deepEqual(decoded, {
                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITHOUT_REASON,
                        });
                    }));
                });
            });
            it("should return RevertWithReason if a reason is given", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded } = decode("C", "revertWithReasonMessage");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                    message: "reason",
                });
            }));
            it("should return RevertWithReason if an empty reason is given", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded } = decode("C", "revertWithEmptyReasonMessage");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_REASON,
                    message: "",
                });
            }));
            it("should return RevertWithInvalidData if the revert reason signature is used incorrectlt", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithInvalidErrorMessage");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA,
                    data: returnData,
                });
            }));
            it("should return RevertWithPanicCode if a panic code is given", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded } = decode("C", "revertWithPanicCode");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_PANIC_CODE,
                    panicCode: 0x12,
                    panicName: "DIVIDE_BY_ZERO",
                });
            }));
            it("should return RevertWithInvalidData if the panic code signature is used incorrectly", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithInvalidErrorMessage");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA,
                    data: returnData,
                });
            }));
            it("should return RevertWithInvalidData if the panic code signature is used correctly but with a non-existing invalid code", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithNonExistentPanicCode");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA,
                    data: returnData,
                });
            }));
            it("should return RevertWithCustomError if a custom error is used", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded } = decode("C", "revertWithCustomError");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_CUSTOM_ERROR,
                    errorName: "CustomError",
                    args: {
                        positional: [1n, true],
                        named: {
                            b: true,
                        },
                    },
                });
            }));
            it("should return RevertWithInvalidData if the custom error signature is used incorrectly", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithInvalidCustomError");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA,
                    data: returnData,
                });
            }));
            it("should return RevertWithUnknownCustomError if the JSON-RPC errors with a message indicating that there was a custom error", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithUnknownCustomError");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_UNKNOWN_CUSTOM_ERROR,
                    signature: returnData.slice(0, 10),
                    data: returnData,
                });
            }));
            it("should return RevertWithInvalidDataOrUnknownCustomError if the returned data is actually invalid", () => __awaiter(void 0, void 0, void 0, function* () {
                const { decoded, returnData } = decode("C", "revertWithInvalidData");
                chai_1.assert.deepEqual(decoded, {
                    type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITH_INVALID_DATA_OR_UNKNOWN_CUSTOM_ERROR,
                    signature: returnData.slice(0, 10),
                    data: returnData,
                });
            }));
            describe("Invalid opcode", () => {
                describe("When the function doesn't return anything so its a clash with an invalid opcode", () => {
                    it("should return RevertWithoutReason", () => __awaiter(void 0, void 0, void 0, function* () {
                        const { decoded } = decode("C", "invalidOpcodeClash");
                        chai_1.assert.deepEqual(decoded, {
                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITHOUT_REASON,
                        });
                    }));
                });
                describe("When the function returns something and there's no clash", () => {
                    it("should return RevertWithoutReason", () => __awaiter(void 0, void 0, void 0, function* () {
                        const { decoded } = decode("C", "invalidOpcode");
                        chai_1.assert.deepEqual(decoded, {
                            type: evm_execution_1.EvmExecutionResultTypes.REVERT_WITHOUT_REASON,
                        });
                    }));
                });
            });
        });
    });
    describe("validations", () => {
        describe("validateArtifactFunctionName", () => {
            it("Should throw if the function name is not valid", () => {
                (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "12").map((e) => e.message), `Invalid function name '12'`);
                (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "asd(123, asd").map((e) => e.message), `Invalid function name 'asd(123, asd'`);
            });
            it("Should throw if the function name is not found", () => {
                (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "nonExistentFunction").map((e) => e.message), `Function 'nonExistentFunction' not found in contract FunctionNameValidation`);
                (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "nonExistentFunction2(uint,bytes32)").map((e) => e.message), `Function 'nonExistentFunction2(uint,bytes32)' not found in contract FunctionNameValidation`);
            });
            describe("Not overlaoded functions", () => {
                it("Should not throw if the bare function name is used and the function exists", () => {
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "noOverloads");
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "_$_weirdName");
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "$_weirdName2");
                });
                it("Should throw if the function name with types is used", () => {
                    (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "noOverloads()").map((e) => e.message), `Function name 'noOverloads()' used for contract FunctionNameValidation, but it's not overloaded. Use 'noOverloads' instead.`);
                });
            });
            describe("Overloaded functions", () => {
                it("Should throw if the bare function name is used", () => {
                    (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withTypeBasedOverloads").map((e) => e.message), `Function 'withTypeBasedOverloads' is overloaded in contract FunctionNameValidation. Please use one of these names instead:

* withTypeBasedOverloads(uint256)
* withTypeBasedOverloads(int256)`);
                    (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withParamCountOverloads").map((e) => e.message), `Function 'withParamCountOverloads' is overloaded in contract FunctionNameValidation. Please use one of these names instead:

* withParamCountOverloads()
* withParamCountOverloads(int256)`);
                });
                it("Should throw if the overload described by the function name doesn't exist", () => {
                    (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withTypeBasedOverloads(bool)").map((e) => e.message), `Function 'withTypeBasedOverloads(bool)' is not a valid overload of 'withTypeBasedOverloads' in contract FunctionNameValidation. Please use one of these names instead:

* withTypeBasedOverloads(uint256)
* withTypeBasedOverloads(int256)`);
                    (0, helpers_1.assertValidationError)((0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withParamCountOverloads(bool)").map((e) => e.message), `Function 'withParamCountOverloads(bool)' is not a valid overload of 'withParamCountOverloads' in contract FunctionNameValidation. Please use one of these names instead:

* withParamCountOverloads()
* withParamCountOverloads(int256)`);
                });
                it("Should not throw if the overload described by the function name exists", () => {
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withTypeBasedOverloads(uint256)");
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "withParamCountOverloads(int256)");
                    (0, abi_1.validateArtifactFunctionName)(execution_result_fixtures_1.callEncodingFixtures.FunctionNameValidation, "complexTypeOverload((uint256,uint32,string)[])");
                });
            });
        });
        describe("validateArtifactEventArgumentParams", () => {
            describe("Overloaded event names", () => {
                // This tests should match those of validateArtifactFunctionName
            });
            describe("Param existance validation", () => {
                it("Should throw if the named param doesn't exist", () => { });
                it("Should throw if the positional param doesn't exist", () => { });
                it("Should not throw if the named/positional param doesn't exist", () => { });
            });
            describe("Indexed params", () => {
                it("Should throw when trying to read an indexed string", () => { });
                it("Should throw when trying to read an indexed array", () => { });
                it("Should throw when trying to read an indexed struct", () => { });
                it("Should throw when trying to read an indexed bytes", () => { });
                it("Should not throw when trying to read an indexed address", () => { });
                it("Should not throw when trying to read an indexed uint", () => { });
            });
        });
    });
});
