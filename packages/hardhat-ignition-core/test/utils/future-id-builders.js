"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const future_id_builders_1 = require("../../src/internal/utils/future-id-builders");
describe("future id rules", () => {
    describe("contract, library, contractAt ids", () => {
        it("the fallback id should be built based on the contract or library name", () => {
            chai_1.assert.equal((0, future_id_builders_1.toContractFutureId)("MyModule", undefined, "MyContract"), "MyModule#MyContract");
        });
        it("namespaces to the module a user provided id", () => {
            chai_1.assert.equal((0, future_id_builders_1.toContractFutureId)("MyModule", "MyId", "MyContract"), "MyModule#MyId");
        });
    });
    describe("call ids", () => {
        it("the fallback id should be built based on the contract id and function name if they belong to the same module", () => {
            chai_1.assert.equal((0, future_id_builders_1.toCallFutureId)("MyModule", undefined, "MyModule", "MyModule#MyContract", "MyFunction"), "MyModule#MyContract.MyFunction");
        });
        it("should name a call to a future coming from a module representing the submodule relationship, and including namespaced by module id", () => {
            chai_1.assert.equal((0, future_id_builders_1.toCallFutureId)("MyModule", undefined, "Submodule", "Submodule#MyContract", "MyFunction"), "MyModule#Submodule~MyContract.MyFunction");
        });
        it("namespaces the user provided id to the module", () => {
            chai_1.assert.equal((0, future_id_builders_1.toCallFutureId)("MyModule", "MyId", "MyModule", "MyModule#MyContract", "MyFunction"), "MyModule#MyId");
        });
    });
    describe("read event argument ids", () => {
        it("the fallback id should be built based on the contractName, event name, arg name and index", () => {
            chai_1.assert.equal((0, future_id_builders_1.toReadEventArgumentFutureId)("MyModule", undefined, "MyContract", "MyFunction", "MyArg", 2), "MyModule#MyContract.MyFunction.MyArg.2");
        });
        it("the fallback id should be built even when the arg is an index", () => {
            chai_1.assert.equal((0, future_id_builders_1.toReadEventArgumentFutureId)("MyModule", undefined, "MyContract", "MyFunction", 3, 2), "MyModule#MyContract.MyFunction.3.2");
        });
        it("namespaces the user provided id to the module", () => {
            chai_1.assert.equal((0, future_id_builders_1.toReadEventArgumentFutureId)("MyModule", "MyId", "MyContract", "MyFunction", "MyArg", 2), "MyModule#MyId");
        });
    });
    describe("send data ids", () => {
        it("namespaces the user provided id to the module", () => {
            chai_1.assert.equal((0, future_id_builders_1.toSendDataFutureId)("MyModule", "MyId"), "MyModule#MyId");
        });
    });
});
