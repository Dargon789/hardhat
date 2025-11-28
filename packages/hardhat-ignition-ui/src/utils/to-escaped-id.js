"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toEscapedId = void 0;
/**
 * Convert Ignition id to an escaped version for safe use in Mermaid diagrams.
 */
function toEscapedId(id) {
    return id
        .replaceAll("(", "__")
        .replaceAll(")", "___")
        .replaceAll(",", "____")
        .replaceAll("~", "_____")
        .replaceAll("#", "______")
        .replaceAll(" ", "_______");
}
exports.toEscapedId = toEscapedId;
