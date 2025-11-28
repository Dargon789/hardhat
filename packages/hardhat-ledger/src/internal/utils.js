"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toHex = void 0;
function toHex(value) {
    const stringValue = typeof value === "string" ? value : value.toString("hex");
    return stringValue.startsWith("0x") ? stringValue : `0x${stringValue}`;
}
exports.toHex = toHex;
