"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const build_module_1 = require("../src/build-module");
const ignition_module_serializer_1 = require("../src/ignition-module-serializer");
const module_1 = require("../src/internal/module");
const helpers_1 = require("./helpers");
describe("stored deployment serializer", () => {
    const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
    const differentAddress = "0xBA12222222228d8Ba445958a75a0704d566BF2C8";
    describe("contract", () => {
        it("should serialize a contract deployment", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contract deployments with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2", [contract1]);
                const contract3 = m.contract("Contract3", [], { after: [contract2] });
                return { contract1, contract2, contract3 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contract deployment with module parameter value", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const value = m.getParameter("value", 42n);
                const contract1 = m.contract("Contract1", [], { value });
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contract deployment with a call future as value", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", []);
                const call1 = m.staticCall(contract1, "getValue");
                const contract2 = m.contract("Contract2", [], { value: call1 });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contract deployment with a read event argument as value", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", []);
                const event1 = m.readEventArgument(contract1, "Event1", "Value1");
                const contract2 = m.contract("Contract2", [], { value: event1 });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("contractFromArtifact", () => {
        it("should serialize a contractFromArtifact deployment", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", helpers_1.fakeArtifact, []);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contractFromArtifact deployment with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", helpers_1.fakeArtifact, []);
                const contract2 = m.contract("Contract2", helpers_1.fakeArtifact, [contract1]);
                const contract3 = m.contract("Contract3", helpers_1.fakeArtifact, [], {
                    after: [contract2],
                });
                return { contract1, contract2, contract3 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("contractAt", () => {
        it("should serialize a contractAt", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", exampleAddress);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contractAt with a future address", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", exampleAddress);
                const call = m.staticCall(contract1, "getAddress");
                const contract2 = m.contractAt("Contract2", call);
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contractAt with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", exampleAddress);
                const contract2 = m.contractAt("Contract2", differentAddress, {
                    after: [contract1],
                });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("contractAtFromArtifact", () => {
        it("should serialize a contractAt", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", helpers_1.fakeArtifact, exampleAddress);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contractAt with a future address", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", helpers_1.fakeArtifact, exampleAddress);
                const call = m.staticCall(contract1, "getAddress");
                const contract2 = m.contractAt("Contract2", helpers_1.fakeArtifact, call);
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a contractAt with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contractAt("Contract1", helpers_1.fakeArtifact, exampleAddress);
                const contract2 = m.contractAt("Contract2", helpers_1.fakeArtifact, differentAddress, {
                    after: [contract1],
                });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("library", () => {
        it("should serialize a library deployment", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const library1 = m.library("Library1");
                return { library1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a library deployment with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const library1 = m.library("Library1");
                const library2 = m.library("Library2", { after: [library1] });
                return {
                    library1,
                    library2,
                };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a libraries passed in as libraries", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const library1 = m.library("Library1");
                const contract2 = m.contract("Contract2", [], {
                    libraries: {
                        Lib1: library1,
                    },
                });
                const contract3 = m.contract("Contract3", helpers_1.fakeArtifact, [], {
                    libraries: {
                        Lib1: library1,
                    },
                });
                const library4 = m.library("Library4", {
                    libraries: { Lib1: library1 },
                });
                const library5 = m.library("Library5", helpers_1.fakeArtifact, {
                    libraries: { Lib1: library1 },
                });
                return {
                    library1,
                    contract2,
                    contract3,
                    library4,
                    library5,
                };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("libraryFromArtifact", () => {
        it("should serialize a libraryFromArtifact deployment", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const library1 = m.library("Contract1", helpers_1.fakeArtifact);
                return { library1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a libraryFromArtifact deployment with dependency", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const library1 = m.library("Library1", helpers_1.fakeArtifact);
                const library2 = m.library("Library2", helpers_1.fakeArtifact, {
                    after: [library1],
                });
                return { library1, library2 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("call", () => {
        it("should serialize a call", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                m.call(contract1, "lock", [1, "a", false]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a call with dependencies", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2");
                m.call(contract2, "lock", [contract1]);
                m.call(contract2, "unlock", [], { after: [contract1] });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a call with a call future as value", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", []);
                const staticCall1 = m.staticCall(contract1, "getValue");
                m.call(contract1, "lock", [], { value: staticCall1 });
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a call with a read event argument as value", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1", []);
                const event1 = m.readEventArgument(contract1, "Event1", "Value1");
                m.call(contract1, "lock", [], { value: event1 });
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("static call", () => {
        it("should serialize a call", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                m.staticCall(contract1, "lock", [1, "a", false]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a static call with dependencies", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2");
                m.staticCall(contract2, "lock", [contract1]);
                m.staticCall(contract2, "unlock", [], 0, { after: [contract1] });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("Should serialize readEventArgument", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const emitter = m.contract("Emitter");
                m.readEventArgument(contract1, "EventName", "nameOrIndex", {
                    id: "customId",
                    emitter,
                    eventIndex: 123,
                });
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("encode function call", () => {
        it("should serialize a call", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                m.encodeFunctionCall(contract1, "lock", [1, "a", false]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a call with dependencies", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2");
                m.encodeFunctionCall(contract2, "lock", [contract1]);
                m.encodeFunctionCall(contract2, "unlock", [], { after: [contract1] });
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("send", () => {
        it("should serialize a send", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                m.send("test_send", exampleAddress, 12n, "example_data");
                return {};
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a send with dependencies", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2");
                m.send("test_send", contract1, 0n, undefined, { after: [contract2] });
                return {};
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a send where the to is from an account", () => {
            const module = (0, build_module_1.buildModule)("Module1", (m) => {
                const givenAccount = m.getAccount(3);
                m.send("test_send", givenAccount, 12n, "example_data");
                return {};
            });
            assertSerializableModuleIn(module);
        });
    });
    describe("useModule", () => {
        it("should serialize a deployment leveraging useModule", () => {
            const submodule = (0, build_module_1.buildModule)("Submodule", (m) => {
                const contract1 = m.contract("Contract1");
                return { contract1 };
            });
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const { contract1 } = m.useModule(submodule);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize contract dependencies over the useModule barrier", () => {
            const submodule = (0, build_module_1.buildModule)("Submodule", (m) => {
                const contract1 = m.contract("Contract1");
                return { contract1 };
            });
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const { contract1 } = m.useModule(submodule);
                const contract2 = m.contract("Contract2", [contract1]);
                const contract3 = m.contract("Contract3", [], { after: [contract1] });
                return { contract1, contract2, contract3 };
            });
            assertSerializableModuleIn(module);
        });
        it("should serialize a diamond useModule", () => {
            const bottomModule = (0, build_module_1.buildModule)("BottomModule", (m) => {
                const bottomContract = m.contract("Contract1");
                return { bottomContract };
            });
            const leftModule = (0, build_module_1.buildModule)("LeftModule", (m) => {
                const { bottomContract } = m.useModule(bottomModule);
                return { leftContract: bottomContract };
            });
            const rightModule = (0, build_module_1.buildModule)("RightModule", (m) => {
                const { bottomContract } = m.useModule(bottomModule);
                return { rightContract: bottomContract };
            });
            const module = (0, build_module_1.buildModule)("TopModule", (m) => {
                const { leftContract } = m.useModule(leftModule);
                const { rightContract } = m.useModule(rightModule);
                return { leftContract, rightContract };
            });
            assertSerializableModuleIn(module);
            const reserialized = ignition_module_serializer_1.IgnitionModuleDeserializer.deserialize(JSON.parse(JSON.stringify(ignition_module_serializer_1.IgnitionModuleSerializer.serialize(module), sortedKeysJsonStringifyReplacer)));
            const lc = reserialized.results.leftContract;
            const rc = reserialized.results.rightContract;
            chai_1.assert.equal(lc, rc);
        });
    });
    describe("Complex arguments serialization", () => {
        it("Should support base values as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [1, true, "string", 4n]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("Should support arrays as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [[1, 2, 3n]]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("Should support objects as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1", [{ a: 1, b: [1, 2] }]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("Should support futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2", [contract1]);
                return { contract1, contract2 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support nested futures as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const contract1 = m.contract("Contract1");
                const contract2 = m.contract("Contract2", [{ arr: [contract1] }]);
                return { contract1, contract2 };
            });
            chai_1.assert.equal(module.results.contract2.constructorArgs[0].arr[0], module.results.contract1);
        });
        it("should support AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1", [account1]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support AccountRuntimeValues as from", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1", [], { from: account1 });
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support nested AccountRuntimeValues as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const account1 = m.getAccount(1);
                const contract1 = m.contract("Contract1", [{ arr: [account1] }]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1", [p]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support nested ModuleParameterRuntimeValue as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", 123);
                const contract1 = m.contract("Contract1", [{ arr: [p] }]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
        it("should support ModuleParameterRuntimeValue with AccountRuntimeValue default value as arguments", () => {
            const module = (0, build_module_1.buildModule)("Module", (m) => {
                const p = m.getParameter("p", m.getAccount(1));
                const contract1 = m.contract("Contract1", [p]);
                return { contract1 };
            });
            assertSerializableModuleIn(module);
        });
    });
});
function assertSerializableModuleIn(module) {
    const serialized = JSON.stringify(ignition_module_serializer_1.IgnitionModuleSerializer.serialize(module), 
    // This is not actually needed, but we use it to be able to compare the
    // serialized string, which can be easier to debug.
    sortedKeysJsonStringifyReplacer, 2);
    const deserialized = ignition_module_serializer_1.IgnitionModuleDeserializer.deserialize(JSON.parse(serialized));
    const reserialized = JSON.stringify(ignition_module_serializer_1.IgnitionModuleSerializer.serialize(deserialized), sortedKeysJsonStringifyReplacer, 2);
    chai_1.assert.equal(serialized, reserialized, "Module serialization not the same across serialization/deserialization");
    chai_1.assert.deepEqual(module, deserialized, "Module not the same across serialization/deserialization");
    // Invariants
    const ignitionModule = ignition_module_serializer_1.IgnitionModuleDeserializer.deserialize(JSON.parse(reserialized));
    (0, chai_1.assert)(Object.values(ignitionModule.results).every((result) => hasFutureInModuleOrSubmoduleOf(ignitionModule, result)), "All results should be futures of the module or one of its submodules");
    (0, chai_1.assert)(allFuturesHaveModuleIn(ignitionModule), "All of the modules futures should have their parent module as the linked module");
    // All constructor args have been swapped out
    (0, chai_1.assert)(Array.from(ignitionModule.futures).every((future) => {
        if (future instanceof module_1.NamedContractDeploymentFutureImplementation) {
            return noFutureTokensIn(future.constructorArgs);
        }
        if (future instanceof module_1.ArtifactContractDeploymentFutureImplementation) {
            return noFutureTokensIn(future.constructorArgs);
        }
        return true;
    }), "All constructor args should have had their token futures swapped out for actual futures");
    // All libraries have been swapped out
    (0, chai_1.assert)(Array.from(ignitionModule.futures).every((future) => {
        if (future instanceof module_1.NamedContractDeploymentFutureImplementation) {
            return noFutureTokensInLibraries(future.libraries);
        }
        if (future instanceof module_1.ArtifactContractDeploymentFutureImplementation) {
            return noFutureTokensInLibraries(future.libraries);
        }
        if (future instanceof module_1.NamedLibraryDeploymentFutureImplementation) {
            return noFutureTokensInLibraries(future.libraries);
        }
        if (future instanceof module_1.ArtifactLibraryDeploymentFutureImplementation) {
            return noFutureTokensInLibraries(future.libraries);
        }
        return true;
    }), "All libraries should have had their token futures swapped out for actual futures");
    // All dependencies have been swapped out
    (0, chai_1.assert)(Array.from(ignitionModule.futures).every((future) => {
        return noFutureTokensIn(Array.from(future.dependencies));
    }), "All future dependencies should have had their token futures swapped out for actual futures");
}
function noFutureTokensIn(list) {
    return list.every((arg) => Boolean(arg) && arg._kind !== "FutureToken");
}
function noFutureTokensInLibraries(libs) {
    return Object.values(libs).every((arg) => Boolean(arg) && arg._kind !== "FutureToken");
}
function hasFutureInModuleOrSubmoduleOf(ignitionModule, future) {
    if (ignitionModule.futures.has(future)) {
        return true;
    }
    return Array.from(ignitionModule.submodules).some((submodule) => hasFutureInModuleOrSubmoduleOf(submodule, future));
}
function allFuturesHaveModuleIn(ignitionModule) {
    if (Array.from(ignitionModule.futures).some((future) => future.module.id === "PLACEHOLDER" && future.module !== ignitionModule)) {
        return false;
    }
    return Array.from(ignitionModule.submodules).every((submodule) => allFuturesHaveModuleIn(submodule));
}
function sortedKeysJsonStringifyReplacer(_key, value) {
    if (!(value instanceof Object) || Array.isArray(value)) {
        return value;
    }
    const sorted = {};
    for (const key of Object.keys(value).sort()) {
        sorted[key] = value[key];
    }
    return sorted;
}
