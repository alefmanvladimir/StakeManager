import { ethers, upgrades } from "hardhat";
import {adminAddress, registrationDepositAmount, registrationWaitTime} from "../config/config";

async function main() {
  const StakeManager = await ethers.getContractFactory("StakeManager");
  console.log("Deploying StakeManager...");

  const stakeManager = await upgrades.deployProxy(StakeManager,
      [adminAddress, registrationDepositAmount, registrationWaitTime], { initializer: 'initialize' }
  );

  await stakeManager.waitForDeployment();
  console.log("StakeManager deployed to:", stakeManager.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
