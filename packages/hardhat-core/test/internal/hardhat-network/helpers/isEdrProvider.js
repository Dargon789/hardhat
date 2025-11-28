"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEdrProvider = void 0;
/* eslint-disable dot-notation,@typescript-eslint/dot-notation */
const provider_1 = require("../../../../src/internal/hardhat-network/provider/provider");
function isEdrProvider(provider) {
  return (
    provider instanceof provider_1.EdrProviderWrapper ||
    provider["_provider"] instanceof provider_1.EdrProviderWrapper
  );
}
exports.isEdrProvider = isEdrProvider;
