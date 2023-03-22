import { ethers } from "hardhat";
import { assert, expect } from "chai";


type Fixture = {
    contract: any,
    deployer: any,
    accounts: any[],
}

const fixture = async (contractName:string):Promise<Fixture> =>  {
    const Contract = await ethers.getContractFactory(contractName);
    let contract = await Contract.deploy();
    let deployer = (await ethers.getSigners())[0];
    let accounts = (await ethers.getSigners()).slice(1,9);
    return { contract, deployer, accounts };
}


export function deployTest(contractName:string) {

    var contract:any;
    var deployer:any;
    var accounts:any[];

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
    });

    it("Should the admin access role be set on the deployer's account", async function () {
        let hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), deployer.address);
        assert.equal(hasRole, true, "The deployer's account should be assigned the admin role");
        hasRole = await contract.hasRole(await contract.MINTER_ROLE(), deployer.address);
        assert.equal(hasRole, false, "The deployer's account should NOT be assigned the minter role");
    });

    it("Do NOT set any roles on an unknown account.", async function () {
        let hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), accounts[0].address);
        assert.equal(hasRole, false, "This account should NOT be assigned the admin role");
        hasRole = await contract.hasRole(await contract.MINTER_ROLE(), accounts[0].address);
        assert.equal(hasRole, false, "This account should NOT be assigned the minter role");
    });

    it("Initial supplied amount should be ZERO", async function () {
        const totalSupply = ethers.BigNumber.from(0);
        expect(await contract.totalSupply(), "Initial supply amount should be ZERO").to.equal(totalSupply);
    });
    
    it("Decimals should be ZERO", async function(){
        const decimals = await contract.decimals();
        expect(decimals, "Decimals should be ZERO").to.equal(0);
    });
    
    it("Max supply should be 1_000_000_000", async function(){
        const maxSupply = ethers.BigNumber.from(1_000_000_000);
        expect(await contract.maxSupply(), "Max supply should be a billion").to.equal(maxSupply);
    });

}




export function roleTest(contractName:string) {
    
    let contract:any;
    let deployer:any;
    let accounts:any[];

    let newMinter: any;
    let newAdmin: any;

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;
        newAdmin   = accounts[0];
        newMinter  = accounts[1];
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
        newMinter = null;
        newAdmin = null;
    });

    it("Should be set ADMIN role on the new account", async function () {

        let hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), newAdmin.address);
        assert.equal(hasRole, false, "The account should NOT be assigned the ADMIN role at this moment");

        await expect(contract.grantRole(contract.DEFAULT_ADMIN_ROLE(), newAdmin.address, { from: deployer.address })).not.to.be.reverted;

        hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), newAdmin.address);
        assert.equal(hasRole, true, "The account should be assigned the ADMIN role");

        hasRole = await contract.hasRole(await contract.MINTER_ROLE(), newAdmin.address);
        assert.equal(hasRole, false, "The account should NOT be assigned the MINTER role");
    });


    it("Should be set MINTER role on the new account", async function () {

        let hasRole = await contract.hasRole(await contract.MINTER_ROLE(), newMinter.address);
        assert.equal(hasRole, false, "The account should NOT be assigned the MINTER role at this moment");

        await expect(contract.grantRole(contract.MINTER_ROLE(), newMinter.address, { from: deployer.address })).not.to.be.reverted;

        hasRole = await contract.hasRole(await contract.MINTER_ROLE(), newMinter.address);
        assert.equal(hasRole, true, "The account should be assigned the MINTER role");

        hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), newMinter.address);
        assert.equal(hasRole, false, "The account should NOT be assigned the ADMIN role");
    });


    it("Should the ADMIN role be revoked from the admin account", async function () {
        
        let hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), deployer.address);
        assert.equal(hasRole, true, "The account should be the ADMIN role at this moment");

        await expect(contract.revokeRole(contract.DEFAULT_ADMIN_ROLE(), deployer.address, { from: deployer.address })).not.to.be.reverted;

        hasRole = await contract.hasRole(await contract.DEFAULT_ADMIN_ROLE(), deployer.address);
        assert.equal(hasRole, false, "The account should NOT be the ADMIN");
    });

    it("Should the MINTER role be revoked from the minter account", async function () {
        
        const minter = newMinter;

        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        let hasRole = await contract.hasRole(await contract.MINTER_ROLE(), minter.address);
        assert.equal(hasRole, true, "The account should be the MINTER role at this moment");

        await expect(contract.revokeRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        hasRole = await contract.hasRole(await contract.MINTER_ROLE(), minter.address);
        assert.equal(hasRole, false, "The account should NOT be the MINTER");
    });
}




