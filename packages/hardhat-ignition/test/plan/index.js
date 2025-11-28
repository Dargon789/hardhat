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
/* eslint-disable import/no-unused-modules */
const chai_1 = require("chai");
const fs_extra_1 = require("fs-extra");
const path_1 = __importDefault(require("path"));
const use_ignition_project_1 = require("../test-helpers/use-ignition-project");
describe("visualize", () => {
    (0, use_ignition_project_1.useEphemeralIgnitionProject)("minimal");
    it("should create a visualization", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const visualizationPath = path_1.default.resolve("../minimal/cache/visualization");
            (0, fs_extra_1.emptyDirSync)(visualizationPath);
            yield this.hre.run("compile", { quiet: true });
            yield this.hre.run({
                scope: "ignition",
                task: "visualize",
            }, {
                noOpen: true,
                modulePath: "./ignition/modules/MyModule.js",
            });
            const files = yield (0, fs_extra_1.readdir)(visualizationPath);
            (0, chai_1.assert)(files.includes("index.html"));
        });
    });
});
