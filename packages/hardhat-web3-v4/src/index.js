"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
require("./type-extensions");
(0, config_1.extendEnvironment)((env) => {
    env.Web3 = (0, plugins_1.lazyFunction)(() => require("web3").Web3);
    env.web3 = (0, plugins_1.lazyObject)(() => {
        const Web3 = require("web3").Web3;
        return new Web3(env.network.provider);
    });
});
