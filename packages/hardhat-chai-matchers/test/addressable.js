"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ethers_1 = require("ethers");
const chai_1 = require("chai");
require("../src/internal/add-chai-matchers");
describe("Addressable matcher", () => {
    const signer = ethers_1.ethers.Wallet.createRandom();
    const address = signer.address;
    const contract = new ethers_1.ethers.Contract(address, []);
    const typedAddress = ethers_1.ethers.Typed.address(address);
    const typedSigner = ethers_1.ethers.Typed.address(signer);
    const typedContract = ethers_1.ethers.Typed.address(contract);
    const otherSigner = ethers_1.ethers.Wallet.createRandom();
    const otherAddress = otherSigner.address;
    const otherContract = new ethers_1.ethers.Contract(otherAddress, []);
    const otherTypedAddress = ethers_1.ethers.Typed.address(otherAddress);
    const otherTypedSigner = ethers_1.ethers.Typed.address(otherSigner);
    const otherTypedContract = ethers_1.ethers.Typed.address(otherContract);
    const elements = [
        { name: "address", object: address, class: address },
        { name: "signer", object: signer, class: address },
        { name: "contract", object: contract, class: address },
        { name: "typed address", object: typedAddress, class: address },
        { name: "typed signer", object: typedSigner, class: address },
        { name: "typed contract", object: typedContract, class: address },
        { name: "other address", object: otherAddress, class: otherAddress },
        { name: "other signer", object: otherSigner, class: otherAddress },
        { name: "other contract", object: otherContract, class: otherAddress },
        {
            name: "other typed address",
            object: otherTypedAddress,
            class: otherAddress,
        },
        {
            name: "other typed signer",
            object: otherTypedSigner,
            class: otherAddress,
        },
        {
            name: "other typed contract",
            object: otherTypedContract,
            class: otherAddress,
        },
    ];
    for (const el1 of elements)
        for (const el2 of elements) {
            const expectEqual = el1.class === el2.class;
            describe(`expect "${el1.name}" to equal "${el2.name}"`, () => {
                if (expectEqual) {
                    it("should not revert", () => {
                        (0, chai_1.expect)(el1.object).to.equal(el2.object);
                    });
                }
                else {
                    it("should revert", () => {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(el1.object).to.equal(el2.object)).to.throw(chai_1.AssertionError, `expected '${el1.class}' to equal '${el2.class}'.`);
                    });
                }
            });
            describe(`expect "${el1.name}" to not equal "${el2.name}"`, () => {
                if (expectEqual) {
                    it("should revert", () => {
                        (0, chai_1.expect)(() => (0, chai_1.expect)(el1.object).to.not.equal(el2.object)).to.throw(chai_1.AssertionError, `expected '${el1.class}' to not equal '${el2.class}'.`);
                    });
                }
                else {
                    it("should not revert", () => {
                        (0, chai_1.expect)(el1.object).to.not.equal(el2.object);
                    });
                }
            });
        }
});
