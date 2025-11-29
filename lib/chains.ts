import { defineChain } from "thirdweb";

const MONAD_RPC =
  process.env.NEXT_PUBLIC_MONAD_RPC_URL ||
  process.env.MONAD_RPC_URL ||
  "https://testnet-rpc.monad.xyz";

const SEPOLIA_RPC =
  process.env.NEXT_PUBLIC_ETH_SEPOLIA_RPC_URL ||
  process.env.ETH_SEPOLIA_RPC_URL ||
  "https://eth-sepolia.g.alchemy.com/v2/demo";

/**
 * Monad Testnet Configuration
 */
export const monadTestnet = defineChain({
  id: 10143,
  name: "Monad Testnet",
  rpc: MONAD_RPC,
  nativeCurrency: {
    name: "Monad",
    symbol: "MON",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Monad Explorer",
      url: "https://testnet.monadexplorer.com",
      apiUrl: "https://testnet.monadexplorer.com/api",
    },
  ],
  testnet: true,
});

/**
 * Ethereum Sepolia for comparison
 */
export const ethereumSepolia = defineChain({
  id: 11155111,
  name: "Ethereum Sepolia",
  rpc: SEPOLIA_RPC,
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorers: [
    {
      name: "Etherscan",
      url: "https://sepolia.etherscan.io",
      apiUrl: "https://api-sepolia.etherscan.io/api",
    },
  ],
  testnet: true,
});

/**
 * Chain information type
 */
export type ChainInfo = {
  id: number;
  name: string;
  symbol: string;
  rpc: string;
  explorer: string;
  chain: ReturnType<typeof defineChain>;
};

/**
 * Available chains for the application
 */
export const CHAINS: Record<string, ChainInfo> = {
  monad: {
    id: 10143,
    name: "Monad Testnet",
    symbol: "MON",
    rpc: MONAD_RPC,
    explorer: "https://testnet.monadexplorer.com",
    chain: monadTestnet,
  },
  ethereum: {
    id: 11155111,
    name: "Ethereum Sepolia",
    symbol: "ETH",
    rpc: SEPOLIA_RPC,
    explorer: "https://sepolia.etherscan.io",
    chain: ethereumSepolia,
  },
};

/**
 * Default chain
 */
export const DEFAULT_CHAIN = CHAINS.monad;
