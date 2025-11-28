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
exports.useIgnitionProject = void 0;
const plugins_testing_1 = require("hardhat/plugins-testing");
const path_1 = __importDefault(require("path"));
function useIgnitionProject(fixtureProjectName) {
    beforeEach("Load environment", function () {
        return __awaiter(this, void 0, void 0, function* () {
            process.chdir(path_1.default.join(__dirname, "../fixture-projects", fixtureProjectName));
            const hre = require("hardhat");
            yield hre.network.provider.send("evm_setAutomine", [true]);
            yield hre.run("compile", { quiet: true });
            this.hre = hre;
        });
    });
    afterEach("reset hardhat context", function () {
        (0, plugins_testing_1.resetHardhatContext)();
    });
}
exports.useIgnitionProject = useIgnitionProject;
