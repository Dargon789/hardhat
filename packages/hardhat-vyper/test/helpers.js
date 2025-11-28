"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.expectVyperErrorAsync = exports.useEnvironment = exports.useFixtureProject = exports.assertFileExists = void 0;
const chai_1 = require("chai");
const fsExtra = __importStar(require("fs-extra"));
const path_1 = __importDefault(require("path"));
const plugins_testing_1 = require("hardhat/plugins-testing");
const util_1 = require("../src/util");
function assertFileExists(pathToFile) {
    chai_1.assert.isTrue(fsExtra.existsSync(pathToFile), `Expected ${pathToFile} to exist`);
}
exports.assertFileExists = assertFileExists;
function useFixtureProject(projectName) {
    let projectPath;
    let prevWorkingDir;
    before(() => {
        projectPath = getFixtureProjectPath(projectName);
    });
    before(() => {
        prevWorkingDir = process.cwd();
        process.chdir(projectPath);
    });
    after(() => {
        process.chdir(prevWorkingDir);
    });
}
exports.useFixtureProject = useFixtureProject;
function getFixtureProjectPath(projectName) {
    const projectPath = path_1.default.join(__dirname, "fixture-projects", projectName);
    if (!fsExtra.pathExistsSync(projectPath)) {
        throw new Error(`Fixture project ${projectName} doesn't exist`);
    }
    return fsExtra.realpathSync(projectPath);
}
function useEnvironment(configPath) {
    beforeEach("Loading hardhat environment", function () {
        if (configPath !== undefined) {
            process.env.HARDHAT_CONFIG = configPath;
        }
        this.env = require("hardhat");
    });
    afterEach("Resetting hardhat context", function () {
        delete process.env.HARDHAT_CONFIG;
        (0, plugins_testing_1.resetHardhatContext)();
    });
}
exports.useEnvironment = useEnvironment;
function expectVyperErrorAsync(f, errorMessage) {
    return __awaiter(this, void 0, void 0, function* () {
        const error = new chai_1.AssertionError(`VyperPluginError expected, but no Error was thrown`);
        const notExactMatch = new chai_1.AssertionError(`VyperPluginError was thrown, but should have included "${errorMessage}" but got "`);
        const notRegexMatch = new chai_1.AssertionError(`VyperPluginError was thrown, but should have matched reged ${errorMessage} but got "`);
        try {
            yield f();
        }
        catch (err) {
            (0, chai_1.assert)(util_1.VyperPluginError.isNomicLabsHardhatPluginError(err));
            if (errorMessage !== undefined) {
                if (typeof errorMessage === "string") {
                    if (!err.message.includes(errorMessage)) {
                        notExactMatch.message += `${err.message}"`;
                        throw notExactMatch;
                    }
                }
                else {
                    if (errorMessage.exec(err.message) === null) {
                        notRegexMatch.message += `${err.message}"`;
                        throw notRegexMatch;
                    }
                }
            }
            return;
        }
        throw error;
    });
}
exports.expectVyperErrorAsync = expectVyperErrorAsync;
