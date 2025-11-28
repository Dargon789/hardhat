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
const web3_1 = __importDefault(require("web3"));
const pweb3_1 = require("../src/pweb3");
const CONTRACT_BYTECODE = "6080604052348015600f57600080fd5b50609b8061001e6000396000f3fe6080604052348015600f57600080fd5b506004361060325760003560e01c80635a44b650146037578063e730f60b146053575b600080fd5b603d605b565b6040518082815260200191505060405180910390f35b60596064565b005b60006001905090565b56fea265627a7a7230582075918bec172b335d3087851edc0735dd08bf398d38b6680f77bd9d9765d02be464736f6c634300050a0032";
const ABI = [
    {
        constant: true,
        inputs: [],
        name: "constantFunction",
        outputs: [
            {
                name: "",
                type: "uint256",
            },
        ],
        payable: false,
        stateMutability: "pure",
        type: "function",
    },
    {
        constant: false,
        inputs: [],
        name: "nonConstantFunction",
        outputs: [],
        payable: false,
        stateMutability: "nonpayable",
        type: "function",
    },
];
describe("pweb3", () => {
    let web3;
    let pweb3;
    beforeEach("Initialize web3 and pweb3", () => {
        const provider = new web3_1.default.providers.HttpProvider("http://127.0.0.1:8545");
        web3 = new web3_1.default(provider);
        pweb3 = (0, pweb3_1.promisifyWeb3)(web3);
    });
    it("Should throw if a synch call is made", () => {
        chai_1.assert.throws(() => pweb3.eth.accounts, "pweb3 doesn't support synchronous calls.");
    });
    it("Should promisify contracts", () => __awaiter(void 0, void 0, void 0, function* () {
        const accounts = yield pweb3.eth.getAccounts();
        const TestContract = pweb3.eth.contract(ABI);
        const test = yield TestContract.new({
            data: `0x${CONTRACT_BYTECODE}`,
            from: accounts[0],
            gas: 456789,
        });
        yield test.nonConstantFunction({ from: accounts[0] });
        chai_1.assert.equal(yield test.constantFunction(), 1);
    }));
    it("Should give the same result as calling web3 but promisified", () => __awaiter(void 0, void 0, void 0, function* () {
        const actualAccounts = yield pweb3.eth.getAccounts();
        return new Promise((resolve, reject) => {
            web3.eth.getAccounts((error, expectedAccounts) => {
                if (error !== null) {
                    reject(error);
                    return;
                }
                chai_1.assert.deepEqual(actualAccounts, expectedAccounts);
                resolve();
            });
        });
    }));
});
