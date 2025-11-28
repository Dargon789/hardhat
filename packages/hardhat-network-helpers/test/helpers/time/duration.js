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
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const hh = __importStar(require("../../../src"));
describe("time#duration", function () {
    it("should convert millis to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.millis(1000), 1);
        });
    });
    it("should convert seconds to seconds (noop)", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.seconds(1000), 1000);
        });
    });
    it("should convert minutes to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.minutes(1), 60);
        });
    });
    it("should convert hours to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.hours(1), 3600);
        });
    });
    it("should convert days to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.days(1), 86400);
        });
    });
    it("should convert weeks to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.weeks(1), 604800);
        });
    });
    it("should convert years to seconds", function () {
        return __awaiter(this, void 0, void 0, function* () {
            chai_1.assert.equal(hh.time.duration.years(1), 31536000);
        });
    });
});
