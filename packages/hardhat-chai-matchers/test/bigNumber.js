"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const bn_js_1 = __importDefault(require("bn.js"));
const errors_1 = require("hardhat/internal/core/errors");
require("../src/internal/add-chai-matchers");
const numberToBigNumberConversions = [
    (n) => BigInt(n),
    (n) => new bn_js_1.default(n),
    (n) => new bignumber_js_1.default(n),
];
describe("BigNumber matchers", function () {
    function typestr(n) {
        if (typeof n === "object") {
            if (n instanceof bn_js_1.default) {
                return "BN";
            }
            else if (n instanceof bignumber_js_1.default) {
                return "bignumber.js";
            }
        }
        return typeof n;
    }
    describe("length", function () {
        const lengthFunctions = ["length", "lengthOf"];
        const positiveSuccessCases = [
            { obj: [1, 2, 3], len: 3 },
            {
                obj: new Map([
                    [1, 2],
                    [3, 4],
                ]),
                len: 2,
            },
            { obj: new Set([1, 2, 3]), len: 3 },
        ];
        describe("positive, successful assertions", function () {
            for (const { obj, len } of positiveSuccessCases) {
                for (const convert of [
                    (n) => n,
                    ...numberToBigNumberConversions,
                ]) {
                    const length = convert(len);
                    describe(`with object ${obj.toString()} and with length operand of type ${typestr(length)}`, function () {
                        for (const lenFunc of lengthFunctions) {
                            it(`.to.have.${lenFunc} should work`, function () {
                                (0, chai_1.expect)(obj).to.have[lenFunc](length);
                            });
                        }
                    });
                }
            }
        });
        const negativeSuccessCases = [
            { obj: [1, 2, 3], len: 2 },
            {
                obj: new Map([
                    [1, 2],
                    [3, 4],
                ]),
                len: 3,
            },
            { obj: new Set([1, 2, 3]), len: 4 },
        ];
        describe("negative, successful assertions", function () {
            for (const { obj, len } of negativeSuccessCases) {
                for (const convert of [
                    (n) => n,
                    ...numberToBigNumberConversions,
                ]) {
                    const length = convert(len);
                    describe(`with object ${obj.toString()} and with length operand of type ${typestr(length)}`, function () {
                        for (const lenFunc of lengthFunctions) {
                            it(`should work with .not.to.have.${lenFunc}`, function () {
                                (0, chai_1.expect)(obj).not.to.have[lenFunc](length);
                            });
                        }
                    });
                }
            }
        });
        const positiveFailureCases = [
            {
                obj: [1, 2, 3],
                len: 2,
                msg: "expected [ 1, 2, 3 ] to have a length of 2 but got 3",
            },
            {
                obj: new Set([1, 2, 3]),
                len: 2,
                msg: /expected .* to have a size of 2 but got 3/,
            },
            {
                obj: new Map([
                    [1, 2],
                    [3, 4],
                ]),
                len: 3,
                msg: /expected .* to have a size of 3 but got 2/,
            },
        ];
        describe("positive, failing assertions should throw the proper error message", function () {
            for (const { obj, len, msg } of positiveFailureCases) {
                for (const convert of [
                    (n) => n,
                    ...numberToBigNumberConversions,
                ]) {
                    const length = convert(len);
                    describe(`with object ${obj.toString()} and with operand of type ${typestr(length)}`, function () {
                        for (const lenFunc of lengthFunctions) {
                            it(`should work with .to.have.${lenFunc}`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(obj).to.have[lenFunc](length)).to.throw(chai_1.AssertionError, msg);
                            });
                        }
                    });
                }
            }
        });
        const operators = [
            "above",
            "below",
            "gt",
            "lt",
            "greaterThan",
            "lessThan",
            "least",
            "most",
            "gte",
            "lte",
            "greaterThanOrEqual",
            "lessThanOrEqual",
        ];
        const positiveSuccessCasesWithOperator = [
            { operator: "lt", len: 4, obj: [1, 2, 3] },
            { operator: "lt", len: 4, obj: new Set([1, 2, 3]) },
            {
                operator: "lt",
                len: 4,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "above", len: 2, obj: [1, 2, 3] },
            { operator: "above", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "above",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "gt", len: 2, obj: [1, 2, 3] },
            { operator: "gt", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "gt",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "greaterThan", len: 2, obj: [1, 2, 3] },
            { operator: "greaterThan", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "greaterThan",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "least", len: 3, obj: [1, 2, 3] },
            { operator: "least", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "least",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "most", len: 3, obj: [1, 2, 3] },
            { operator: "most", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "most",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "gte", len: 3, obj: [1, 2, 3] },
            { operator: "gte", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "gte",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lte", len: 3, obj: [1, 2, 3] },
            { operator: "lte", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "lte",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "greaterThanOrEqual", len: 3, obj: [1, 2, 3] },
            { operator: "greaterThanOrEqual", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "greaterThanOrEqual",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lessThanOrEqual", len: 3, obj: [1, 2, 3] },
            { operator: "lessThanOrEqual", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "lessThanOrEqual",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
        ];
        describe("positive, successful assertions chained off of length", function () {
            for (const { obj, operator, len } of positiveSuccessCasesWithOperator) {
                describe(`with object ${obj} and operator "${operator}"`, function () {
                    for (const convert of [
                        (n) => n,
                        ...numberToBigNumberConversions,
                    ]) {
                        const length = convert(len);
                        describe(`with an operand of type ${typestr(length)}`, function () {
                            for (const lenFunc of lengthFunctions) {
                                it(`should work with .to.have.${lenFunc}.${operator}`, function () {
                                    (0, chai_1.expect)(obj).to.have[lenFunc][operator](length);
                                });
                            }
                        });
                    }
                });
            }
        });
        const negativeSuccessCasesWithOperator = [
            { operator: "above", len: 3, obj: [1, 2, 3] },
            { operator: "above", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "above",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "below", len: 3, obj: [1, 2, 3] },
            { operator: "below", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "below",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "gt", len: 3, obj: [1, 2, 3] },
            { operator: "gt", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "gt",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lt", len: 3, obj: [1, 2, 3] },
            { operator: "lt", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "lt",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "greaterThan", len: 3, obj: [1, 2, 3] },
            { operator: "greaterThan", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "greaterThan",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lessThan", len: 3, obj: [1, 2, 3] },
            { operator: "lessThan", len: 3, obj: new Set([1, 2, 3]) },
            {
                operator: "lessThan",
                len: 3,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "least", len: 4, obj: [1, 2, 3] },
            { operator: "least", len: 4, obj: new Set([1, 2, 3]) },
            {
                operator: "least",
                len: 4,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "most", len: 2, obj: [1, 2, 3] },
            { operator: "most", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "most",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "gte", len: 4, obj: [1, 2, 3] },
            { operator: "gte", len: 4, obj: new Set([1, 2, 3]) },
            {
                operator: "gte",
                len: 4,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lte", len: 2, obj: [1, 2, 3] },
            { operator: "lte", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "lte",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "greaterThanOrEqual", len: 4, obj: [1, 2, 3] },
            { operator: "greaterThanOrEqual", len: 4, obj: new Set([1, 2, 3]) },
            {
                operator: "greaterThanOrEqual",
                len: 4,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
            { operator: "lessThanOrEqual", len: 2, obj: [1, 2, 3] },
            { operator: "lessThanOrEqual", len: 2, obj: new Set([1, 2, 3]) },
            {
                operator: "lessThanOrEqual",
                len: 2,
                obj: new Map([
                    [1, 2],
                    [3, 4],
                    [5, 6],
                ]),
            },
        ];
        describe("negative, successful assertions chained off of length", function () {
            for (const { obj, operator, len } of negativeSuccessCasesWithOperator) {
                describe(`with object ${obj} and operator "${operator}"`, function () {
                    for (const convert of [
                        (n) => n,
                        ...numberToBigNumberConversions,
                    ]) {
                        const length = convert(len);
                        describe(`with an operand of type ${typestr(length)}`, function () {
                            for (const lenFunc of lengthFunctions) {
                                it(`should work with .not.to.have.${lenFunc}.${operator}`, function () {
                                    (0, chai_1.expect)(obj).not.to.have[lenFunc][operator](length);
                                });
                            }
                        });
                    }
                });
            }
        });
        const positiveFailureCasesWithOperator = [
            {
                obj: [1, 2, 3],
                operator: "above",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length above 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "below",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length below 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "gt",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length above 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "lt",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length below 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "greaterThan",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length above 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "lessThan",
                len: 3,
                msg: "expected [ 1, 2, 3 ] to have a length below 3 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "least",
                len: 4,
                msg: "expected [ 1, 2, 3 ] to have a length at least 4 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "most",
                len: 2,
                msg: "expected [ 1, 2, 3 ] to have a length at most 2 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "gte",
                len: 4,
                msg: "expected [ 1, 2, 3 ] to have a length at least 4 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "lte",
                len: 2,
                msg: "expected [ 1, 2, 3 ] to have a length at most 2 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "greaterThanOrEqual",
                len: 4,
                msg: "expected [ 1, 2, 3 ] to have a length at least 4 but got 3",
            },
            {
                obj: [1, 2, 3],
                operator: "lessThanOrEqual",
                len: 2,
                msg: "expected [ 1, 2, 3 ] to have a length at most 2 but got 3",
            },
        ];
        describe("positive, failing assertions chained off of length should throw the proper error message", function () {
            for (const { obj, operator, len, msg, } of positiveFailureCasesWithOperator) {
                describe(`with object ${obj} and operator "${operator}"`, function () {
                    for (const convert of [
                        (n) => n,
                        ...numberToBigNumberConversions,
                    ]) {
                        const length = convert(len);
                        describe(`with an operand of type ${typestr(length)}`, function () {
                            for (const lenFunc of lengthFunctions) {
                                it(`should work with .to.have.${lenFunc}.${operator}`, function () {
                                    (0, chai_1.expect)(() => (0, chai_1.expect)(obj).to.have[lenFunc][operator](length)).to.throw(chai_1.AssertionError, msg);
                                });
                            }
                        });
                    }
                });
            }
        });
    });
    describe("with two arguments", function () {
        function checkAll(actual, expected, test) {
            const conversions = [
                (n) => n,
                (n) => n.toString(),
                ...numberToBigNumberConversions,
            ];
            for (const convertActual of conversions) {
                for (const convertExpected of conversions) {
                    const convertedActual = convertActual(actual);
                    const convertedExpected = convertExpected(expected);
                    // a few particular combinations of types don't work:
                    if (typeof convertedActual === "string" &&
                        !bn_js_1.default.isBN(convertedExpected) &&
                        !bignumber_js_1.default.isBigNumber(convertedExpected)) {
                        continue;
                    }
                    if (typeof convertedActual === "number" &&
                        typeof convertedExpected === "string") {
                        continue;
                    }
                    test(convertedActual, convertedExpected);
                }
            }
        }
        const operators = [
            "equals",
            "equal",
            "eq",
            "above",
            "below",
            "gt",
            "lt",
            "greaterThan",
            "lessThan",
            "least",
            "most",
            "gte",
            "lte",
            "greaterThanOrEqual",
            "lessThanOrEqual",
        ];
        const positiveSuccessCases = [
            { operands: [10, 10], operator: "eq" },
            { operands: [10, 10], operator: "equal" },
            { operands: [10, 10], operator: "equals" },
            { operands: [10, 9], operator: "above" },
            { operands: [10, 9], operator: "gt" },
            { operands: [10, 9], operator: "greaterThan" },
            { operands: [10, 11], operator: "below" },
            { operands: [10, 11], operator: "lt" },
            { operands: [10, 11], operator: "lessThan" },
            { operands: [10, 10], operator: "least" },
            { operands: [10, 10], operator: "gte" },
            { operands: [10, 10], operator: "greaterThanOrEqual" },
            { operands: [10, 9], operator: "least" },
            { operands: [10, 9], operator: "gte" },
            { operands: [10, 9], operator: "greaterThanOrEqual" },
            { operands: [10, 10], operator: "most" },
            { operands: [10, 10], operator: "lte" },
            { operands: [10, 10], operator: "lessThanOrEqual" },
            { operands: [10, 11], operator: "most" },
            { operands: [10, 11], operator: "lte" },
            { operands: [10, 11], operator: "lessThanOrEqual" },
        ];
        for (const { operator, operands } of positiveSuccessCases) {
            describe(`.to.${operator}`, function () {
                checkAll(operands[0], operands[1], (a, b) => {
                    it(`should work with ${typestr(a)} and ${typestr(b)}`, function () {
                        (0, chai_1.expect)(a).to[operator](b);
                    });
                });
            });
        }
        const eqPositiveFailureCase = {
            operands: [10, 11],
            msg: "expected 10 to equal 11",
        };
        const gtPositiveFailureCase = {
            operands: [10, 10],
            msg: "expected 10 to be above 10",
        };
        const ltPositiveFailureCase = {
            operands: [11, 10],
            msg: "expected 11 to be below 10",
        };
        const gtePositiveFailureCase = {
            operands: [10, 11],
            msg: "expected 10 to be at least 11",
        };
        const ltePositiveFailureCase = {
            operands: [11, 10],
            msg: "expected 11 to be at most 10",
        };
        const positiveFailureCases = [
            Object.assign(Object.assign({}, eqPositiveFailureCase), { operator: "eq" }),
            Object.assign(Object.assign({}, eqPositiveFailureCase), { operator: "equal" }),
            Object.assign(Object.assign({}, eqPositiveFailureCase), { operator: "equals" }),
            Object.assign(Object.assign({}, gtPositiveFailureCase), { operator: "above" }),
            Object.assign(Object.assign({}, gtPositiveFailureCase), { operator: "gt" }),
            Object.assign(Object.assign({}, gtPositiveFailureCase), { operator: "greaterThan" }),
            Object.assign(Object.assign({}, ltPositiveFailureCase), { operator: "below" }),
            Object.assign(Object.assign({}, ltPositiveFailureCase), { operator: "lt" }),
            Object.assign(Object.assign({}, ltPositiveFailureCase), { operator: "lessThan" }),
            Object.assign(Object.assign({}, gtePositiveFailureCase), { operator: "least" }),
            Object.assign(Object.assign({}, gtePositiveFailureCase), { operator: "gte" }),
            Object.assign(Object.assign({}, gtePositiveFailureCase), { operator: "greaterThanOrEqual" }),
            Object.assign(Object.assign({}, ltePositiveFailureCase), { operator: "most" }),
            Object.assign(Object.assign({}, ltePositiveFailureCase), { operator: "lte" }),
            Object.assign(Object.assign({}, ltePositiveFailureCase), { operator: "lessThanOrEqual" }),
        ];
        for (const { operator, operands, msg } of positiveFailureCases) {
            describe(`.to.${operator} should throw the proper message on failure`, function () {
                checkAll(operands[0], operands[1], (a, b) => {
                    it(`with ${typestr(a)} and ${typestr(b)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(a).to[operator](b)).to.throw(chai_1.AssertionError, msg);
                    });
                });
            });
        }
        const negativeSuccessCases = [
            { operands: [11, 10], operator: "eq" },
            { operands: [11, 10], operator: "equal" },
            { operands: [11, 10], operator: "equals" },
            { operands: [10, 10], operator: "above" },
            { operands: [10, 10], operator: "gt" },
            { operands: [10, 10], operator: "greaterThan" },
            { operands: [10, 10], operator: "below" },
            { operands: [10, 10], operator: "lt" },
            { operands: [10, 10], operator: "lessThan" },
            { operands: [10, 9], operator: "below" },
            { operands: [10, 9], operator: "lt" },
            { operands: [10, 9], operator: "lessThan" },
            { operands: [10, 11], operator: "least" },
            { operands: [10, 11], operator: "gte" },
            { operands: [10, 11], operator: "greaterThanOrEqual" },
            { operands: [10, 9], operator: "most" },
            { operands: [10, 9], operator: "lte" },
            { operands: [10, 9], operator: "lessThanOrEqual" },
        ];
        for (const { operator, operands } of negativeSuccessCases) {
            describe(`.not.to.${operator}`, function () {
                checkAll(operands[0], operands[1], (a, b) => {
                    it(`should work with ${typestr(a)} and ${typestr(b)}`, function () {
                        (0, chai_1.expect)(a).not.to[operator](b);
                    });
                });
            });
        }
        const gtNegativeFailureCase = {
            operands: [11, 10],
            msg: "expected 11 to be at most 10",
        };
        const eqNegativeFailureCase = {
            operands: [10, 10],
            msg: "expected 10 to not equal 10",
        };
        const ltNegativeFailureCase = {
            operands: [10, 11],
            msg: "expected 10 to be at least 11",
        };
        const gteNegativeFailureCase = {
            operands: [11, 10],
            msg: "expected 11 to be below 10",
        };
        const lteNegativeFailureCase = {
            operands: [10, 11],
            msg: "expected 10 to be above 11",
        };
        const negativeFailureCases = [
            Object.assign(Object.assign({}, eqNegativeFailureCase), { operator: "eq" }),
            Object.assign(Object.assign({}, eqNegativeFailureCase), { operator: "equal" }),
            Object.assign(Object.assign({}, eqNegativeFailureCase), { operator: "equals" }),
            Object.assign(Object.assign({}, gtNegativeFailureCase), { operator: "above" }),
            Object.assign(Object.assign({}, gtNegativeFailureCase), { operator: "gt" }),
            Object.assign(Object.assign({}, gtNegativeFailureCase), { operator: "greaterThan" }),
            Object.assign(Object.assign({}, ltNegativeFailureCase), { operator: "below" }),
            Object.assign(Object.assign({}, ltNegativeFailureCase), { operator: "lt" }),
            Object.assign(Object.assign({}, ltNegativeFailureCase), { operator: "lessThan" }),
            Object.assign(Object.assign({}, gteNegativeFailureCase), { operator: "least" }),
            Object.assign(Object.assign({}, gteNegativeFailureCase), { operator: "gte" }),
            Object.assign(Object.assign({}, gteNegativeFailureCase), { operator: "greaterThanOrEqual" }),
            Object.assign(Object.assign({}, lteNegativeFailureCase), { operator: "most" }),
            Object.assign(Object.assign({}, lteNegativeFailureCase), { operator: "lte" }),
            Object.assign(Object.assign({}, lteNegativeFailureCase), { operator: "lessThanOrEqual" }),
        ];
        for (const { operator, operands, msg } of negativeFailureCases) {
            describe("should throw the proper message on failure", function () {
                checkAll(operands[0], operands[1], (a, b) => {
                    it(`with ${typestr(a)} and ${typestr(b)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(a).not.to[operator](b)).to.throw(chai_1.AssertionError, msg);
                    });
                });
            });
        }
        operators.forEach((operator) => {
            describe("should throw when comparing to a non-integral floating point literal", function () {
                for (const convert of numberToBigNumberConversions) {
                    const converted = convert(1);
                    const msg = "HH17: The input value cannot be normalized to a BigInt: 1.1 is not an integer";
                    it(`with .to.${operator} comparing float vs ${typestr(converted)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1.1).to[operator](converted)).to.throw(errors_1.HardhatError, msg);
                    });
                    it(`with .to.${operator} comparing ${typestr(converted)} vs float`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(converted).to[operator](1.1)).to.throw(errors_1.HardhatError, msg);
                    });
                    it(`with .not.to.${operator} comparing float vs ${typestr(converted)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1.1).not.to[operator](converted)).to.throw(errors_1.HardhatError, msg);
                    });
                    it(`with .not.to.${operator} comparing ${typestr(converted)} vs float`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(converted).not.to[operator](1.1)).to.throw(errors_1.HardhatError, msg);
                    });
                }
            });
            describe("should throw when comparing to an unsafe integer", function () {
                const unsafeInt = 1e16;
                const msg = `HH17: The input value cannot be normalized to a BigInt: Integer 10000000000000000 is unsafe. Consider using ${unsafeInt}n instead. For more details, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger`;
                describe(`when using .to.${operator}`, function () {
                    it("with an unsafe int as the first param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(unsafeInt).to[operator](1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the second param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).to[operator](unsafeInt)).to.throw(errors_1.HardhatError, msg);
                    });
                });
                describe(`when using .not.to.${operator}`, function () {
                    it("with an unsafe int as the first param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(unsafeInt).not.to[operator](1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the second param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).not.to[operator](unsafeInt)).to.throw(errors_1.HardhatError, msg);
                    });
                });
            });
        });
        describe("deep equal", function () {
            checkAll(1, 1, (a, b) => {
                it(`should work with ${typestr(a)} and ${typestr(b)}`, function () {
                    // successful assertions
                    (0, chai_1.expect)([a]).to.deep.equal([b]);
                    (0, chai_1.expect)([[a], [a]]).to.deep.equal([[b], [b]]);
                    (0, chai_1.expect)({ x: a }).to.deep.equal({ x: b });
                    (0, chai_1.expect)({ x: { y: a } }).to.deep.equal({ x: { y: b } });
                    (0, chai_1.expect)({ x: [a] }).to.deep.equal({ x: [b] });
                    // failed assertions
                    // We are not checking the content of the arrays/objects because
                    // it depends on the type of the numbers (plain numbers, native
                    // bigints)
                    // Ideally the output would be normalized and we could check the
                    // actual content more easily.
                    (0, chai_1.expect)(() => (0, chai_1.expect)([a]).to.not.deep.equal([b])).to.throw(chai_1.AssertionError, 
                    // the 's' modifier is used to make . match newlines too
                    /expected \[.*\] to not deeply equal \[.*\]/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)([[a], [a]]).to.not.deep.equal([[b], [b]])).to.throw(chai_1.AssertionError, /expected \[.*\] to not deeply equal \[.*\]/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: a }).to.not.deep.equal({ x: b })).to.throw(chai_1.AssertionError, /expected \{.*\} to not deeply equal \{.*\}/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: { y: a } }).to.not.deep.equal({ x: { y: b } })).to.throw(chai_1.AssertionError, /expected \{.*\} to not deeply equal \{.*\}/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: [a] }).to.not.deep.equal({ x: [b] })).to.throw(chai_1.AssertionError, /expected \{.*\} to not deeply equal \{.*\}/s);
                });
            });
            checkAll(1, 2, (a, b) => {
                it(`should work with ${typestr(a)} and ${typestr(b)} (negative)`, function () {
                    // successful assertions
                    (0, chai_1.expect)([a]).to.not.deep.equal([b]);
                    (0, chai_1.expect)([[a], [a]]).to.not.deep.equal([[b], [b]]);
                    (0, chai_1.expect)({ x: a }).to.not.deep.equal({ x: b });
                    (0, chai_1.expect)({ x: { y: a } }).to.not.deep.equal({ x: { y: b } });
                    (0, chai_1.expect)({ x: [a] }).to.not.deep.equal({ x: [b] });
                    // failed assertions
                    (0, chai_1.expect)(() => (0, chai_1.expect)([a]).to.deep.equal([b])).to.throw(chai_1.AssertionError, 
                    // the 's' modifier is used to make . match newlines too
                    /expected \[.*\] to deeply equal \[.*\]/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)([[a], [a]]).to.deep.equal([[b], [b]])).to.throw(chai_1.AssertionError, /expected \[.*\] to deeply equal \[.*\]/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: a }).to.deep.equal({ x: b })).to.throw(chai_1.AssertionError, /expected \{.*\} to deeply equal \{.*\}/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: { y: a } }).to.deep.equal({ x: { y: b } })).to.throw(chai_1.AssertionError, /expected \{.*\} to deeply equal \{.*\}/s);
                    (0, chai_1.expect)(() => (0, chai_1.expect)({ x: [a] }).to.deep.equal({ x: [b] })).to.throw(chai_1.AssertionError, /expected \{.*\} to deeply equal \{.*\}/s);
                });
            });
        });
    });
    describe("with three arguments", function () {
        function checkAll(a, b, c, test) {
            const conversions = [(n) => n, ...numberToBigNumberConversions];
            for (const convertA of conversions) {
                for (const convertB of conversions) {
                    for (const convertC of conversions) {
                        test(convertA(a), convertB(b), convertC(c));
                    }
                }
            }
        }
        const operators = ["within", "closeTo", "approximately"];
        const positiveSuccessCases = [
            { operator: "within", operands: [100, 99, 101] },
            { operator: "closeTo", operands: [101, 101, 10] },
            { operator: "approximately", operands: [101, 101, 10] },
        ];
        for (const { operator, operands } of positiveSuccessCases) {
            describe(`.to.be.${operator}`, function () {
                checkAll(operands[0], operands[1], operands[2], (a, b, c) => {
                    it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(c)}`, function () {
                        (0, chai_1.expect)(a).to.be[operator](b, c);
                    });
                });
            });
        }
        const positiveFailureCases = [
            {
                operator: "within",
                operands: [100, 80, 90],
                msg: "expected 100 to be within 80..90",
            },
            {
                operator: "closeTo",
                operands: [100, 111, 10],
                msg: "expected 100 to be close to 111 +/- 10",
            },
            {
                operator: "approximately",
                operands: [100, 111, 10],
                msg: "expected 100 to be close to 111 +/- 10",
            },
        ];
        for (const { operator, operands, msg } of positiveFailureCases) {
            describe(`.to.be.${operator} should throw the proper message on failure`, function () {
                checkAll(operands[0], operands[1], operands[2], (a, b, c) => {
                    it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(c)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(a).to.be[operator](b, c)).to.throw(chai_1.AssertionError, msg);
                    });
                });
            });
        }
        const closeToAndApproximately = ["closeTo", "approximately"];
        for (const closeToOrApproximately of closeToAndApproximately) {
            describe(`${closeToOrApproximately} with an undefined delta argument`, function () {
                for (const convert of [
                    (n) => n,
                    ...numberToBigNumberConversions,
                ]) {
                    const one = convert(1);
                    it(`with a ${typestr(one)} actual should throw a helpful error message`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(one).to.be[closeToOrApproximately](100, undefined)).to.throw(chai_1.AssertionError, "the arguments to closeTo or approximately must be numbers, and a delta is required");
                    });
                }
            });
        }
        const negativeSuccessCases = [
            { operator: "within", operands: [100, 101, 102] },
            { operator: "within", operands: [100, 98, 99] },
            { operator: "closeTo", operands: [100, 111, 10] },
            { operator: "approximately", operands: [100, 111, 10] },
        ];
        for (const { operator, operands } of negativeSuccessCases) {
            describe(`.not.to.be.${operator}`, function () {
                checkAll(operands[0], operands[1], operands[2], (a, b, c) => {
                    it(`should work with ${typestr(a)}, ${typestr(b)} and ${typestr(c)}`, function () {
                        (0, chai_1.expect)(a).not.to.be[operator](b, c);
                    });
                });
            });
        }
        const negativeFailureCases = [
            {
                operator: "within",
                operands: [100, 99, 101],
                msg: "expected 100 to not be within 99..101",
            },
            {
                operator: "closeTo",
                operands: [100, 101, 10],
                msg: "expected 100 not to be close to 101 +/- 10",
            },
            {
                operator: "approximately",
                operands: [100, 101, 10],
                msg: "expected 100 not to be close to 101 +/- 10",
            },
        ];
        for (const { operator, operands, msg } of negativeFailureCases) {
            describe(`.not.to.be.${operator} should throw the proper message on failure`, function () {
                checkAll(operands[0], operands[1], operands[2], (a, b, c) => {
                    it(`with ${typestr(a)}, ${typestr(b)} and ${typestr(c)}`, function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(a).not.to.be[operator](b, c)).to.throw(chai_1.AssertionError, msg);
                    });
                });
            });
        }
        operators.forEach((operator) => {
            describe(`should throw when comparing to a non-integral floating point literal`, function () {
                for (const convertA of numberToBigNumberConversions) {
                    for (const convertB of numberToBigNumberConversions) {
                        const a = convertA(1);
                        const b = convertB(1);
                        const msg = "HH17: The input value cannot be normalized to a BigInt: 1.1 is not an integer";
                        describe(`with .to.${operator}`, function () {
                            it(`with float, ${typestr(a)}, ${typestr(a)}`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(1.1).to[operator](a, b)).to.throw(errors_1.HardhatError, msg);
                            });
                            it(`with ${typestr(a)}, float, ${typestr(b)}`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(a).to[operator](1.1, b)).to.throw(errors_1.HardhatError, msg);
                            });
                            it(`with ${typestr(a)}, ${typestr(b)}, float`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(a).to[operator](b, 1.1)).to.throw(errors_1.HardhatError, msg);
                            });
                        });
                        describe(`with not.to.${operator}`, function () {
                            it(`with float, ${typestr(a)}, ${typestr(a)}`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(1.1).not.to[operator](a, b)).to.throw(errors_1.HardhatError, msg);
                            });
                            it(`with ${typestr(a)}, float, ${typestr(b)}`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(a).not.to[operator](1.1, b)).to.throw(errors_1.HardhatError, msg);
                            });
                            it(`with ${typestr(a)}, ${typestr(b)}, float`, function () {
                                (0, chai_1.expect)(() => (0, chai_1.expect)(a).not.to[operator](b, 1.1)).to.throw(errors_1.HardhatError, msg);
                            });
                        });
                    }
                }
            });
            describe("should throw when comparing to an unsafe integer", function () {
                const unsafeInt = 1e16;
                const msg = `HH17: The input value cannot be normalized to a BigInt: Integer 10000000000000000 is unsafe. Consider using ${unsafeInt}n instead. For more details, see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number/isSafeInteger`;
                describe(`when using .to.${operator}`, function () {
                    it("with an unsafe int as the first param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(unsafeInt).to[operator](1n, 1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the second param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).to[operator](unsafeInt, 1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the third param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).to[operator](1n, unsafeInt)).to.throw(errors_1.HardhatError, msg);
                    });
                });
                describe(`when using not.to.${operator}`, function () {
                    it("with an unsafe int as the first param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(unsafeInt).not.to[operator](1n, 1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the second param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).not.to[operator](unsafeInt, 1n)).to.throw(errors_1.HardhatError, msg);
                    });
                    it("with an unsafe int as the third param", function () {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(1n).not.to[operator](1n, unsafeInt)).to.throw(errors_1.HardhatError, msg);
                    });
                });
            });
        });
    });
    it("custom message is preserved", function () {
        // normal numbers
        (0, chai_1.expect)(() => (0, chai_1.expect)(1).to.equal(2, "custom message")).to.throw(chai_1.AssertionError, "custom message");
        // number and bigint
        (0, chai_1.expect)(() => (0, chai_1.expect)(1).to.equal(2n, "custom message")).to.throw(chai_1.AssertionError, "custom message");
        // same but for deep comparisons
        (0, chai_1.expect)(() => (0, chai_1.expect)([1]).to.equal([2], "custom message")).to.throw(chai_1.AssertionError, "custom message");
        // number and bigint
        (0, chai_1.expect)(() => (0, chai_1.expect)([1]).to.equal([2n], "custom message")).to.throw(chai_1.AssertionError, "custom message");
    });
});
