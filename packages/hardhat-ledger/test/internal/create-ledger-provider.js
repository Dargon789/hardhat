"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const sinon_1 = __importDefault(require("sinon"));
const mocks_1 = require("../mocks");
const create_ledger_provider_1 = require("../../src/internal/create-ledger-provider");
const spinners = __importStar(require("../../src/internal/with-spinners"));
describe("createLedgerProvider", () => {
    let mockedProvider;
    beforeEach(() => {
        mockedProvider = new mocks_1.EthereumMockedProvider();
    });
    it("should pass the ledgerAccounts from the config to the LedgerProvider", () => {
        const ledgerAccounts = [
            "0x704ad3adfa9eae2be46c907ef5325d0fabe17353",
            "0xf4416d306caa15dd4cdf4cd882cd764a6b2aa9b2",
            "0xe149ff2797adc146aa2d68d3df3e819c3c38e762",
            "0x343fe45cd2d785a5f2e97a00de8436f9c42ef444",
        ];
        const config = { ledgerAccounts };
        const ledgerProvider = (0, create_ledger_provider_1.createLedgerProvider)(mockedProvider, config);
        chai_1.assert.deepEqual(ledgerProvider.options.accounts, ledgerAccounts);
        // Did not pass a derivation function, so should be undefined
        chai_1.assert.equal(ledgerProvider.options.derivationFunction, undefined);
    });
    it("should pass the ledgerLegacyDerivationPath from the config to the LedgerProvider", () => {
        const ledgerAccounts = [
            "0x704ad3adfa9eae2be46c907ef5325d0fabe17353",
            "0xf4416d306caa15dd4cdf4cd882cd764a6b2aa9b2",
            "0xe149ff2797adc146aa2d68d3df3e819c3c38e762",
            "0x343fe45cd2d785a5f2e97a00de8436f9c42ef444",
        ];
        const derivationFunction = (accountNumber) => {
            return `m/44'/60'/0'/${accountNumber}`; // legacy derivation path
        };
        const config = {
            ledgerAccounts,
            ledgerOptions: {
                derivationFunction,
            },
        };
        const ledgerProvider = (0, create_ledger_provider_1.createLedgerProvider)(mockedProvider, config);
        chai_1.assert.deepEqual(ledgerProvider.options.derivationFunction, derivationFunction);
    });
    it("should pass the provider to the LedgerProvider", () => __awaiter(void 0, void 0, void 0, function* () {
        const config = {
            ledgerAccounts: ["0xf4416d306caa15dd4cdf4cd882cd764a6b2aa9b2"],
        };
        const ledgerProvider = (0, create_ledger_provider_1.createLedgerProvider)(mockedProvider, config);
        const requestStub = sinon_1.default.stub(mockedProvider, "request");
        yield ledgerProvider.request({ method: "eth_blockNumber" });
        sinon_1.default.assert.calledOnceWithExactly(requestStub, {
            method: "eth_blockNumber",
        });
    }));
    it("should return a new LedgerProvider with spinners handlers attached", () => {
        const withSpinnerSpy = sinon_1.default.spy(spinners, "withSpinners");
        const config = {
            ledgerAccounts: ["0xe149ff2797adc146aa2d68d3df3e819c3c38e762"],
        };
        const ledgerProvider = (0, create_ledger_provider_1.createLedgerProvider)(mockedProvider, config);
        sinon_1.default.assert.calledOnceWithExactly(withSpinnerSpy, ledgerProvider);
    });
});
