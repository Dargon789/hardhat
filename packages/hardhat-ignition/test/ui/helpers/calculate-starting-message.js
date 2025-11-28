"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chalk_1 = __importDefault(require("chalk"));
const calculate_starting_message_1 = require("../../../src/ui/helpers/calculate-starting-message");
describe("ui - calculate starting message display", () => {
    it("should display the starting message", () => {
        const expectedText = `Hardhat Ignition starting for [ MyModule ]...`;
        const actualText = (0, calculate_starting_message_1.calculateStartingMessage)({
            moduleName: "MyModule",
            deploymentDir: "/users/example",
        });
        chai_1.assert.equal(actualText, expectedText);
    });
    it("should display the warning for an ephemeral network", () => {
        const warningMessage = `You are running Hardhat Ignition against an in-process instance of Hardhat Network.
This will execute the deployment, but the results will be lost.
You can use --network <network-name> to deploy to a different network.`;
        const expectedText = `${chalk_1.default.yellow(chalk_1.default.bold(warningMessage))}\n\nHardhat Ignition starting for [ MyModule ]...`;
        const actualText = (0, calculate_starting_message_1.calculateStartingMessage)({
            moduleName: "MyModule",
            deploymentDir: undefined,
        });
        chai_1.assert.equal(actualText, expectedText);
    });
});