export function mintTest(contractName:string) {
    
    let contract:any;
    let deployer:any;
    let accounts:any[];

    let minter: any;
    let holderA: any;
    let holderB: any;

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;

        minter  = accounts[0];
        holderA = accounts[3];
        holderB = accounts[4];
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
        minter = null;
        holderA = null;
        holderB = null;
    });


    it("Should allow the minter account to mint", async function () {
        
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        const zeroSupply        = ethers.BigNumber.from(0);
        const firstMintAmount   = ethers.BigNumber.from(10_000);
        const secondMintAmount  = ethers.BigNumber.from(1_337);
        const finalAmount       = ethers.BigNumber.from(11_337);

        const deployerFinalBalance  = ethers.BigNumber.from(0);
        const minterFinalBalance    = ethers.BigNumber.from(0);
        const holderAFinalBalance   = ethers.BigNumber.from(10_000);
        const holderBFinalBalance   = ethers.BigNumber.from(1_337);

        let currentTotalSupply = await contract.totalSupply();
        expect(currentTotalSupply, "Initial supplied amount should be ZERO").to.equal(zeroSupply);

        await expect(contract.connect(minter).mint(holderA.address, firstMintAmount)).not.to.be.reverted;

        currentTotalSupply = await contract.totalSupply();
        expect(currentTotalSupply, `After mint ${firstMintAmount} tokens, total supply should be EQUAL`).to.equal(firstMintAmount);

        await expect(contract.connect(minter).mint(holderB.address, secondMintAmount)).not.to.be.reverted;

        currentTotalSupply = await contract.totalSupply();
        expect(currentTotalSupply, `After second minting, total supply should be multiplied`).to.equal(finalAmount);

        const deployerCurrentBalance = await contract.balanceOf(deployer.address);
        expect(deployerCurrentBalance, "Deployer - balance should be 0").to.be.equal(deployerFinalBalance);

        const minterCurrentBalance = await contract.balanceOf(deployer.address);
        expect(minterCurrentBalance, "Minter - balance should be 0").to.be.equal(minterFinalBalance);

        const holderACurrentBalance = await contract.balanceOf(holderA.address);
        expect(holderACurrentBalance, `Holder[A] - balance should be ${holderAFinalBalance}`).to.be.equal(holderAFinalBalance);
        
        const holderBCurrentBalance = await contract.balanceOf(holderB.address);
        expect(holderBCurrentBalance, `Holder[B] - balance should be ${holderBFinalBalance}`).to.be.equal(holderBFinalBalance);

        // Negative Test
        await expect(contract.connect(deployer).mint(deployer.address, firstMintAmount)).to.be.reverted;

        // Negative Test
        const overflowAmount   = ethers.BigNumber.from(1_000_000_000);
        await expect(contract.connect(minter).mint(holderA.address, overflowAmount), "Mint more than max supply should be FAIL").to.be.reverted;

    });
}





