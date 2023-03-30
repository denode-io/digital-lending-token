import { ethers } from "hardhat";

async function main() {
    const contractName = "DLT90";
    const Contract = await ethers.getContractFactory(contractName);
    const _contract = await Contract.deploy();
    await _contract.deployed();
    console.log(`${contractName} - contract deployed to ${_contract.address}`);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});