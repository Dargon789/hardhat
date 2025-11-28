"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptGetStatus = exports.interceptVerify = exports.interceptIsVerified = exports.mockEnvironment = void 0;
const undici_1 = require("undici");
const mockAgent = new undici_1.MockAgent({
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10,
});
const client = mockAgent.get("https://api-hardhat.etherscan.io");
const mockEnvironment = () => {
    let globalDispatcher;
    // enable network connections for everything but etherscan API
    mockAgent.enableNetConnect(/^(?!https:\/\/api-hardhat\.etherscan\.io)/);
    before(() => {
        globalDispatcher = (0, undici_1.getGlobalDispatcher)();
        (0, undici_1.setGlobalDispatcher)(mockAgent);
    });
    after(() => {
        (0, undici_1.setGlobalDispatcher)(globalDispatcher);
    });
};
exports.mockEnvironment = mockEnvironment;
const interceptIsVerified = (response) => client
    .intercept({
    path: /\/api\?action=getsourcecode&address=0x[a-fA-F0-9]{40}&apikey=[a-zA-Z0-9]+&module=contract/,
})
    .reply(200, response);
exports.interceptIsVerified = interceptIsVerified;
const interceptVerify = (response, statusCode = 200) => client
    .intercept({
    path: "/api",
    method: "POST",
    body: /apikey=[a-zA-Z0-9]+&module=contract&action=verifysourcecode&contractaddress=0x[a-fA-F0-9]{40}&sourceCode=.+&codeformat=solidity-standard-json-input&contractname=.+&compilerversion=.+&constructorArguements=.*/,
})
    .reply(statusCode, response);
exports.interceptVerify = interceptVerify;
const interceptGetStatus = (response, statusCode = 200) => client
    .intercept({
    path: /\/api\?action=checkverifystatus&apikey=[a-zA-Z0-9]+&guid=.+&module=contract/,
    method: "GET",
})
    .reply(statusCode, response);
exports.interceptGetStatus = interceptGetStatus;
