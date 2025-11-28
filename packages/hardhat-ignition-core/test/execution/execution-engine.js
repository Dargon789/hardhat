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
const path_1 = __importDefault(require("path"));
const execution_engine_1 = require("../../src/internal/execution/execution-engine");
const file_deployment_loader_1 = require("../../src/internal/deployment-loader/file-deployment-loader");
const deployment_state_helpers_1 = require("../../src/internal/execution/deployment-state-helpers");
describe("ExecutionEngine", () => {
    describe("_checkForMissingTransactions", () => {
        it("should throw if there are PREPARE_SEND_TRANSACTION messages without a corresponding SEND_TRANSACTION message", () => __awaiter(void 0, void 0, void 0, function* () {
            const deploymentLoader = new file_deployment_loader_1.FileDeploymentLoader(path_1.default.resolve(__dirname, "../mocks/trackTransaction/success"));
            // the only thing the function we are testing requires is a deploymentLoader
            const engine = new execution_engine_1.ExecutionEngine(deploymentLoader, {}, {}, {}, {}, 5, 5, 5, 5, false);
            const deploymentState = yield (0, deployment_state_helpers_1.loadDeploymentState)(deploymentLoader);
            (0, chai_1.assert)(deploymentState !== undefined, "deploymentState is undefined");
            yield chai_1.assert.isRejected(engine.executeModule(deploymentState, {}, [], [], {}, "0x"), `IGN411: An error occured while trying to send a transaction for future LockModule#Lock.

Please use a block explorer to find the hash of the transaction with nonce 1 sent from account 0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266 and use the following command to add it to your deployment:

npx hardhat ignition track-tx <txHash> <deploymentId> --network <networkName>`);
        }));
    });
});
