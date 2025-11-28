"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sleep = void 0;
const sleep = (timeout) => new Promise((res) => setTimeout(res, timeout));
exports.sleep = sleep;
