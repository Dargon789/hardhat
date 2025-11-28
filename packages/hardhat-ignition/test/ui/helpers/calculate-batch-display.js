"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const calculate_batch_display_1 = require("../../../src/ui/helpers/calculate-batch-display");
const types_1 = require("../../../src/ui/types");
const test_format_1 = require("./test-format");
const exampleState = {
    status: types_1.UiStateDeploymentStatus.DEPLOYING,
    chainId: 31337,
    moduleName: "ExampleModule",
    deploymentDir: "/users/example",
    batches: [],
    currentBatch: 1,
    result: null,
    warnings: [],
    isResumed: false,
    maxFeeBumps: 0,
    disableFeeBumping: false,
    gasBumps: {},
    strategy: null,
    ledger: false,
    ledgerMessage: "",
    ledgerMessageIsDisplayed: false,
};
describe("ui - calculate batch display", () => {
    it("should render a batch with a single running future", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Executing ExampleModule#Token...
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.UNSTARTED,
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText);
    });
    it("should render a batch with a single completed future", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Executed ExampleModule#Token
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.SUCCESS,
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText);
    });
    it("should render a batch with a single failed future", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Failed ExampleModule#Token
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.ERRORED,
                    message: "The transaction reverted",
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText);
    });
    it("should render a batch with a single timed out future", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Timed out ExampleModule#Token
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.TIMEDOUT,
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText);
    });
    it("should render a batch with a single held future", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Held ExampleModule#Token
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.HELD,
                    heldId: 1,
                    reason: "Waiting for multisig signoff",
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText);
    });
    it("should render a complex batch in multiple states", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Failed ExampleModule#Dex
        Held ExampleModule#ENS
        Timed out ExampleModule#Registry
        Executed ExampleModule#Router
        Executing ExampleModule#Token...
      `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.UNSTARTED,
                },
                futureId: "ExampleModule#Token",
            },
            {
                status: {
                    type: types_1.UiFutureStatusType.ERRORED,
                    message: "The transaction reverted",
                },
                futureId: "ExampleModule#Dex",
            },
            {
                status: {
                    type: types_1.UiFutureStatusType.SUCCESS,
                },
                futureId: "ExampleModule#Router",
            },
            {
                status: {
                    type: types_1.UiFutureStatusType.TIMEDOUT,
                },
                futureId: "ExampleModule#Registry",
            },
            {
                status: {
                    type: types_1.UiFutureStatusType.HELD,
                    heldId: 1,
                    reason: "Waiting for multisig signoff",
                },
                futureId: "ExampleModule#ENS",
            },
        ], 7, expectedText);
    });
    it("should render a batch when using a ledger device", () => {
        const expectedText = (0, test_format_1.testFormat)(`
      Batch #1
        Executing ExampleModule#Token...

        Ledger: Waiting for confirmation on device
    `);
        assertBatchText([
            {
                status: {
                    type: types_1.UiFutureStatusType.UNSTARTED,
                },
                futureId: "ExampleModule#Token",
            },
        ], 3, expectedText, {
            ledger: true,
            ledgerMessage: "Waiting for confirmation on device",
        });
    });
});
function assertBatchText(batch, expectedHeight, expectedText, extraState) {
    const { text: actualText, height } = (0, calculate_batch_display_1.calculateBatchDisplay)(Object.assign(Object.assign(Object.assign({}, exampleState), { batches: [batch] }), extraState));
    chai_1.assert.equal(height, expectedHeight);
    chai_1.assert.equal(actualText, expectedText);
}
