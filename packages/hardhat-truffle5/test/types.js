"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.test = void 0;
// doesn't get called, only typechecks
function test() {
    const ierc20Artifact = dummyArtifacts.require("IERC20");
    const unknownArtifact = dummyArtifacts.require("UnknownArtifact");
    assert(true);
    assert(true);
}
exports.test = test;
