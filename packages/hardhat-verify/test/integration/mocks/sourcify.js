"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interceptSourcifyVerify = exports.interceptSourcifyIsVerified = exports.mockEnvironmentSourcify = void 0;
const undici_1 = require("undici");
const mockAgent = new undici_1.MockAgent({
    keepAliveTimeout: 10,
    keepAliveMaxTimeout: 10,
});
const client = mockAgent.get("https://sourcify.dev");
const mockEnvironmentSourcify = () => {
    let globalDispatcher;
    // enable network connections for everything but etherscan API
    mockAgent.enableNetConnect(/^(?!https:\/\/sourcify\.dev)/);
    before(() => {
        globalDispatcher = (0, undici_1.getGlobalDispatcher)();
        (0, undici_1.setGlobalDispatcher)(mockAgent);
    });
    after(() => {
        (0, undici_1.setGlobalDispatcher)(globalDispatcher);
    });
};
exports.mockEnvironmentSourcify = mockEnvironmentSourcify;
const interceptSourcifyIsVerified = (response) => client
    .intercept({
    method: "GET",
    path: /\/server\/check-all-by-addresses\?addresses=0x[a-fA-F0-9]{40}&chainIds=[0-9]+/,
})
    .reply(200, response);
exports.interceptSourcifyIsVerified = interceptSourcifyIsVerified;
const interceptSourcifyVerify = (response, statusCode = 200) => client
    .intercept({
    path: "/server",
    method: "POST",
})
    .reply(statusCode, response);
exports.interceptSourcifyVerify = interceptSourcifyVerify;
