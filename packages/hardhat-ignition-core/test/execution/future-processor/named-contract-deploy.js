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
const deployment_state_reducer_1 = require("../../../src/internal/execution/reducers/deployment-state-reducer");
const execution_result_1 = require("../../../src/internal/execution/types/execution-result");
const execution_state_1 = require("../../../src/internal/execution/types/execution-state");
const jsonrpc_1 = require("../../../src/internal/execution/types/jsonrpc");
const module_1 = require("../../../src/internal/module");
const assertions_1 = require("../../../src/internal/utils/assertions");
const helpers_1 = require("../../helpers");
const utils_1 = require("./utils");
const exampleAddress = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
describe("future processor", () => {
    const exampleTxHash = "0xeef10fc5170f669b86c4cd0444882a96087221325f8bf2f55d6188633aa7be7c";
    const initialDeploymentState = (0, deployment_state_reducer_1.deploymentStateReducer)(undefined);
    describe("deploying a named contract", () => {
        it("should deploy a named contract", () => __awaiter(void 0, void 0, void 0, function* () {
            // Arrange
            const fakeModule = {};
            const deploymentFuture = new module_1.NamedContractDeploymentFutureImplementation("MyModule:TestContract", fakeModule, "TestContract", [], {}, BigInt(0), helpers_1.exampleAccounts[0]);
            const { processor, storedDeployedAddresses } = yield (0, utils_1.setupFutureProcessor)((_transactionParams) => __awaiter(void 0, void 0, void 0, function* () {
                return exampleTxHash;
            }), {
                [exampleTxHash]: {
                    blockHash: `0xblockhash-5`,
                    blockNumber: 1,
                    contractAddress: exampleAddress,
                    status: jsonrpc_1.TransactionReceiptStatus.SUCCESS,
                    logs: [],
                },
            });
            // Act
            const result = yield processor.processFuture(deploymentFuture, initialDeploymentState);
            // Assert
            chai_1.assert.equal(storedDeployedAddresses["MyModule:TestContract"], exampleAddress);
            const updatedExState = result.newState.executionStates["MyModule:TestContract"];
            (0, assertions_1.assertIgnitionInvariant)(updatedExState.type === execution_state_1.ExecutionStateType.DEPLOYMENT_EXECUTION_STATE, "to be honest this was unexpected");
            chai_1.assert.equal(updatedExState.status, execution_state_1.ExecutionStatus.SUCCESS);
            chai_1.assert.deepStrictEqual(updatedExState.result, {
                type: execution_result_1.ExecutionResultType.SUCCESS,
                address: exampleAddress,
            });
        }));
    });
});
