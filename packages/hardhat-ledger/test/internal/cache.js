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
const chai_1 = require("chai");
const env_paths_1 = __importDefault(require("env-paths"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const sinon_1 = __importDefault(require("sinon"));
const path_1 = __importDefault(require("path"));
const cache = __importStar(require("../../src/internal/cache"));
describe("cache", () => {
    let fsStub;
    let cacheDir;
    beforeEach(() => {
        const { cache: cachePath } = (0, env_paths_1.default)("hardhat");
        cacheDir = path_1.default.join(cachePath, "ledger", cache.CACHE_FILE_NAME);
        fsStub = sinon_1.default.stub(fs_extra_1.default);
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    describe("write", () => {
        it("should write the supplied json to the ledger cache file", () => __awaiter(void 0, void 0, void 0, function* () {
            const json = { some: "json" };
            yield cache.write(json);
            // We need to do this by hand cause sinon does not play nice with overloads
            const args = fsStub.writeJSON.getCall(0).args;
            chai_1.assert.equal(args.length, 2);
            chai_1.assert.equal(args[0], cacheDir);
            chai_1.assert.deepEqual(args[1], json);
        }));
    });
    describe("read", () => {
        it("should read the ledger cache file", () => __awaiter(void 0, void 0, void 0, function* () {
            const json = { another: "json" };
            // We need to do this cast cause sinon does not play nice with overloads
            fsStub.readJSON.returns(Promise.resolve(json));
            const result = yield cache.read();
            chai_1.assert.deepEqual(result, json);
        }));
    });
});
