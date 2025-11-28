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
const src_1 = require("../src");
describe("listDeployments", () => {
    it("should return an empty array if given a directory that doesn't exist", () => __awaiter(void 0, void 0, void 0, function* () {
        const result = yield (0, src_1.listDeployments)("nonexistant");
        chai_1.assert.deepEqual(result, []);
    }));
    it("should return an empty array if given a directory containing no deployments", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentDir = path_1.default.join(__dirname, "mocks", "listDeployments", "no-deployments");
        const result = yield (0, src_1.listDeployments)(deploymentDir);
        chai_1.assert.deepEqual(result, []);
    }));
    it("should return an array of deployment IDs if given a directory containing deployments", () => __awaiter(void 0, void 0, void 0, function* () {
        const deploymentDir = path_1.default.join(__dirname, "mocks", "listDeployments", "has-deployments");
        const result = yield (0, src_1.listDeployments)(deploymentDir);
        chai_1.assert.deepEqual(result, ["chain-1", "chain-2"]);
    }));
});
