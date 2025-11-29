"use client";

import { useState, useEffect, useCallback } from "react";
import { getContract, watchContractEvents } from "thirdweb";
import { client } from "@/lib/thirdweb";
import { LIVE_ROOM_ABI, getContractAddress } from "@/lib/contracts";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";

/**
 * 打赏事件数据结构
 */
export interface TipEvent {
  roomId: bigint;
  tipper: string;
  streamer: string;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: number;
}

/**
 * 实时监听直播间打赏事件
 */
export function useLiveEvents(chainId: number, roomId?: number) {
  const [events, setEvents] = useState<TipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 添加新事件到列表（保持最新100条）
  const addEvent = useCallback((event: TipEvent) => {
    setEvents((prev) => {
      const newEvents = [event, ...prev];
      return newEvents.slice(0, 100); // 只保留最新100条
    });
  }, []);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
    const contractAddress = getContractAddress(chainId, "liveRoom");

    const contract = getContract({
      client,
      chain,
      address: contractAddress,
      abi: LIVE_ROOM_ABI,
    });

    // 先加载历史打赏，避免界面空白
    const fetchHistory = async () => {
      try {
        const { readContract } = await import("thirdweb");

        const method =
          roomId !== undefined
            ? "function getRoomTips(uint256,uint256) view returns ((uint256,address,uint256,uint256)[])"
            : "function getRecentTips(uint256) view returns ((uint256,address,uint256,uint256)[])";

          const params =
            roomId !== undefined ? [BigInt(roomId), 50n] : [50n];

        const result: any = await readContract({
          contract,
          method,
          params,
        });

        const history: TipEvent[] = Array.isArray(result)
          ? result.map((tip: any, idx: number) => ({
              roomId: BigInt(tip.roomId || tip[0] || 0),
              tipper: String(tip.tipper || tip[1] || ""),
              streamer: "",
              amount: BigInt(tip.amount || tip[2] || 0),
              timestamp: BigInt(tip.timestamp || tip[3] || 0),
              txHash: `history-${idx}`,
              blockNumber: 0,
            }))
          : [];

        setEvents(history.slice(0, 100));
        setLoading(false);
      } catch (err: any) {
        const message = String(err?.message || err);
        // RPC 返回 0x 会导致解码错误，直接视为无历史数据
        if (message.includes("Cannot decode zero data")) {
          setEvents([]);
          setError(null);
        } else {
          const errorMessage =
            err instanceof Error ? err.message : "Failed to fetch tip history";
          setError(errorMessage);
        }
        setLoading(false);
      }
    };

    fetchHistory();

    // 监听 Tipped 事件
    const unwatch = watchContractEvents({
      contract,
      onEvents: (eventLogs) => {
        eventLogs.forEach((log: any) => {
          if (log.eventName === "Tipped") {
            const args = log.args as any;
            const eventRoomId = args.roomId || args[0];
            const tipper = args.tipper || args[1];
            const streamer = args.streamer || args[2];
            const amount = args.amount || args[3];
            const timestamp = args.timestamp || args[4];

            // 如果指定了roomId，只监听该直播间的事件
            if (roomId !== undefined && Number(eventRoomId) !== roomId) {
              return;
            }

            const tipEvent: TipEvent = {
              roomId: BigInt(eventRoomId),
              tipper: String(tipper),
              streamer: String(streamer),
              amount: BigInt(amount),
              timestamp: BigInt(timestamp),
              txHash: log.transactionHash || "",
              blockNumber: Number(log.blockNumber || 0),
            };

            addEvent(tipEvent);
          }
        });
        setLoading(false);
      },
    });

    return () => {
      unwatch();
    };
  }, [chainId, roomId, addEvent]);

  return {
    events,
    loading,
    error,
    addEvent,
  };
}

/**
 * 获取历史打赏记录
 */
export function useHistoricalTips(chainId: number, roomId?: number, limit: number = 20) {
  const [tips, setTips] = useState<TipEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    try {
      setLoading(true);
      const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
      const contractAddress = getContractAddress(chainId, "liveRoom");

      const contract = getContract({
        client,
        chain,
        address: contractAddress,
        abi: LIVE_ROOM_ABI,
      });

      // 根据是否有roomId选择不同的查询方法
      const method = roomId !== undefined
        ? "function getRoomTips(uint256,uint256) view returns ((uint256,address,uint256,uint256)[])"
        : "function getRecentTips(uint256) view returns ((uint256,address,uint256,uint256)[])";

      const params = roomId !== undefined
        ? [BigInt(roomId), BigInt(limit)]
        : [BigInt(limit)];

      // 使用 readContract 读取历史记录
      const { readContract } = await import("thirdweb");
      const result: any = await readContract({
        contract,
        method,
        params: params as any,
      });

      // 转换数据格式
      const tipEvents: TipEvent[] = Array.isArray(result)
        ? result.map((tip: any) => ({
            roomId: BigInt(tip.roomId || tip[0] || 0),
            tipper: String(tip.tipper || tip[1] || ""),
            streamer: "", // 历史记录中没有streamer字段
            amount: BigInt(tip.amount || tip[2] || 0),
            timestamp: BigInt(tip.timestamp || tip[3] || 0),
            txHash: "",
            blockNumber: 0,
          }))
        : [];

      setTips(tipEvents);
      setError(null);
    } catch (err: any) {
      const message = String(err?.message || err);
      if (message.includes("Cannot decode zero data")) {
        // 合约未部署或无返回，视为空数据
        setTips([]);
        setError(null);
      } else {
        const errorMessage = err instanceof Error ? err.message : "Failed to fetch tips";
        setError(errorMessage);
        console.error("Fetch tips error:", err);
      }
    } finally {
      setLoading(false);
    }
  }, [chainId, roomId, limit]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return {
    tips,
    loading,
    error,
    refetch: fetchTips,
  };
}
