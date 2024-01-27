import {registrationDepositAmount, registrationWaitTime} from "../config/config";
import {Signer} from "ethers";
import {StakeManager} from "../typechain-types";
import {network, upgrades} from "hardhat";

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("StakeManager", function () {
    let stakeManager: any;
    let owner: Signer;
    let user1: Signer;
    let user2: Signer;

    beforeEach(async function () {
        [owner, user1, user2] = await ethers.getSigners();
        const ownerAddress = await owner.getAddress()
        const StakeManager = await ethers.getContractFactory("StakeManager");
        stakeManager = await upgrades.deployProxy(StakeManager,
            [ownerAddress, registrationDepositAmount, registrationWaitTime], { initializer: 'initialize' }
        );

    });

    describe("Registration", function () {
        it("should allow users to register", async function () {
            await stakeManager.connect(user1).register({ value: registrationDepositAmount });
            const isUser1Registered = await stakeManager.isRegistered(user1.getAddress());
            expect(isUser1Registered).to.be.true;
        });

        it("should not allow users to register without enough ETH", async function () {
            await expect(stakeManager.connect(user1).register({ value: registrationDepositAmount - 1 })).to.be.reverted;
        });
    });

    describe("Unregister", function () {
        beforeEach(async function () {
            await stakeManager.connect(user1).register({ value: registrationDepositAmount });
        });

        it("should fail for registered users with with insufficient time period", async function () {
            await expect(stakeManager.connect(user1).unregister()).to.be.revertedWith("Registration period not ended");
        });

        it("should allow registered users to unregister", async function () {
            const user1address = await user1.getAddress()

            await increaseTime(registrationWaitTime)

            await stakeManager.connect(user1).unregister();
            const isUser1Registered = await stakeManager.isRegistered(user1address);
            expect(isUser1Registered).to.be.false;
        });

        it("should fail for unregistered users", async function () {
            await increaseTime(registrationWaitTime)
            await expect(stakeManager.connect(user2).unregister()).to.be.revertedWith("Not a staker");
        });
    });

    describe("Stake", function () {
        beforeEach(async function () {
            await stakeManager.connect(user1).register({ value: registrationDepositAmount });
        });

        it("should allow registered users to stake ETH", async function () {
            const user1address = await user1.getAddress()

            await stakeManager.connect(user1).stake({ value: ethers.parseEther("1") });
            const user1Stake = await stakeManager.getStakeBalance(user1address);
            expect(user1Stake).to.equal(ethers.parseEther("1") + BigInt(registrationDepositAmount));
        });

        it("should fail for unregistered users", async function () {
            await expect(stakeManager.connect(user2).stake({ value: ethers.parseEther("1") })).to.be.revertedWith("Not a staker");
        });
    });

    describe("Unstake", function () {
        beforeEach(async function () {
            await stakeManager.connect(user1).register({ value: registrationDepositAmount });
            await stakeManager.connect(user1).stake({ value: ethers.parseEther("1") });
            await increaseTime(registrationWaitTime)
        });

        it("should allow registered users to unstake ETH", async function () {
            const user1address = await user1.getAddress()
            await stakeManager.connect(user1).unstake();
            const user1Stake = await stakeManager.getStakeBalance(user1address);
            expect(user1Stake).to.equal(0);
        });

        it("should fail for unregistered users", async function () {
            await expect(stakeManager.connect(user2).unstake()).to.be.revertedWith("Not a staker");
        });
    });

    describe("Slash", function () {
        beforeEach(async function () {
            await stakeManager.connect(user1).register({ value: registrationDepositAmount });
            await stakeManager.connect(user1).stake({ value: ethers.parseEther("1") });
        });

        it("should allow admin to slash a staker's ETH", async function () {
            const user1address = await user1.getAddress()
            await stakeManager.connect(owner).slash(user1address, ethers.parseEther("0.5"));
            const user1Stake = await stakeManager.getStakeBalance(user1address);
            expect(user1Stake).to.equal(ethers.parseEther("0.5") + BigInt(registrationDepositAmount));
        });

        it("should fail for non-admin users", async function () {
            const user1address = await user1.getAddress()
            await expect(stakeManager.connect(user2).slash(user1address, ethers.parseEther("0.5"))).to.be.revertedWith("Not an admin");
        });
    });
});


async function increaseTime(ms: number) {
    await network.provider.send("evm_increaseTime", [ms]);
    await network.provider.send("evm_mine");
}
