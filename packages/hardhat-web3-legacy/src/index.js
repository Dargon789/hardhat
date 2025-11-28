"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("hardhat/config");
const plugins_1 = require("hardhat/plugins");
require("./type-extensions");
const web3_provider_adapter_1 = require("./web3-provider-adapter");
(0, config_1.extendEnvironment)((env) => {
    env.Web3 = (0, plugins_1.lazyFunction)(() => require("web3"));
    env.web3 = (0, plugins_1.lazyObject)(() => {
        const Web3 = require("web3");
        return new Web3(new web3_provider_adapter_1.Web3HTTPProviderAdapter(env.network.provider));
    });
    const { promisifyWeb3 } = require("./pweb3");
    env.pweb3 = (0, plugins_1.lazyObject)(() => promisifyWeb3(env.web3));
});
