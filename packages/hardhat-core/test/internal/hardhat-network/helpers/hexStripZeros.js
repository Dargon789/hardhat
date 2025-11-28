"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hexStripZeros = void 0;
function hexStripZeros(hexString) {
  return hexString === "0x0" ? "0x0" : hexString.replace(/^0x0+/, "0x");
}
exports.hexStripZeros = hexStripZeros;
