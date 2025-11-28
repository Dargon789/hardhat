"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const src_1 = require("../../src");
const module_1 = require("../../src/internal/module");
const replace_within_arg_1 = require("../../src/internal/utils/replace-within-arg");
describe("Arg resolution", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    let resolve;
    beforeEach(() => {
        resolve = (arg) => (0, replace_within_arg_1.replaceWithinArg)(arg, {
            accountRuntimeValue: (arv) => ({
                _kind: "AccountRuntimeValue",
                accountIndex: arv.accountIndex,
            }),
            moduleParameterRuntimeValue: (mprv) => ({
                _kind: "ModuleParameterRuntimeValue",
                moduleId: mprv.moduleId,
                name: mprv.name,
                defaultValue: mprv.defaultValue === undefined
                    ? "na"
                    : (0, src_1.isAccountRuntimeValue)(mprv.defaultValue)
                        ? {
                            _kind: "AccountRuntimeValue",
                            accountIndex: mprv.defaultValue.accountIndex,
                        }
                        : mprv.defaultValue,
            }),
            bigint: (bi) => `${bi.toString()}n`,
            future: (f) => ({ _kind: "FutureToken", futureId: f.id }),
        });
    });
    it("should create a duplicate of value arg types", () => {
        assertEqualBeforeAndAfterResolution(resolve, 1);
        assertEqualBeforeAndAfterResolution(resolve, "abc");
        assertEqualBeforeAndAfterResolution(resolve, false);
        assertEqualBeforeAndAfterResolution(resolve, [1, "abc", false]);
        assertEqualBeforeAndAfterResolution(resolve, {
            num: 1,
            string: "abc",
            bool: true,
            array: [1, "abc", false],
            nested: {
                bool: false,
                string: "another",
            },
        });
    });
    describe("account runtime values", () => {
        it("should substitue a singleton", () => {
            const actual = resolve(new module_1.AccountRuntimeValueImplementation(3));
            chai_1.assert.deepStrictEqual(actual, {
                _kind: "AccountRuntimeValue",
                accountIndex: 3,
            });
        });
        it("should substitue in an array", () => {
            const actual = resolve([
                1,
                new module_1.AccountRuntimeValueImplementation(2),
                "c",
            ]);
            chai_1.assert.deepStrictEqual(actual, [
                1,
                {
                    _kind: "AccountRuntimeValue",
                    accountIndex: 2,
                },
                "c",
            ]);
        });
        it("should substitue in an object", () => {
            const actual = resolve({
                num: 1,
                account: new module_1.AccountRuntimeValueImplementation(2),
                string: "c",
                nested: {
                    subaccount: new module_1.AccountRuntimeValueImplementation(4),
                },
            });
            chai_1.assert.deepStrictEqual(actual, {
                num: 1,
                account: {
                    _kind: "AccountRuntimeValue",
                    accountIndex: 2,
                },
                string: "c",
                nested: {
                    subaccount: {
                        _kind: "AccountRuntimeValue",
                        accountIndex: 4,
                    },
                },
            });
        });
    });
    describe("module parameter runtime values", () => {
        it("should substitue a singleton", () => {
            const actual = resolve(new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "supply", BigInt(12)));
            chai_1.assert.deepStrictEqual(actual, {
                _kind: "ModuleParameterRuntimeValue",
                moduleId: "MyModule",
                name: "supply",
                defaultValue: BigInt(12),
            });
        });
        it("should substitue in an array", () => {
            const actual = resolve([
                1,
                new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "supply", BigInt(12)),
                "c",
            ]);
            chai_1.assert.deepStrictEqual(actual, [
                1,
                {
                    _kind: "ModuleParameterRuntimeValue",
                    moduleId: "MyModule",
                    name: "supply",
                    defaultValue: BigInt(12),
                },
                "c",
            ]);
        });
        it("should substitue in an object", () => {
            const actual = resolve({
                num: 1,
                account: new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "supply", BigInt(2)),
                string: "c",
                nested: {
                    subaccount: new module_1.ModuleParameterRuntimeValueImplementation("MyModule", "ticker", "CodeCoin"),
                },
            });
            chai_1.assert.deepStrictEqual(actual, {
                num: 1,
                account: {
                    _kind: "ModuleParameterRuntimeValue",
                    moduleId: "MyModule",
                    name: "supply",
                    defaultValue: BigInt(2),
                },
                string: "c",
                nested: {
                    subaccount: {
                        _kind: "ModuleParameterRuntimeValue",
                        moduleId: "MyModule",
                        name: "ticker",
                        defaultValue: "CodeCoin",
                    },
                },
            });
        });
    });
    describe("BigInt", () => {
        it("should substitue a singleton", () => {
            const actual = resolve(BigInt(12));
            chai_1.assert.deepStrictEqual(actual, "12n");
        });
        it("should substitue in an array", () => {
            const actual = resolve([1, BigInt(12), "c"]);
            chai_1.assert.deepStrictEqual(actual, [1, "12n", "c"]);
        });
        it("should substitue in an object", () => {
            const actual = resolve({
                num: 1,
                bigint: BigInt(2),
                string: "c",
                nested: {
                    bigint: BigInt(4),
                },
            });
            chai_1.assert.deepStrictEqual(actual, {
                num: 1,
                bigint: "2n",
                string: "c",
                nested: {
                    bigint: "4n",
                },
            });
        });
    });
    describe("future", () => {
        it("should substitue a singleton", () => {
            const actual = resolve(new module_1.NamedContractAtFutureImplementation("MyModule:MyContract", {}, "MyContract", exampleAddress));
            chai_1.assert.deepStrictEqual(actual, {
                _kind: "FutureToken",
                futureId: "MyModule:MyContract",
            });
        });
        it("should substitue in an array", () => {
            const actual = resolve([
                1,
                new module_1.NamedContractAtFutureImplementation("MyModule:MyContract", {}, "MyContract", exampleAddress),
                "c",
            ]);
            chai_1.assert.deepStrictEqual(actual, [
                1,
                {
                    _kind: "FutureToken",
                    futureId: "MyModule:MyContract",
                },
                "c",
            ]);
        });
        it("should substitue in an object", () => {
            const actual = resolve({
                num: 1,
                future: new module_1.NamedContractAtFutureImplementation("MyModule:MyContract1", {}, "MyContract1", exampleAddress),
                string: "c",
                nested: {
                    future: new module_1.NamedContractAtFutureImplementation("MyModule:MyContract2", {}, "MyContract2", exampleAddress),
                },
            });
            chai_1.assert.deepStrictEqual(actual, {
                num: 1,
                future: {
                    _kind: "FutureToken",
                    futureId: "MyModule:MyContract1",
                },
                string: "c",
                nested: {
                    future: {
                        _kind: "FutureToken",
                        futureId: "MyModule:MyContract2",
                    },
                },
            });
        });
    });
});
function assertEqualBeforeAndAfterResolution(resolve, arg) {
    const before = arg;
    const after = resolve(before);
    chai_1.assert.deepStrictEqual(after, before, "After should be a structural clone of before");
}
