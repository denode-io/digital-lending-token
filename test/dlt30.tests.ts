import { deployTest, roleTest, mintTest, burnTest, transferTest, approvalTest } from "./denode.erc20.tests";

const contractName = "DLT30"
describe(`${contractName} Contract`, () => {
    describe("Deploy", ()=>{deployTest(contractName)});
    describe("Role", ()=>{roleTest(contractName)});
    describe("Mint", ()=>{mintTest(contractName)});
    describe("Burn", ()=>{burnTest(contractName)});
    describe("Transfer", ()=>{transferTest(contractName)});
    describe("Approval", ()=>{approvalTest(contractName)});
});
