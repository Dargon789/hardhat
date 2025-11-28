"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const viem_1 = require("viem");
const currentTimestampInSeconds = Math.round(new Date(2023, 0, 1).valueOf() / 1000);
const TEN_YEAR_IN_SECS = 10 * 365 * 24 * 60 * 60;
const TEN_YEARS_IN_FUTURE = currentTimestampInSeconds + TEN_YEAR_IN_SECS;
const ONE_GWEI = (0, viem_1.parseEther)("1", "gwei");
const LockModule = (0, modules_1.buildModule)("LockModule", (m) => {
    const unlockTime = m.getParameter("unlockTime", TEN_YEARS_IN_FUTURE);
    const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);
    const lock = m.contract("Lock", [unlockTime], {
        value: lockedAmount,
    });
    return { lock };
});
exports.default = LockModule;
