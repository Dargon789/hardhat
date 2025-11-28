"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// FactoryOptions shouldn't have mandatory properties
const _factoryOptions = {};
// FactoryOptions only has these two properties.
// If new ones are added, then the deployContract
// implementation should be updated to also delete
// those new extra properties
const _factoryOptionsRequired = {
    signer: null,
    libraries: null,
};
