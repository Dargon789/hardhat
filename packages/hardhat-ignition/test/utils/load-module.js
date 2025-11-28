"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const load_module_1 = require("../../src/utils/load-module");
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("loadModule", function () {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("user-modules");
    it("should throw if the full path to the module does not exist", () => {
        chai_1.assert.throws(() => (0, load_module_1.loadModule)("ignition", "./ignition/modules/Fake.js"), "Could not find a module file at the path: ./ignition/modules/Fake.js");
    });
    it("should throw if the full path to the module is outside the module directory", () => {
        const unixErrorMessage = `The referenced module file ./hardhat.config.js is outside the module directory ignition/modules`;
        const expectedErrorMessage = process.platform === "win32"
            ? unixErrorMessage.replace("ignition/modules", "ignition\\modules")
            : unixErrorMessage;
        chai_1.assert.throws(() => (0, load_module_1.loadModule)("ignition", "./hardhat.config.js"), expectedErrorMessage);
    });
});
