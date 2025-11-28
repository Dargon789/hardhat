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
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const web3_1 = require("web3");
const helpers_1 = require("./helpers");
chai_1.default.use(chai_as_promised_1.default);
describe("Web3 plugin", function () {
    describe("ganache", function () {
        (0, helpers_1.useEnvironment)("hardhat-project", "localhost");
        describe("contracts", function () {
            it("should deploy", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const artifact = this.env.artifacts.readArtifactSync("Greeter");
                    const Greeter = new web3_1.Contract(artifact.abi, this.env.web3);
                    const response = Greeter.deploy({
                        data: artifact.bytecode,
                    }).send({
                        from: (yield this.env.web3.eth.getAccounts())[0],
                    });
                    yield new Promise((resolve) => response.on("receipt", () => resolve()));
                });
            });
        });
    });
    describe("hardhat", function () {
        (0, helpers_1.useEnvironment)("hardhat-project", "hardhat");
        describe("contract", function () {
            it("should deploy", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const artifact = this.env.artifacts.readArtifactSync("Greeter");
                    const Greeter = new web3_1.Contract(artifact.abi, this.env.web3);
                    const from = (yield this.env.web3.eth.getAccounts())[0];
                    const response = Greeter.deploy({
                        data: artifact.bytecode,
                    }).send({
                        from,
                    });
                    yield new Promise((resolve) => response.on("receipt", () => resolve()));
                });
            });
        });
    });
});
