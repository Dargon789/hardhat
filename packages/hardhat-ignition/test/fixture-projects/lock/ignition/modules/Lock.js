"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ignition_core_1 = require("@nomicfoundation/ignition-core");
const LockModule = (0, ignition_core_1.buildModule)("LockModule", (m) => {
    const unlockTime = m.getParameter("unlockTime");
    const lockedAmount = m.getParameter("lockedAmount", 1000000000n);
    const lock = m.contract("Lock", [unlockTime], {
        value: lockedAmount,
    });
    return { lock };
});
// eslint-disable-next-line import/no-default-export
exports.default = LockModule;
