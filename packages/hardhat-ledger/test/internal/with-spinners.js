"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const events_1 = __importDefault(require("events"));
const with_spinners_1 = require("../../src/internal/with-spinners");
describe("withSpinners", () => {
    let eventEmitter;
    function containsArray(baseArray, values) {
        return values.every((value) => baseArray.includes(value));
    }
    beforeEach(() => {
        eventEmitter = new events_1.default();
    });
    afterEach(() => {
        sinon_1.default.restore();
    });
    it("should attach the connection events", () => {
        const emitter = (0, with_spinners_1.withSpinners)(eventEmitter);
        chai_1.assert.isTrue(containsArray(emitter.eventNames(), [
            "connection_start",
            "connection_success",
            "connection_failure",
        ]));
    });
    it("should attach the derivation events", () => {
        const emitter = (0, with_spinners_1.withSpinners)(eventEmitter);
        chai_1.assert.isTrue(containsArray(emitter.eventNames(), [
            "derivation_start",
            "derivation_success",
            "derivation_failure",
            "derivation_progress",
        ]));
    });
    it("should attach the confirmation events", () => {
        const emitter = (0, with_spinners_1.withSpinners)(eventEmitter);
        chai_1.assert.isTrue(containsArray(emitter.eventNames(), [
            "confirmation_start",
            "confirmation_success",
            "confirmation_failure",
        ]));
    });
});
