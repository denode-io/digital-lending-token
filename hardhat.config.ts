import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from 'dotenv';
dotenv.config()

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
    
  defaultNetwork: "hardhat",
  networks: {
    // hardhat: {
    //   chainId: 31337,
    // },
    bsctestnet: {
      chainId: 97,
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts: [process.env.BSC_TESTNET_DEPLOYER_KEY!],
    },
    bscmainnet: {
      chainId: 56,
      url: process.env.BSC_MAINNET_RPC_URL,
      accounts: [process.env.BSC_MAINNET_DEPLOYER_KEY!],
    },
  },
};

export default config;