export function transferTest(contractName:string) {
    
    let contract:any;
    let deployer:any;
    let accounts:any[];

    let minter: any;
    let accountA: any;
    let accountB: any;

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;

        minter  = accounts[0];
        accountA = accounts[3];
        accountB = accounts[4];
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
        minter = null;
        accountA = null;
        accountB = null;
    });


    it("Should be transferable", async function () {

        // grant minter account
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        // check balance of account A
        let balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account[A] - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // check balance of account B
        let balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB, "Account[B] - balance should be 0").to.be.equal(ethers.BigNumber.from(0));
        
        // mint 10k for account A
        const mintAmount = ethers.BigNumber.from(10_000);
        await expect(contract.connect(minter).mint(accountA.address, mintAmount), "10k tokens should be minted to account[A]").not.to.be.reverted;;
        
        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account[A] - balance should be 10k").to.be.equal(mintAmount);

        // transfer 3_337 tokens from account A to account B
        const transferAmount = ethers.BigNumber.from(3_337);
        await expect(contract.connect(accountA).transfer(accountB.address, transferAmount)).not.to.be.reverted;
        
        // check balance of account 1
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA).to.be.equal(mintAmount.sub(transferAmount));

        // check balance of account B
        balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB).to.be.equal(transferAmount);

    });



    it("Should NOT be possible to transfer more than the account owns", async function(){

        // grant minter account
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        // check balance of account A
        let balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account[A] - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // check balance of account B
        let balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB, "Account[B] - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // try to transfer  [negative test]
        const transferAmount = ethers.BigNumber.from(7_331);
        await expect(contract.connect(accountB).transfer(accountA.address, transferAmount), "This should be FAIL").to.be.rejected;

        // mint 5k for account A
        const mintAmount = ethers.BigNumber.from(5_000);
        await expect(contract.connect(minter).mint(accountA.address, mintAmount), "5k tokens should be minted to account [A]").not.to.be.reverted;
        
        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account A - balance should be 5k").to.be.equal(mintAmount);

        // transfer 7'331 tokens from account A to account B [negative test]
        await expect(contract.connect(accountA).transfer(accountB.address, transferAmount)).to.be.reverted;
        
        const transferAmount2 = ethers.BigNumber.from(1);
        await expect(contract.connect(accountA).transferFrom(accountA.address, accountB.address, transferAmount2)).to.be.reverted;
        
        await expect(contract.transferFrom(accountA.address, accountB.address, transferAmount2)).to.be.reverted;
    });
    
}





export function approvalTest(contractName:string) {
    
    let contract:any;
    let deployer:any;
    let accounts:any[];

    let minter: any;
    let accountA: any;
    let accountB: any;
    let accountC: any;

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;

        minter  = accounts[0];
        accountA = accounts[3];
        accountB = accounts[4];
        accountC = accounts[5];
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
        minter  = null;
        accountA = null;
        accountB = null;
        accountC = null;
    });


    it("Regular Approval", async function () {

        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        // check balance of account A
        let balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account A - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // check balance of account B
        let balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB, "Account B - balance should be 0").to.be.equal(ethers.BigNumber.from(0));
        
        // mint 10k for account A
        const mintAmount = ethers.BigNumber.from(10_000);
        await expect(contract.connect(minter).mint(accountA.address, mintAmount), "10k tokens should be minted to account A").not.to.be.reverted;;
        
        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account A - balance should be 10k").to.be.equal(mintAmount);


        // transfer 1'337 tokens from account 1 to account 2 but account 3
        const transferAmount = ethers.BigNumber.from(1_337);
        
        // no approval [negative]
        await expect(contract.connect(accountB).transferFrom(accountA.address, accountB.address, transferAmount)).to.be.reverted;  
        
        // approval 
        await expect(contract.connect(accountA).approve(accountB.address, transferAmount)).not.to.be.reverted;
        
        // transfer from 
        await expect(contract.connect(accountB).transferFrom(accountA.address, accountB.address, transferAmount)).not.to.be.reverted;
        
        // fail transfer from [negative]
        const smallAmount = ethers.BigNumber.from(1);
        await expect(contract.connect(accountC).transferFrom(accountA.address, accountB.address, smallAmount)).to.be.reverted;

        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA).to.be.equal(mintAmount.sub(transferAmount));

        // check balance of account B
        balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB).to.be.equal(transferAmount);

    });



    it("Unlimited Approval", async function () {

        // grant minter account
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        // check balance of account A
        let balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account A - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // check balance of account B
        let balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB, "Account B - balance should be 0").to.be.equal(ethers.BigNumber.from(0));

        // mint 10k for 
        const mintAmount = ethers.BigNumber.from(10_000);
        await expect(contract.connect(minter).mint(accountA.address, mintAmount), "10k tokens should be minted to account A").not.to.be.reverted;;
        
        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA, "Account A - balance should be 10k").to.be.equal(mintAmount);

        // transfer 1'337 tokens from account A to account B
        const aprovalAmount = ethers.BigNumber.from("0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff");
        const transferAmount = ethers.BigNumber.from(1_337);
        
        // no approval
        await expect(contract.connect(accountB).transferFrom(accountA.address, accountB.address, transferAmount)).to.be.reverted;  
        
        // approval
        await expect(contract.connect(accountA).approve(accountB.address, aprovalAmount)).not.to.be.reverted;
        
        // first transfer from
        await expect(contract.connect(accountB).transferFrom(accountA.address, accountB.address, transferAmount)).not.to.be.reverted;
        
        const smallAmount = ethers.BigNumber.from(1);

        // second transfer from
        await expect(contract.connect(accountB).transferFrom(accountA.address, accountB.address, smallAmount)).not.to.be.reverted;

        // check balance of account A
        balanceOfAccountA = await contract.balanceOf(accountA.address);
        expect(balanceOfAccountA).to.be.equal(mintAmount.sub(transferAmount).sub(smallAmount));

        // check balance of account B
        balanceOfAccountB = await contract.balanceOf(accountB.address);
        expect(balanceOfAccountB).to.be.equal(transferAmount.add(smallAmount));

    });

}




