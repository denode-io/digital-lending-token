import { ethers } from "hardhat";

async function main() {
    const Contract = await ethers.getContractFactory("DLT90");
    const _contract = await Contract.deploy();
    await _contract.deployed();
    console.log(`Contract deployed to ${_contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});