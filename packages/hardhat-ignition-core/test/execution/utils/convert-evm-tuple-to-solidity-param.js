"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const convert_evm_tuple_to_solidity_param_1 = require("../../../src/internal/execution/utils/convert-evm-tuple-to-solidity-param");
describe("converting evm tuples to solidity params", () => {
    it("should convert a tuple", () => {
        const tuple = {
            positional: [1, "b", true],
            named: {},
        };
        const result = (0, convert_evm_tuple_to_solidity_param_1.convertEvmTupleToSolidityParam)(tuple);
        chai_1.assert.deepStrictEqual(result, [1, "b", true]);
    });
    it("should convert a nested tuple", () => {
        const tuple = {
            positional: [
                {
                    positional: [1, "b", true],
                    named: {},
                },
            ],
            named: {},
        };
        const result = (0, convert_evm_tuple_to_solidity_param_1.convertEvmTupleToSolidityParam)(tuple);
        chai_1.assert.deepStrictEqual(result, [[1, "b", true]]);
    });
    it("should convert a nested array", () => {
        const tuple = {
            positional: [[1, "b", true]],
            named: {},
        };
        const result = (0, convert_evm_tuple_to_solidity_param_1.convertEvmTupleToSolidityParam)(tuple);
        chai_1.assert.deepStrictEqual(result, [[1, "b", true]]);
    });
});
