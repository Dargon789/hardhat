"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("@ethereumjs/util");
const chai_1 = require("chai");
const keys_derivation_1 = require("../../../src/internal/util/keys-derivation");
const MNEMONIC =
  "atom exist unusual amazing find assault penalty wall curve lunar promote cattle";
const ADDRESS = "0x9CFE3206BD8beDC01c1f04E644eCd3e96a16F095";
const PASSPHRASE = "it is a secret";
const ADDRESS_WITH_PASS = "0xCD0062c186566742271bD083e5E92402391C03B2";
describe("Keys derivation", function () {
  describe("deriveKeyFromMnemonicAndPath", function () {
    it("Should derive the right keys", function () {
      const path = "m/123/123'";
      const derivedPk = (0, keys_derivation_1.deriveKeyFromMnemonicAndPath)(
        MNEMONIC,
        path,
        ""
      );
      const address = (0, util_1.bytesToHex)(
        (0, util_1.privateToAddress)(derivedPk)
      );
      chai_1.assert.equal((0, util_1.toChecksumAddress)(address), ADDRESS);
      const derivedPkWithPass = (0,
      keys_derivation_1.deriveKeyFromMnemonicAndPath)(
        MNEMONIC,
        path,
        PASSPHRASE
      );
      const addressWithPass = (0, util_1.bytesToHex)(
        (0, util_1.privateToAddress)(derivedPkWithPass)
      );
      chai_1.assert.equal(
        (0, util_1.toChecksumAddress)(addressWithPass),
        ADDRESS_WITH_PASS
      );
    });
    it("Should derive the right keys from '\n{mnemonic}'", function () {
      const mnemonic = `\n${MNEMONIC}`;
      const path = "m/123/123'";
      const derivedPk = (0, keys_derivation_1.deriveKeyFromMnemonicAndPath)(
        mnemonic,
        path,
        ""
      );
      const address = (0, util_1.bytesToHex)(
        (0, util_1.privateToAddress)(derivedPk)
      );
      chai_1.assert.equal((0, util_1.toChecksumAddress)(address), ADDRESS);
      const derivedPkWithPass = (0,
      keys_derivation_1.deriveKeyFromMnemonicAndPath)(
        mnemonic,
        path,
        PASSPHRASE
      );
      const addressWithPass = (0, util_1.bytesToHex)(
        (0, util_1.privateToAddress)(derivedPkWithPass)
      );
      chai_1.assert.equal(
        (0, util_1.toChecksumAddress)(addressWithPass),
        ADDRESS_WITH_PASS
      );
    });
  });
  it("Should derive the right keys from '{mnemonic}\n'", function () {
    const mnemonic = `${MNEMONIC}\n`;
    const path = "m/123/123'";
    const derivedPk = (0, keys_derivation_1.deriveKeyFromMnemonicAndPath)(
      mnemonic,
      path,
      ""
    );
    const address = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPk)
    );
    chai_1.assert.equal((0, util_1.toChecksumAddress)(address), ADDRESS);
    const derivedPkWithPass = (0,
    keys_derivation_1.deriveKeyFromMnemonicAndPath)(mnemonic, path, PASSPHRASE);
    const addressWithPass = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPkWithPass)
    );
    chai_1.assert.equal(
      (0, util_1.toChecksumAddress)(addressWithPass),
      ADDRESS_WITH_PASS
    );
  });
  it("Should derive the right keys from ' {mnemonic}'", function () {
    const mnemonic = ` ${MNEMONIC}`;
    const path = "m/123/123'";
    const derivedPk = (0, keys_derivation_1.deriveKeyFromMnemonicAndPath)(
      mnemonic,
      path,
      ""
    );
    const address = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPk)
    );
    chai_1.assert.equal((0, util_1.toChecksumAddress)(address), ADDRESS);
    const derivedPkWithPass = (0,
    keys_derivation_1.deriveKeyFromMnemonicAndPath)(mnemonic, path, PASSPHRASE);
    const addressWithPass = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPkWithPass)
    );
    chai_1.assert.equal(
      (0, util_1.toChecksumAddress)(addressWithPass),
      ADDRESS_WITH_PASS
    );
  });
  it("Should derive the right keys from '{mnemonic} '", function () {
    const mnemonic = `${MNEMONIC} `;
    const path = "m/123/123'";
    const derivedPk = (0, keys_derivation_1.deriveKeyFromMnemonicAndPath)(
      mnemonic,
      path,
      ""
    );
    const address = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPk)
    );
    chai_1.assert.equal((0, util_1.toChecksumAddress)(address), ADDRESS);
    const derivedPkWithPass = (0,
    keys_derivation_1.deriveKeyFromMnemonicAndPath)(mnemonic, path, PASSPHRASE);
    const addressWithPass = (0, util_1.bytesToHex)(
      (0, util_1.privateToAddress)(derivedPkWithPass)
    );
    chai_1.assert.equal(
      (0, util_1.toChecksumAddress)(addressWithPass),
      ADDRESS_WITH_PASS
    );
  });
});
