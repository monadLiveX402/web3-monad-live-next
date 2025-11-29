import deploymentInfo from "@/deployment-info";

/**
 * LiveRoom Contract ABI
 */
export const LIVE_ROOM_ABI = [
  "function createRoom(uint256 _schemeId) external returns (uint256)",
  "function tip(uint256 _roomId) external payable",
  "function tipMultiple(uint256 _roomId, uint256 _count) external payable",
  "function getRoom(uint256 _roomId) external view returns (address streamer, uint256 schemeId, bool active, uint256 createdAt, uint256 totalReceived, uint256 tipCount)",
  "function getStreamerRooms(address _streamer) external view returns (uint256[] memory)",
  "function getUserStats(address _user) external view returns (uint256 totalTipped, uint256 tipCount)",
  "function getRecentTips(uint256 _limit) external view returns (tuple(uint256 roomId, address tipper, uint256 amount, uint256 timestamp)[] memory)",
  "function getRoomTips(uint256 _roomId, uint256 _limit) external view returns (tuple(uint256 roomId, address tipper, uint256 amount, uint256 timestamp)[] memory)",
  "function getContractStats() external view returns (uint256 totalRooms, uint256 totalTips, uint256 totalVolume)",
  "event RoomCreated(uint256 indexed roomId, address indexed streamer, uint256 schemeId)",
  "event Tipped(uint256 indexed roomId, address indexed tipper, address indexed streamer, uint256 amount, uint256 timestamp)",
] as const;

/**
 * TipStream Contract ABI
 */
export const TIP_STREAM_ABI = [
  "function registerRoom(uint256 _roomId, uint256 _schemeId) external",
  "function startStream(uint256 _roomId, uint256 _ratePerSecond) external payable",
  "function stopStream() external",
  "function topUpStream() external payable",
  "function isStreamLowBalance(address _user) external view returns (bool, uint256)",
  "function getStream(address _user) external view returns (uint256 roomId, uint256 ratePerSecond, uint256 startTime, uint256 balance, bool active, uint256 currentAmount)",
  "function getStreamStats() external view returns (uint256 totalStreamAmount, uint256 activeStreamCount, uint256 totalStreams)",
  "function getRoomInfo(uint256 _roomId) external view returns (address streamer, uint256 schemeId, bool active)",
  "event RoomRegistered(uint256 indexed roomId, address indexed streamer, uint256 schemeId)",
  "event StreamStarted(address indexed tipper, uint256 indexed roomId, uint256 ratePerSecond, uint256 balance, uint256 timestamp)",
  "event StreamStopped(address indexed tipper, uint256 indexed roomId, uint256 duration, uint256 amount, uint256 timestamp)",
  "event StreamTopUp(address indexed tipper, uint256 amount, uint256 newBalance)",
] as const;

/**
 * RevenueShare402 Contract ABI
 */
export const REVENUE_SHARE_ABI = [
  "function createScheme(string memory _name, address[] memory _recipients, uint256[] memory _percentages) external returns (uint256)",
  "function getScheme(uint256 _schemeId) external view returns (string memory name, address[] memory recipients, uint256[] memory percentages, bool active, uint256 createdAt)",
  "function getSchemeCount() external view returns (uint256)",
  "function getStats() external view returns (uint256 totalDistributed, uint256 totalDistributions, uint256 schemeCount)",
  "event SchemeCreated(uint256 indexed schemeId, string name, address[] recipients, uint256[] percentages)",
  "event RevenueDistributed(uint256 indexed schemeId, address indexed payer, uint256 totalAmount, address[] recipients, uint256[] amounts)",
] as const;

/**
 * Contract addresses configuration
 */
type DeploymentInfo = {
  monad: {
    liveRoom: string;
    tipStream: string;
  };
  sepolia: {
    liveRoom: string;
    tipStream: string;
  };
};

const deployments = deploymentInfo as DeploymentInfo;

export const CONTRACTS = {
  monad: {
    liveRoom:
      process.env.NEXT_PUBLIC_LIVE_ROOM_ADDRESS ||
      deployments.monad?.liveRoom ||
      "",
    tipStream:
      process.env.NEXT_PUBLIC_TIP_STREAM_ADDRESS ||
      deployments.monad?.tipStream ||
      "",
  },
  ethereum: {
    // For comparison, you would deploy the same contracts on Ethereum Sepolia
    liveRoom:
      process.env.NEXT_PUBLIC_ETH_LIVE_ROOM_ADDRESS ||
      deployments.sepolia?.liveRoom ||
      "",
    tipStream:
      process.env.NEXT_PUBLIC_ETH_TIP_STREAM_ADDRESS ||
      deployments.sepolia?.tipStream ||
      "",
  },
} as const;

/**
 * Get contract address for current chain
 */
export function getContractAddress(
  chainId: number,
  contract: "liveRoom" | "tipStream"
): string {
  if (chainId === 10143) {
    const address = CONTRACTS.monad[contract];
    if (!address) {
      throw new Error("Missing Monad contract address configuration");
    }
    return address;
  } else if (chainId === 11155111) {
    const address = CONTRACTS.ethereum[contract];
    if (!address) {
      throw new Error("Missing Sepolia contract address configuration");
    }
    return address;
  }
  throw new Error(`Unsupported chain ID: ${chainId}`);
}
