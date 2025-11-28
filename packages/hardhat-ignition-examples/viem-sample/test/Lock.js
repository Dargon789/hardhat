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
const hardhat_network_helpers_1 = require("@nomicfoundation/hardhat-network-helpers");
const chai_1 = require("chai");
const hardhat_1 = __importDefault(require("hardhat"));
const LockModule_1 = __importDefault(require("../ignition/modules/LockModule"));
describe("Lock", function () {
    // We define a fixture to reuse the same setup in every test.
    // We use loadFixture to run this setup once, snapshot that state,
    // and reset Hardhat Network to that snapshot in every test.
    function deployOneYearLockFixture() {
        return __awaiter(this, void 0, void 0, function* () {
            const ONE_YEAR_IN_SECS = 365 * 24 * 60 * 60;
            const ONE_GWEI = 1000000000;
            const lockedAmount = BigInt(ONE_GWEI);
            const unlockTime = BigInt((yield hardhat_network_helpers_1.time.latest()) + ONE_YEAR_IN_SECS);
            // Contracts are deployed using the first signer/account by default
            const [owner, otherAccount] = yield hardhat_1.default.viem.getWalletClients();
            const { lock } = yield hardhat_1.default.ignition.deploy(LockModule_1.default, {
                parameters: {
                    LockModule: {
                        unlockTime,
                        lockedAmount,
                    },
                },
            });
            return { lock, unlockTime, lockedAmount, owner, otherAccount };
        });
    }
    describe("Deployment", function () {
        it("Should set the right unlockTime", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { lock, unlockTime } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                (0, chai_1.expect)(yield lock.read.unlockTime()).to.equal(unlockTime);
            });
        });
        it("Should set the right owner", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { lock, owner } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                (0, chai_1.expect)((yield lock.read.owner()).toLowerCase()).to.equal(owner.account.address);
            });
        });
        it("Should receive and store the funds to lock", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { lock, lockedAmount } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                const client = yield hardhat_1.default.viem.getPublicClient();
                (0, chai_1.expect)(yield client.getBalance({ address: lock.address })).to.equal(lockedAmount);
            });
        });
        it("Should fail if the unlockTime is not in the future", function () {
            return __awaiter(this, void 0, void 0, function* () {
                // We don't use the fixture here because we want a different deployment
                const LockArtifact = require("../artifacts/contracts/Lock.sol/Lock.json");
                const latestTime = yield hardhat_network_helpers_1.time.latest();
                const [client] = yield hardhat_1.default.viem.getWalletClients();
                yield (0, chai_1.expect)(client.deployContract({
                    abi: LockArtifact.abi,
                    bytecode: LockArtifact.bytecode,
                    args: [latestTime],
                    value: 1n,
                    account: client.account.address,
                })).to.be.rejectedWith("Unlock time should be in the future");
            });
        });
    });
    describe("Withdrawals", function () {
        describe("Validations", function () {
            it("Should revert with the right error if called too soon", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { lock } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                    yield (0, chai_1.expect)(lock.write.withdraw()).to.be.rejectedWith("You can't withdraw yet");
                });
            });
            it("Should revert with the right error if called from another account", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { lock, unlockTime, otherAccount } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                    // We can increase the time in Hardhat Network
                    yield hardhat_network_helpers_1.time.increaseTo(unlockTime);
                    yield (0, chai_1.expect)(lock.write.withdraw({ account: otherAccount.account.address })).to.be.rejectedWith("You aren't the owner");
                });
            });
            it("Shouldn't fail if the unlockTime has arrived and the owner calls it", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { lock, unlockTime } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                    // Transactions are sent using the first signer by default
                    yield hardhat_network_helpers_1.time.increaseTo(unlockTime);
                    yield (0, chai_1.expect)(lock.write.withdraw()).not.to.be.rejected;
                });
            });
        });
        describe("Events", function () {
            it("Should emit an event on withdrawals", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const LockArtifact = hardhat_1.default.artifacts.readArtifactSync("Lock");
                    const { lock, unlockTime, lockedAmount } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                    yield hardhat_network_helpers_1.time.increaseTo(unlockTime);
                    const client = yield hardhat_1.default.viem.getPublicClient();
                    yield lock.write.withdraw();
                    const logs = yield client.getContractEvents({
                        address: lock.address,
                        abi: LockArtifact.abi,
                        eventName: "Withdrawal",
                    });
                    (0, chai_1.expect)(logs[0].args.amount).to.equal(lockedAmount);
                });
            });
        });
        describe("Transfers", function () {
            it("Should transfer the funds to the owner", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const { lock, unlockTime, lockedAmount } = yield (0, hardhat_network_helpers_1.loadFixture)(deployOneYearLockFixture);
                    yield hardhat_network_helpers_1.time.increaseTo(unlockTime);
                    const client = yield hardhat_1.default.viem.getPublicClient();
                    const lockBalanceBefore = yield client.getBalance({
                        address: lock.address,
                    });
                    yield lock.write.withdraw();
                    const lockBalanceAfter = yield client.getBalance({
                        address: lock.address,
                    });
                    (0, chai_1.expect)(lockBalanceAfter).to.equal(lockBalanceBefore - lockedAmount);
                });
            });
        });
    });
});
