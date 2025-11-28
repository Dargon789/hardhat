"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withSpinners = void 0;
const ora_1 = __importDefault(require("ora"));
function withSpinners(emitter) {
    attachSpinner(emitter, {
        startText: "[hardhat-ledger] Connecting wallet",
        eventPrefix: "connection",
    });
    attachSpinner(emitter, {
        startText: "[hardhat-ledger] Waiting for confirmation",
        eventPrefix: "confirmation",
    });
    const derivationSpinner = attachSpinner(emitter, {
        startText: "[hardhat-ledger] Finding derivation path",
        eventPrefix: "derivation",
    });
    emitter.on("derivation_progress", (path, index) => emitter.isOutputEnabled
        ? (derivationSpinner.text = `[hardhat-ledger] Deriving address #${index} (path "${path}")`)
        : undefined);
    return emitter;
}
exports.withSpinners = withSpinners;
function attachSpinner(emitter, spinnerOptions) {
    const { startText, eventPrefix } = spinnerOptions;
    const spinner = (0, ora_1.default)({ text: startText, discardStdin: false });
    emitter.on(`${eventPrefix}_start`, () => emitter.isOutputEnabled ? spinner.start() : undefined);
    emitter.on(`${eventPrefix}_success`, () => emitter.isOutputEnabled ? spinner.succeed() : undefined);
    emitter.on(`${eventPrefix}_failure`, () => emitter.isOutputEnabled ? spinner.fail() : undefined);
    return spinner;
}
