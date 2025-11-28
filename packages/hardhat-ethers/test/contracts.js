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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const example_contracts_1 = require("./example-contracts");
const environment_1 = require("./environment");
const helpers_1 = require("./helpers");
(0, chai_1.use)(chai_as_promised_1.default);
describe("contracts", function () {
    (0, environment_1.useEnvironment)("minimal-project");
    it("should wait for deployment when automining is enabled", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            yield contract.waitForDeployment();
        });
    });
    it("should wait for deployment when automining is disabled", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            yield this.env.network.provider.send("evm_setAutomine", [false]);
            const contract = yield factory.deploy();
            let deployed = false;
            const waitForDeploymentPromise = contract.waitForDeployment().then(() => {
                deployed = true;
            });
            chai_1.assert.isFalse(deployed);
            yield (0, helpers_1.sleep)(10);
            chai_1.assert.isFalse(deployed);
            yield this.env.network.provider.send("hardhat_mine");
            yield waitForDeploymentPromise;
            chai_1.assert.isTrue(deployed);
        });
    });
    it("should wait for multiple deployments at the same time", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            yield this.env.network.provider.send("evm_setAutomine", [false]);
            // we set the gas limit so that the 3 txs fit in a block
            const contract1 = yield factory.deploy({ gasLimit: 1000000 });
            const contract2 = yield factory.deploy({ gasLimit: 1000000 });
            const contract3 = yield factory.deploy({ gasLimit: 1000000 });
            const allDeployedPromise = Promise.all([
                contract1.waitForDeployment(),
                contract2.waitForDeployment(),
                contract3.waitForDeployment(),
            ]);
            let deployed = false;
            const waitForDeploymentPromise = allDeployedPromise.then(() => {
                deployed = true;
            });
            chai_1.assert.isFalse(deployed);
            yield (0, helpers_1.sleep)(10);
            chai_1.assert.isFalse(deployed);
            yield this.env.network.provider.send("hardhat_mine");
            yield waitForDeploymentPromise;
            chai_1.assert.isTrue(deployed);
            yield this.env.network.provider.send("evm_setAutomine", [true]);
        });
    });
    it("should wait for an event using .on", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            let listener;
            const eventPromise = new Promise((resolve) => {
                listener = resolve;
                return contract.on("Inc", resolve);
            });
            yield contract.inc();
            yield eventPromise;
            yield contract.off("Inc", listener);
        });
    });
    it("should wait for an event using .once", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            const eventPromise = new Promise((resolve) => {
                return contract.once("Inc", resolve);
            });
            yield contract.inc();
            yield eventPromise;
        });
    });
    it("should work with ContractEvent objects", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            const contractEvent = contract.getEvent("Inc");
            let listener;
            const eventPromise = new Promise((resolve) => {
                listener = resolve;
                return contract.on(contractEvent, resolve);
            });
            yield contract.inc();
            yield eventPromise;
            yield contract.off(contractEvent, listener);
        });
    });
    it("should be able to wait for indexed events", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            let listener;
            const eventPromise = new Promise((resolve) => {
                listener = resolve;
                return contract.on("IncBy", resolve);
            });
            yield contract.incBy();
            yield eventPromise;
            yield contract.off("IncBy", listener);
        });
    });
    it("shouldn't trigger a listener for an unrelated event", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            let listener;
            let listenerTriggered = false;
            const eventPromise = new Promise((resolve) => {
                listener = () => {
                    listenerTriggered = true;
                    resolve();
                };
                return contract.on("IncBy", listener);
            });
            // call a function that doesn't trigger IncBy
            yield contract.inc();
            // contract events are implemented by polling the network, so we have to wait
            // some time to be sure that the event wasn't emitted
            yield Promise.race([eventPromise, (0, helpers_1.sleep)(250)]);
            chai_1.assert.isFalse(listenerTriggered);
            yield contract.off("IncBy", listener);
        });
    });
    it("should work when a tx emits multiple transactions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            let listenerInc;
            const incEventPromise = new Promise((resolve) => {
                listenerInc = resolve;
                return contract.on("Inc", listenerInc);
            });
            let listenerAnotherEvent;
            const anotherEventPromise = new Promise((resolve) => {
                listenerAnotherEvent = resolve;
                return contract.on("AnotherEvent", listenerAnotherEvent);
            });
            // call a function that doesn't trigger IncBy
            yield contract.emitsTwoEvents();
            yield Promise.all([incEventPromise, anotherEventPromise]);
            yield contract.off("Inc", listenerInc);
            yield contract.off("AnotherEvent", listenerAnotherEvent);
        });
    });
    it("should work when the same transaction emits the same event twice", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const signer = yield this.env.ethers.provider.getSigner(0);
            const factory = new this.env.ethers.ContractFactory(example_contracts_1.EXAMPLE_CONTRACT.abi, example_contracts_1.EXAMPLE_CONTRACT.deploymentBytecode, signer);
            const contract = yield factory.deploy();
            let listenerInc;
            let timesCalled = 0;
            const incEventPromise = new Promise((resolve) => {
                listenerInc = () => {
                    timesCalled++;
                    if (timesCalled === 2) {
                        resolve();
                    }
                };
                return contract.on("Inc", listenerInc);
            });
            yield contract.incTwice();
            yield incEventPromise;
            chai_1.assert.equal(timesCalled, 2);
            yield contract.off("Inc", listenerInc);
        });
    });
});
