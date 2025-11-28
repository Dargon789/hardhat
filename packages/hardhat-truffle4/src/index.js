"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
require("@nomiclabs/hardhat-web3-legacy");
const task_names_1 = require("hardhat/builtin-tasks/task-names");
const config_1 = require("hardhat/config");
const util_1 = require("hardhat/internal/core/providers/util");
const plugins_1 = require("hardhat/plugins");
const artifacts_1 = require("./artifacts");
const fixture_1 = require("./fixture");
const glob_1 = require("./glob");
const provisioner_1 = require("./provisioner");
const task_names_2 = require("./task-names");
require("./type-extensions");
let accounts;
(0, config_1.extendEnvironment)((env) => {
    env.artifacts.require = (0, plugins_1.lazyFunction)(() => {
        const provisioner = new provisioner_1.LazyTruffleContractProvisioner(env.web3, env.network.config, env.network.config.from);
        const ta = new artifacts_1.TruffleEnvironmentArtifacts(provisioner, env.artifacts);
        return ta.require.bind(ta);
    });
    env.assert = (0, plugins_1.lazyFunction)(() => require("chai").assert);
    env.expect = (0, plugins_1.lazyFunction)(() => require("chai").expect);
    const describeContract = (description, definition, modifier) => {
        if (env.network.name === plugins_1.HARDHAT_NETWORK_NAME) {
            if (accounts === undefined) {
                const { privateToAddress, bufferToHex, toBuffer, toChecksumAddress, } = require("ethereumjs-util");
                const netConfig = env.network.config;
                accounts = (0, util_1.normalizeHardhatNetworkAccountsConfig)(netConfig.accounts).map((acc) => {
                    const buffer = toBuffer(acc.privateKey);
                    return toChecksumAddress(bufferToHex(privateToAddress(buffer)));
                });
            }
        }
        else if (accounts === undefined) {
            throw new plugins_1.NomicLabsHardhatPluginError("@nomiclabs/hardhat-truffle4", `To run your tests that use Truffle's "contract()" function with the network "${env.network.name}", you need to use Hardhat's CLI`);
        }
        const describeMod = modifier === undefined ? describe : describe[modifier];
        describeMod(`Contract: ${description}`, () => {
            before("Running truffle fixture if available", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield env.run(task_names_2.RUN_TRUFFLE_FIXTURE_TASK);
                });
            });
            definition(accounts);
        });
    };
    env.contract = Object.assign((desc, def) => describeContract(desc, def), {
        only: (desc, def) => describeContract(desc, def, "only"),
        skip: (desc, def) => describeContract(desc, def, "skip"),
    });
});
(0, config_1.subtask)(task_names_1.TASK_TEST_SETUP_TEST_ENVIRONMENT, (_, { pweb3, network }) => __awaiter(void 0, void 0, void 0, function* () {
    if (network.name !== plugins_1.HARDHAT_NETWORK_NAME) {
        accounts = yield pweb3.eth.getAccounts();
    }
}));
(0, config_1.subtask)(task_names_1.TASK_COMPILE_SOLIDITY_GET_SOURCE_PATHS, (_, { config }, runSuper) => __awaiter(void 0, void 0, void 0, function* () {
    const sources = yield runSuper();
    const testSources = yield (0, glob_1.getSolidityFiles)(config.paths.tests);
    return [...sources, ...testSources];
}));
let wasWarningShown = false;
(0, config_1.subtask)(task_names_2.RUN_TRUFFLE_FIXTURE_TASK, (_, env) => __awaiter(void 0, void 0, void 0, function* () {
    const paths = env.config.paths;
    const hasFixture = yield (0, fixture_1.hasTruffleFixture)(paths);
    if (!wasWarningShown) {
        if ((yield (0, fixture_1.hasMigrations)(paths)) && !hasFixture) {
            console.warn("Your project has Truffle migrations, which have to be turned into a fixture to run your tests with Hardhat");
            wasWarningShown = true;
        }
    }
    if (hasFixture) {
        const fixture = yield (0, fixture_1.getTruffleFixtureFunction)(paths);
        yield fixture(env);
    }
}));
