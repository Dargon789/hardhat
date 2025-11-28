"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const hardhat_1 = __importDefault(require("hardhat"));
const currentTimestampInSeconds = Math.round(new Date(2023, 0, 1).valueOf() / 1000);
const TEN_YEAR_IN_SECS = 10 * 365 * 24 * 60 * 60;
const TEN_YEARS_IN_FUTURE = currentTimestampInSeconds + TEN_YEAR_IN_SECS;
const ONE_GWEI = BigInt(hardhat_1.default.ethers.parseUnits("1", "gwei").toString());
const LockModule = (0, modules_1.buildModule)("LockModule", (m) => {
    const unlockTime = m.getParameter("unlockTime", TEN_YEARS_IN_FUTURE);
    const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);
    const lock = m.contract("Lock", [unlockTime], {
        value: lockedAmount,
    });
    return { lock };
});
exports.default = LockModule;
