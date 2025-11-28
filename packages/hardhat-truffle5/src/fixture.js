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
exports.getTruffleFixtureFunction = exports.hasMigrations = exports.hasTruffleFixture = exports.TRUFFLE_FIXTURE_NAME = void 0;
const fs_extra_1 = __importDefault(require("fs-extra"));
const errors_1 = require("hardhat/internal/core/errors");
const path_1 = __importDefault(require("path"));
exports.TRUFFLE_FIXTURE_NAME = "truffle-fixture";
function hasTruffleFixture(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            require.resolve(path_1.default.join(paths.tests, exports.TRUFFLE_FIXTURE_NAME));
            return true;
        }
        catch (_a) {
            return false;
        }
    });
}
exports.hasTruffleFixture = hasTruffleFixture;
function hasMigrations(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const migrationsDir = path_1.default.join(paths.root, "migrations");
        if (!(yield fs_extra_1.default.pathExists(migrationsDir))) {
            return false;
        }
        const files = yield fs_extra_1.default.readdir(migrationsDir);
        const jsFiles = files.filter((f) => f.toLowerCase().endsWith(".js"));
        return jsFiles.length > 1;
    });
}
exports.hasMigrations = hasMigrations;
function getTruffleFixtureFunction(paths) {
    return __awaiter(this, void 0, void 0, function* () {
        const fixturePath = require.resolve(path_1.default.join(paths.tests, exports.TRUFFLE_FIXTURE_NAME));
        let fixture = require(fixturePath);
        if (fixture.default !== undefined) {
            fixture = fixture.default;
        }
        if (!(fixture instanceof Function)) {
            throw new errors_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle5", `Truffle fixture file ${fixturePath} must return a function`);
        }
        return fixture;
    });
}
exports.getTruffleFixtureFunction = getTruffleFixtureFunction;
