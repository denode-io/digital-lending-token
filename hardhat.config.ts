import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";

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
    localhost: {
      chainId: 1337,
    },
    bsctestnet: {
      chainId: 97,
      url: process.env.BSC_TESTNET_RPC_URL,
      accounts: [process.env.BSC_TESTNET_PRIVATE_KEY!],
    },
    // bscmainnet: {
    //   chainId: 56,
    //   url: process.env.BSC_MAINNET_RPC_URL,
    //   accounts: [process.env.BSC_MAINNET_PRIVATE_KEY!],
    // },
  },
};

export default config;
