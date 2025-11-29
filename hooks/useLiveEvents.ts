"use client";

import { useState, useEffect, useCallback } from "react";
import { getContract, watchContractEvents, getContractEvents } from "thirdweb";
import { client } from "@/lib/thirdweb";
import { UNIFIED_TIPPING_ABI, getContractAddress } from "@/lib/contracts";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";

/**
 * 打赏事件数据结构
 */
export interface TipEvent {
  tipper: string;
  amount: bigint;
  timestamp: bigint;
  txHash: string;
  blockNumber: number;
  mode: "instant" | "stream";
}

/**
 * 实时监听直播间打赏事件
 */
export function useLiveEvents(chainId: number) {
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

    try {
      const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
      const contractAddress = getContractAddress(chainId);

      const contract = getContract({
        client,
        chain,
        address: contractAddress,
        abi: UNIFIED_TIPPING_ABI,
      });

      // 读取历史事件（最近 N 区块）
      const fetchHistory = async () => {
        try {
          const fromBlock = 0n; // UnifiedTipping 单合约，直接拉全量
          const history = await getContractEvents({
            contract,
            events: [
              { eventName: "InstantTipped" },
              { eventName: "StreamStopped" },
              { eventName: "StreamStarted" },
            ],
            fromBlock,
          });

          const mapped: TipEvent[] = history
            .map((log: any) => {
              const args = log.args || {};
              if (log.eventName === "InstantTipped") {
                return {
                  mode: "instant",
                  tipper: String(args.tipper || ""),
                  amount: BigInt(args.amount || 0),
                  timestamp: BigInt(args.timestamp || 0),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                } as TipEvent;
              }
              if (log.eventName === "StreamStopped") {
                return {
                  mode: "stream",
                  tipper: String(args.tipper || ""),
                  amount: BigInt(args.amountUsed || 0),
                  timestamp: BigInt(args.timestamp || 0),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                } as TipEvent;
              }
              if (log.eventName === "StreamStarted") {
                return {
                  mode: "stream",
                  tipper: String(args.tipper || ""),
                  amount: BigInt(args.balance || 0),
                  timestamp: BigInt(args.timestamp || 0),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                } as TipEvent;
              }
              return null;
            })
            .filter(Boolean) as TipEvent[];

          if (mapped.length > 0) {
            setEvents((prev) => {
              const merged = [...mapped.reverse(), ...prev];
              return merged.slice(0, 100);
            });
          }
        } catch (e) {
          console.warn("历史事件读取失败，继续监听实时事件", e);
        }
      };

      fetchHistory();

      // 监听事件
      const unwatch = watchContractEvents({
        contract,
        onEvents: (eventLogs) => {
          eventLogs.forEach((log: any) => {
            const args = log.args as any;

            if (log.eventName === "InstantTipped") {
              addEvent({
                mode: "instant",
                tipper: String(args.tipper || args[0] || ""),
                amount: BigInt(args.amount || args[1] || 0),
                timestamp: BigInt(args.timestamp || args[4] || 0),
                txHash: log.transactionHash || "",
                blockNumber: Number(log.blockNumber || 0),
              });
            } else if (log.eventName === "StreamStopped") {
              addEvent({
                mode: "stream",
                tipper: String(args.tipper || args[0] || ""),
                amount: BigInt(args.amountUsed || args[3] || 0),
                timestamp: BigInt(args.timestamp || args[6] || 0),
                txHash: log.transactionHash || "",
                blockNumber: Number(log.blockNumber || 0),
              });
            } else if (log.eventName === "StreamStarted") {
              addEvent({
                mode: "stream",
                tipper: String(args.tipper || args[0] || ""),
                amount: BigInt(args.balance || args[2] || 0),
                timestamp: BigInt(args.timestamp || args[3] || 0),
                txHash: log.transactionHash || "",
                blockNumber: Number(log.blockNumber || 0),
              });
            }
          });
          setLoading(false);
        },
      });

      // 监听已建立，防止界面长期停留在“连接中”
      setLoading(false);

      return () => {
        unwatch();
      };
    } catch (err: any) {
      setError(err?.message || "无法监听合约事件，请检查地址配置");
      setLoading(false);
      return () => {};
    }
  }, [chainId, addEvent]);

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
export function useHistoricalTips() {
  return {
    tips: [] as TipEvent[],
    loading: false,
    error: "UnifiedTipping 合约未提供历史查询接口，需依赖实时事件或后端索引",
    refetch: async () => [],
  };
}
