#!/usr/bin/env node
"use strict";
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
exports.main = void 0;
const child_process_1 = require("child_process");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let pathToHardhat;
        try {
            pathToHardhat = require.resolve("hardhat/internal/cli/cli.js", {
                paths: [process.cwd()],
            });
        }
        catch (e) {
            if (e.code === "MODULE_NOT_FOUND") {
                console.error("You are not inside a Hardhat project, or Hardhat is not locally installed");
            }
            else {
                console.error(`[hh] Unexpected error: ${e.message}`);
            }
            process.exit(1);
        }
        const { status } = (0, child_process_1.spawnSync)("node", [pathToHardhat, ...process.argv.slice(2)], {
            stdio: "inherit",
        });
        process.exitCode = status !== null && status !== void 0 ? status : 0;
    });
}
exports.main = main;
main()
    .then(() => process.exit(process.exitCode))
    .catch((error) => {
    console.error(error);
    process.exit(1);
});
