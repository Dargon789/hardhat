"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/* eslint-disable import/no-unused-modules */
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const sinon_1 = __importDefault(require("sinon"));
chai_1.default.use(chai_as_promised_1.default);
chai_1.default.config.truncateThreshold = 1000;
afterEach(() => {
    sinon_1.default.restore();
});