export function burnTest(contractName:string) {
    
    let contract:any;
    let deployer:any;
    let accounts:any[];

    let minter: any;
    let accountA: any;
    let accountB: any;

    beforeEach(async ()=>{
        const _fixture = await fixture(contractName);
        contract = _fixture.contract;
        deployer = _fixture.deployer;
        accounts = _fixture.accounts;

        minter  = accounts[0];
        accountA = accounts[3];
        accountB = accounts[4];
    });

    after(async ()=>{
        contract = null;
        deployer = null;
        accounts = [null];
        minter = null;
        accountA = null;
        accountB = null;
    });


    it("Should allow to burn", async () => {

        // grant minter account
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        const mintAmount    = ethers.BigNumber.from(10_000);
        const burnAmount    = ethers.BigNumber.from(8_663);
        const balanceStep1  = ethers.BigNumber.from(1_337);
        const balanceStep2  = ethers.BigNumber.from(1_300);

        await expect(contract.connect(minter).mint(accountA.address, mintAmount)).not.to.be.reverted;
        await expect(contract.connect(accountA).burn(burnAmount)).not.to.be.reverted;

        let accountACurrentBalance = await contract.balanceOf(accountA.address);
        expect(accountACurrentBalance, `account A - balance should be ${balanceStep1}`).to.be.equal(balanceStep1);

        const approvedAmount = ethers.BigNumber.from(37);
        await expect(contract.connect(accountA).approve(accountB.address, approvedAmount)).not.to.be.reverted;
        await expect(contract.connect(accountB).burnFrom(accountA.address,approvedAmount)).not.to.be.reverted;
        
        accountACurrentBalance = await contract.balanceOf(accountA.address);
        expect(accountACurrentBalance, `account A - balance should be ${balanceStep2}`).to.be.equal(balanceStep2);
    });


    it("Should not allow to burn", async () => {
        // grant minter account
        await expect(contract.grantRole(contract.MINTER_ROLE(), minter.address, { from: deployer.address })).not.to.be.reverted;

        const mintAmount = ethers.BigNumber.from(5_000);
        const burnAmount = ethers.BigNumber.from(1_000);

        const overBurnAmount = ethers.BigNumber.from(5_001);
        await expect(contract.connect(minter).mint(accountA.address, mintAmount)).not.to.be.reverted;
        await expect(contract.burnFrom(accountA.address, burnAmount)).to.be.reverted;
        await expect(contract.burnFrom(deployer.address, burnAmount)).to.be.reverted;
        await expect(contract.connect(accountA).burn(overBurnAmount)).to.be.reverted;

        let accountACurrentBalance = await contract.balanceOf(accountA.address);
        expect(accountACurrentBalance, `account A - balance should be ${mintAmount}`).to.be.equal(mintAmount);

    });

}