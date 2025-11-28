"use strict";
// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition
Object.defineProperty(exports, "__esModule", { value: true });
const modules_1 = require("@nomicfoundation/hardhat-ignition/modules");
const viem_1 = require("viem");
const JAN_1ST_2030 = 1893456000;
const ONE_GWEI = (0, viem_1.parseEther)("0.001");
const LockModule = (0, modules_1.buildModule)("LockModule", (m) => {
  const unlockTime = m.getParameter("unlockTime", JAN_1ST_2030);
  const lockedAmount = m.getParameter("lockedAmount", ONE_GWEI);
  const lock = m.contract("Lock", [unlockTime], {
    value: lockedAmount,
  });
  return { lock };
});
exports.default = LockModule;
