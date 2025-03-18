require("@nomicfoundation/hardhat-ethers");
require("dotenv").config();
require("@nomicfoundation/hardhat-verify");

const PRIVATE_KEY = process.env.PRIVATE_KEY;
const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL;
const ARBITRUM_SEPOLIA_RPC_URL = process.env.ARBITRUM_SEPOLIA_RPC_URL;

if (!PRIVATE_KEY || !SEPOLIA_RPC_URL) {
  throw new Error(
    "Please set your PRIVATE_KEY and SEPOLIA_RPC_URL in a .env file"
  );
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 1337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111,
    },
    arbitrumSepolia: {
      url: ARBITRUM_SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 421614,
    },
    "edu-chain-testnet": {
      url: `https://rpc.open-campus-codex.gelato.digital`,
      accounts: [PRIVATE_KEY],
      chainId: 656476,
    },
    // Keep the opencampus config if it already exists
    opencampus: {
      url: `https://rpc.open-campus-codex.gelato.digital`,
      accounts: [PRIVATE_KEY],
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
etherscan: {
  apiKey: {
    "edu-chain-testnet": "NHDYMWKRJ3BDB51FKZR15ZY9JH4K9AKEIR"
  },
  customChains: [
    {
      network: "edu-chain-testnet",
      chainId: 656476,
      urls: {
        apiURL: "https://edu-chain-testnet.blockscout.com/api",
        browserURL: "https://edu-chain-testnet.blockscout.com"
      }
    }
  ]
},
};