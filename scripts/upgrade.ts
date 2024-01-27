import { ethers, upgrades } from "hardhat";

const PROXY = "0xe7f1725e7734ce288f8367e1bb143e90bb3f0512"

async function main() {
    const StakeManagerV2 = await ethers.getContractFactory("StakeManagerV2");
    console.log("Upgrading  StakeManager...");

    await upgrades.upgradeProxy(PROXY, StakeManagerV2);


    const stakeManager = await ethers.getContractAt("StakeManagerV2", PROXY)
    console.log("new version :", await stakeManager.getVersion());
}


main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
