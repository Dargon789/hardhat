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
const node_path_1 = __importDefault(require("node:path"));
const main = (projectToBuild) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Running compile on the test fixture project - ", projectToBuild);
    const fixtureProjectDir = node_path_1.default.join(__dirname, "../test/fixture-projects", projectToBuild);
    process.chdir(fixtureProjectDir);
    const hre = require("hardhat");
    yield hre.run("compile", { quiet: true });
});
const project = process.argv[2];
void main(project).catch((error) => {
    console.error(error);
    process.exit(1);
});
