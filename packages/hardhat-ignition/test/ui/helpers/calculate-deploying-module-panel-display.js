"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chalk_1 = __importDefault(require("chalk"));
const path_1 = __importDefault(require("path"));
const calculate_deploying_module_panel_1 = require("../../../src/ui/helpers/calculate-deploying-module-panel");
const types_1 = require("../../../src/ui/types");
const test_format_1 = require("./test-format");
describe("ui - calculate starting message display", () => {
    const exampleState = {
        status: types_1.UiStateDeploymentStatus.UNSTARTED,
        chainId: 31337,
        moduleName: "ExampleModule",
        deploymentDir: "/users/example",
        batches: [],
        currentBatch: 0,
        result: null,
        warnings: [],
        isResumed: null,
        maxFeeBumps: 0,
        disableFeeBumping: false,
        gasBumps: {},
        strategy: "basic",
        ledger: false,
        ledgerMessage: "",
        ledgerMessageIsDisplayed: false,
    };
    it("should display the deploying module message", () => {
        const expectedText = (0, test_format_1.testFormat)(`
    Hardhat Ignition 🚀

    ${chalk_1.default.bold(`Deploying [ ExampleModule ]`)}
    `);
        const actualText = (0, calculate_deploying_module_panel_1.calculateDeployingModulePanel)(exampleState);
        chai_1.assert.equal(actualText, expectedText);
    });
    it("should include the strategy if it is something other than basic", () => {
        const expectedText = (0, test_format_1.testFormat)(`
    Hardhat Ignition 🚀

    ${chalk_1.default.bold(`Deploying [ ExampleModule ] with strategy create2`)}
    `);
        const actualText = (0, calculate_deploying_module_panel_1.calculateDeployingModulePanel)(Object.assign(Object.assign({}, exampleState), { strategy: "create2" }));
        chai_1.assert.equal(actualText, expectedText);
    });
    it("should display reconciliation warnings", () => {
        const expectedText = (0, test_format_1.testFormat)(`
    Hardhat Ignition 🚀

    ${chalk_1.default.bold(`Deploying [ ExampleModule ]`)}

    ${chalk_1.default.yellow("Warning - previously executed futures are not in the module:")}
    ${chalk_1.default.yellow(" - MyModule#Contract1")}
    ${chalk_1.default.yellow(" - MyModule#Contract1.call1")}
    ${chalk_1.default.yellow(" - MyModule#Contract2")}
    `);
        const actualText = (0, calculate_deploying_module_panel_1.calculateDeployingModulePanel)(Object.assign(Object.assign({}, exampleState), { warnings: [
                "MyModule#Contract1",
                "MyModule#Contract1.call1",
                "MyModule#Contract2",
            ] }));
        chai_1.assert.equal(actualText, expectedText);
    });
    it("should display a message when the deployment is being resumed and the path is not in the CWD", () => {
        const expectedText = (0, test_format_1.testFormat)(`
    Hardhat Ignition 🚀

    ${chalk_1.default.bold(`Resuming existing deployment from /users/example`)}

    ${chalk_1.default.bold(`Deploying [ ExampleModule ]`)}
    `);
        const actualText = (0, calculate_deploying_module_panel_1.calculateDeployingModulePanel)(Object.assign(Object.assign({}, exampleState), { isResumed: true }));
        chai_1.assert.equal(actualText, expectedText);
    });
    it("should display a message when the deployment is being resumed and the path is not in the CWD", () => {
        const expectedText = (0, test_format_1.testFormat)(`
    Hardhat Ignition 🚀

    ${chalk_1.default.bold(`Resuming existing deployment from .${path_1.default.sep}ignition${path_1.default.sep}deployments${path_1.default.sep}foo`)}

    ${chalk_1.default.bold(`Deploying [ ExampleModule ]`)}
    `);
        const actualText = (0, calculate_deploying_module_panel_1.calculateDeployingModulePanel)(Object.assign(Object.assign({}, exampleState), { isResumed: true, deploymentDir: `${process.cwd()}/ignition/deployments/foo` }));
        chai_1.assert.equal(actualText, expectedText);
    });
});
