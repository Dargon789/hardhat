"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const is_node_version_to_warn_on_1 = require("../../../src/internal/cli/is-node-version-to-warn-on");
describe("isNodeVersionToWarnOn", function () {
  it("Should not warn on supported versions", function () {
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v18.0.0")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v18.20.3")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v20.0.0")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v20.14.0")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v22.0.0")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v22.3.0")
    );
  });
  it("Should not warn on even newer versions even if they are unsupported", function () {
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v24.0.0")
    );
    chai_1.assert.isFalse(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v24.3.0")
    );
  });
  it("Should warn on unsupported older node versions", function () {
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v10.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v10.24.1")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v11.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v12.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v12.22.12")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v13.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v14.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v14.21.3")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v15.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v16.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v16.20.20")
    );
  });
  it("Should warn on odd number releases", function () {
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v15.14.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v17.9.1")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v19.9.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v21.7.3")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v23.0.0")
    );
    (0, chai_1.assert)(
      (0, is_node_version_to_warn_on_1.isNodeVersionToWarnOn)("v25.0.0")
    );
  });
});
