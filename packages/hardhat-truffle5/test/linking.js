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
const plugins_1 = require("hardhat/plugins");
const helpers_1 = require("./helpers");
function linkingShouldWorkCorrectly(isAmbiguous = false) {
    const greeterName = isAmbiguous ? "contracts/Greeter.sol:Greeter" : "Greeter";
    const libName = isAmbiguous ? "contracts/Greeter.sol:Lib" : "Lib";
    const usesLibName = isAmbiguous ? "contracts/Greeter.sol:UsesLib" : "UsesLib";
    describe("Linking with an instance", function () {
        it("Should link correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Lib = this.env.artifacts.require(libName);
                const UsesLib = this.env.artifacts.require(usesLibName);
                const lib = yield Lib.new();
                UsesLib.link(lib);
                const usesLib = yield UsesLib.new();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "0");
                yield usesLib.addTwo();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "2");
            });
        });
    });
    describe("Linking with an instance created with .at", function () {
        it("Should link correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Lib = this.env.artifacts.require(libName);
                const UsesLib = this.env.artifacts.require(usesLibName);
                const lib = yield Lib.new();
                const lib2 = yield Lib.at(lib.address);
                UsesLib.link(lib2);
                const usesLib = yield UsesLib.new();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "0");
                yield usesLib.addTwo();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "2");
            });
        });
    });
    describe("Linking with an instance created with new", function () {
        it("Should link correctly", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Lib = this.env.artifacts.require(libName);
                const UsesLib = this.env.artifacts.require(usesLibName);
                const lib = yield Lib.new();
                const lib2 = new Lib(lib.address);
                UsesLib.link(lib2);
                const usesLib = yield UsesLib.new();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "0");
                yield usesLib.addTwo();
                chai_1.assert.strictEqual((yield usesLib.n()).toString(10), "2");
            });
        });
    });
    describe("Linking with name and address", function () {
        it("Should throw the right error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const UsesLib = this.env.artifacts.require(usesLibName);
                chai_1.assert.throws(() => UsesLib.link(libName, "0x1111111111111111111111111111111111111111"), "Linking contracts by name is not supported by Hardhat. Please use UsesLib.link(libraryInstance) instead.");
            });
        });
    });
    describe("Linking with a map from name to address", function () {
        it("Should throw the right error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const UsesLib = this.env.artifacts.require(usesLibName);
                chai_1.assert.throws(() => UsesLib.link({ Lib: "0x1111111111111111111111111111111111111111" }), "Linking contracts with a map of addresses is not supported by Hardhat. Please use UsesLib.link(libraryInstance) instead");
            });
        });
    });
    describe("Linking a library more than once", function () {
        it("Should throw the right error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Lib = this.env.artifacts.require(libName);
                const UsesLib = this.env.artifacts.require(usesLibName);
                const lib = yield Lib.new();
                const lib2 = yield Lib.new();
                UsesLib.link(lib);
                chai_1.assert.throws(() => UsesLib.link(lib2), "Contract UsesLib has already been linked to Lib.");
            });
        });
    });
    describe("Linking when not necessary", function () {
        it("Should throw the right error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const Lib = this.env.artifacts.require(libName);
                const Greeter = this.env.artifacts.require(greeterName);
                const lib = yield Lib.new();
                chai_1.assert.throws(() => Greeter.link(lib), "Tried to link contract Greeter with library Lib, but it uses no libraries.");
            });
        });
    });
    describe("Linking an incorrect library", function () {
        it("Should throw the right error", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const UsesLib = this.env.artifacts.require(usesLibName);
                const Greeter = this.env.artifacts.require(greeterName);
                const greeter = yield Greeter.new();
                chai_1.assert.throws(() => UsesLib.link(greeter), "Tried to link contract UsesLib with library Greeter, but it's not one of its libraries. UsesLib's libraries are: Lib");
            });
        });
    });
}
describe("Libraries linking", function () {
    describe("When using solc 0.4.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.4", plugins_1.HARDHAT_NETWORK_NAME);
        linkingShouldWorkCorrectly();
    });
    describe("When using solc 0.5.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.5", plugins_1.HARDHAT_NETWORK_NAME);
        linkingShouldWorkCorrectly();
    });
    describe("When using solc 0.6.x", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-solc-0.6", plugins_1.HARDHAT_NETWORK_NAME);
        linkingShouldWorkCorrectly();
    });
    describe("When the contract and the library have ambiguous names", function () {
        (0, helpers_1.useEnvironment)("hardhat-project-ambiguous-names", plugins_1.HARDHAT_NETWORK_NAME);
        linkingShouldWorkCorrectly(true);
    });
});
