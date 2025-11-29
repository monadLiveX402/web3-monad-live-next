import deploymentInfo from "@/deployment-info";

/**
 * UnifiedTipping Contract ABI
 * 支持一次性打赏 + 流式打赏
 */
export const UNIFIED_TIPPING_ABI = [
  "function tip() external payable",
  "function startStream(uint256 _ratePerSecond) external payable",
  "function stopStream() external",
  "function topUpStream() external payable",
  "function isStreamLowBalance(address _user) external view returns (bool, uint256)",
  "function getStream(address _user) external view returns (uint256 ratePerSecond, uint256 startTime, uint256 balance, bool active, uint256 currentAmount)",
  "function getStats() external view returns (uint256 _instantVolume, uint256 _streamVolume, uint256 _activeStreams)",
  "event InstantTipped(address indexed tipper, uint256 amount, uint256 platformShare, uint256 contractShare, uint256 timestamp)",
  "event StreamStarted(address indexed tipper, uint256 ratePerSecond, uint256 balance, uint256 timestamp)",
  "event StreamTopUp(address indexed tipper, uint256 amount, uint256 newBalance)",
  "event StreamStopped(address indexed tipper, uint256 duration, uint256 amountUsed, uint256 platformShare, uint256 contractShare, uint256 refund, uint256 timestamp)",
] as const;

type DeploymentInfo = {
  monad: {
    unifiedTipping: string;
  };
  sepolia: {
    unifiedTipping: string;
  };
};

const deployments = deploymentInfo as DeploymentInfo;

export const CONTRACTS = {
  monad: {
    unifiedTipping:
      process.env.NEXT_PUBLIC_UNIFIED_TIPPING_ADDRESS ||
      deployments.monad?.unifiedTipping ||
      "",
  },
  ethereum: {
    unifiedTipping:
      process.env.NEXT_PUBLIC_ETH_UNIFIED_TIPPING_ADDRESS ||
      deployments.sepolia?.unifiedTipping ||
      "",
  },
} as const;

/**
 * Get UnifiedTipping contract address for current chain
 */
export function getContractAddress(chainId: number): string {
  if (chainId === 10143) {
    const address = CONTRACTS.monad.unifiedTipping;
    if (!address) {
      throw new Error("Missing Monad contract address configuration");
    }
    return address;
  } else if (chainId === 11155111) {
    const address = CONTRACTS.ethereum.unifiedTipping;
    if (!address) {
      throw new Error("Missing Sepolia contract address configuration");
    }
    return address;
  }
  throw new Error(`Unsupported chain ID: ${chainId}`);
}
