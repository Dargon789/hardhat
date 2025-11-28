"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const use_ignition_project_1 = require("./test-helpers/use-ignition-project");
/**
 * A project that only imports `@nomicfoundation/hardhat-ignition` will not add
 * a `hre.ignition` property to the Hardhat Runtime Environment.
 * We warn that you need to install either the viem or ethers plugin to get
 * Ignition support in tests or scripts.
 */
describe("ignition helper guard", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should error on attempting to use `hre.ignition` without viem/ethers plugins installed", function () {
        chai_1.assert.throws(() => this.hre.originalIgnition.deploy(), /Please install either `@nomicfoundation\/hardhat-ignition-viem` or `@nomicfoundation\/hardhat-ignition-ethers` to use Ignition in your Hardhat tests/);
    });
});
