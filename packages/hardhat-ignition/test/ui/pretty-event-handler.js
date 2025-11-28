"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const pretty_event_handler_1 = require("../../src/ui/pretty-event-handler");
describe("ui - pretty event handler", () => {
    describe("ledger", () => {
        it("should set a message on connection start", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConnectionStart();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Connecting wallet");
            chai_1.assert.isTrue(eventHandler.state.ledger);
            chai_1.assert.isTrue(eventHandler.state.ledgerMessageIsDisplayed);
        });
        it("should set a message on connection success", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConnectionSuccess();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Wallet connected");
        });
        it("should set a message on connection failure", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConnectionFailure();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Wallet connection failed");
        });
        it("should set a message on confirmation start", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConfirmationStart();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Waiting for confirmation on device");
            chai_1.assert.isTrue(eventHandler.state.ledger);
            chai_1.assert.isTrue(eventHandler.state.ledgerMessageIsDisplayed);
        });
        it("should set a message on confirmation success", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConfirmationSuccess();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Transaction approved by device");
            chai_1.assert.isFalse(eventHandler.state.ledger);
        });
        it("should set a message on confirmation failure", () => {
            const eventHandler = new pretty_event_handler_1.PrettyEventHandler(undefined, true);
            eventHandler.ledgerConfirmationFailure();
            chai_1.assert.equal(eventHandler.state.ledgerMessage, "Transaction confirmation failed");
        });
    });
});
