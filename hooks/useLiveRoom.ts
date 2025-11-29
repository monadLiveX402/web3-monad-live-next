"use client";

import { useState, useEffect, useCallback } from "react";
import { getContract, readContract } from "thirdweb";
import { client } from "@/lib/thirdweb";
import { LIVE_ROOM_ABI, getContractAddress } from "@/lib/contracts";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";

/**
 * 直播间信息
 */
export interface RoomInfo {
  roomId: number;
  streamer: string;
  schemeId: bigint;
  active: boolean;
  createdAt: bigint;
  totalReceived: bigint;
  tipCount: bigint;
}

/**
 * 合约统计信息
 */
export interface ContractStats {
  totalRooms: bigint;
  totalTips: bigint;
  totalVolume: bigint;
}

/**
 * 用户统计信息
 */
export interface UserStats {
  totalTipped: bigint;
  tipCount: bigint;
}

/**
 * 直播间综合数据 Hook
 * 提供直播间信息、统计数据等功能
 */
export function useLiveRoom(chainId: number, roomId?: number) {
  const [roomInfo, setRoomInfo] = useState<RoomInfo | null>(null);
  const [contractStats, setContractStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取合约实例
  const getContractInstance = useCallback(() => {
    const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
    const contractAddress = getContractAddress(chainId, "liveRoom");
    if (!contractAddress) {
      throw new Error("Missing liveRoom contract address for current chain");
    }

    return getContract({
      client,
      chain,
      address: contractAddress,
      abi: LIVE_ROOM_ABI,
    });
  }, [chainId]);

  // 获取直播间信息
  const fetchRoomInfo = useCallback(async () => {
    if (!roomId) return;

    try {
      const contract = getContractInstance();

      const result = await readContract({
        contract,
        method: "function getRoom(uint256 _roomId) external view returns (address streamer, uint256 schemeId, bool active, uint256 createdAt, uint256 totalReceived, uint256 tipCount)",
        params: [BigInt(roomId)],
      });

      setRoomInfo({
        roomId,
        streamer: result[0],
        schemeId: result[1],
        active: result[2],
        createdAt: result[3],
        totalReceived: result[4],
        tipCount: result[5],
      });
    } catch (err) {
      console.error("Failed to fetch room info:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch room info");
    }
  }, [roomId, getContractInstance]);

  // 获取合约统计
  const fetchContractStats = useCallback(async () => {
    try {
      const contract = getContractInstance();

      const result = await readContract({
        contract,
        method: "function getContractStats() external view returns (uint256 totalRooms, uint256 totalTips, uint256 totalVolume)",
        params: [],
      });

      setContractStats({
        totalRooms: result[0],
        totalTips: result[1],
        totalVolume: result[2],
      });
      setError(null);
    } catch (err: any) {
      const message = String(err?.message || err);
      if (message.includes("Cannot decode zero data")) {
        // 合约地址无效或未部署，返回空数据并提示
        setContractStats(null);
        setError("未能读取合约统计：可能合约地址未配置或未部署");
      } else {
        console.error("Failed to fetch contract stats:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch contract stats");
      }
    }
  }, [getContractInstance]);

  // 获取用户统计
  const getUserStats = useCallback(
    async (userAddress: string): Promise<UserStats | null> => {
      try {
        const contract = getContractInstance();

        const result = await readContract({
          contract,
          method: "function getUserStats(address _user) external view returns (uint256 totalTipped, uint256 tipCount)",
          params: [userAddress],
        });

        return {
          totalTipped: result[0],
          tipCount: result[1],
        };
      } catch (err) {
        console.error("Failed to fetch user stats:", err);
        return null;
      }
    },
    [getContractInstance]
  );

  // 获取主播的所有直播间
  const getStreamerRooms = useCallback(
    async (streamerAddress: string): Promise<number[]> => {
      try {
        const contract = getContractInstance();

        const result = await readContract({
          contract,
          method: "function getStreamerRooms(address _streamer) external view returns (uint256[] memory)",
          params: [streamerAddress],
        });

        return (result as bigint[]).map((id) => Number(id));
      } catch (err) {
        console.error("Failed to fetch streamer rooms:", err);
        return [];
      }
    },
    [getContractInstance]
  );

  // 刷新所有数据
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        fetchRoomInfo(),
        fetchContractStats(),
      ]);
    } catch (err) {
      console.error("Failed to refresh data:", err);
      if (err instanceof Error && err.message.includes("Missing liveRoom contract address")) {
        setError("当前链缺少 LiveRoom 合约地址，请检查配置");
      } else {
        setError(err instanceof Error ? err.message : "Failed to refresh data");
      }
    } finally {
      setLoading(false);
    }
  }, [fetchRoomInfo, fetchContractStats]);

  // 初始加载
  useEffect(() => {
    refresh();
  }, [refresh]);

  // 定期刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      refresh();
    }, 30000);

    return () => clearInterval(interval);
  }, [refresh]);

  return {
    roomInfo,
    contractStats,
    loading,
    error,
    refresh,
    getUserStats,
    getStreamerRooms,
  };
}
