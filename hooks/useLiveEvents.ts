"use client";

import { useState, useEffect, useRef } from "react";
import { getContract, watchContractEvents } from "thirdweb";
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

// 生成模拟数据用于测试和初始展示
function generateMockEvents(): TipEvent[] {
  const now = Math.floor(Date.now() / 1000);
  const mockAddresses = [
    "0x1234567890123456789012345678901234567890",
    "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "0x9876543210987654321098765432109876543210",
    "0xfedcbafedcbafedcbafedcbafedcbafedcbafedc",
    "0x1111222233334444555566667777888899990000",
  ];

  return Array.from({ length: 5 }, (_, i) => ({
    tipper: mockAddresses[i % mockAddresses.length],
    amount: BigInt(Math.floor(Math.random() * 5000000000000000000)), // 0-5 ETH
    timestamp: BigInt(now - i * 120), // 每条相隔2分钟
    txHash: `0x${Math.random().toString(16).slice(2)}${Math.random().toString(16).slice(2)}`,
    blockNumber: 1000000 + i,
    mode: i % 2 === 0 ? "instant" : "stream",
  } as TipEvent));
}

/**
 * 实时监听直播间打赏事件
 */
export function useLiveEvents(chainId: number) {
  const [events, setEvents] = useState<TipEvent[]>(() => generateMockEvents());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const unwatchRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    // 清理上一次的监听
    if (unwatchRef.current) {
      unwatchRef.current();
      unwatchRef.current = null;
    }

    setLoading(true);
    setError(null);

    let mounted = true;

    const setupListener = async () => {
      try {
        const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
        const contractAddress = getContractAddress(chainId);

        const contract = getContract({
          client,
          chain,
          address: contractAddress,
          abi: UNIFIED_TIPPING_ABI as any,
        });

        // 监听实时事件
        const unwatch = watchContractEvents({
          contract,
          onEvents: (eventLogs) => {
            if (!mounted) return;

            eventLogs.forEach((log: any) => {
              const args = log.args as any;
              let newEvent: TipEvent | null = null;

              if (log.eventName === "InstantTipped") {
                newEvent = {
                  mode: "instant",
                  tipper: String(args.tipper || args[0] || ""),
                  amount: BigInt(args.amount || args[1] || 0),
                  timestamp: BigInt(args.timestamp || args[4] || Math.floor(Date.now() / 1000)),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                };
              } else if (log.eventName === "StreamStopped") {
                newEvent = {
                  mode: "stream",
                  tipper: String(args.tipper || args[0] || ""),
                  amount: BigInt(args.amountUsed || args[3] || 0),
                  timestamp: BigInt(args.timestamp || args[6] || Math.floor(Date.now() / 1000)),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                };
              } else if (log.eventName === "StreamStarted") {
                newEvent = {
                  mode: "stream",
                  tipper: String(args.tipper || args[0] || ""),
                  amount: BigInt(args.balance || args[2] || 0),
                  timestamp: BigInt(args.timestamp || args[3] || Math.floor(Date.now() / 1000)),
                  txHash: log.transactionHash || "",
                  blockNumber: Number(log.blockNumber || 0),
                };
              }

              if (newEvent && newEvent.amount > 0n) {
                setEvents((prev) => {
                  // 去重检查
                  const exists = prev.some(
                    (e) =>
                      e.txHash === newEvent!.txHash &&
                      e.blockNumber === newEvent!.blockNumber &&
                      e.amount === newEvent!.amount
                  );
                  if (exists) return prev;

                  // 添加到列表顶部，保留最新100条
                  return [newEvent!, ...prev].slice(0, 100);
                });
              }
            });
          },
        });

        unwatchRef.current = unwatch;

        if (mounted) {
          setLoading(false);
        }
      } catch (err: any) {
        console.error("事件监听设置失败:", err);
        if (mounted) {
          setError(err?.message || "无法监听合约事件");
          setLoading(false);
        }
      }
    };

    setupListener();

    return () => {
      mounted = false;
      if (unwatchRef.current) {
        unwatchRef.current();
        unwatchRef.current = null;
      }
    };
  }, [chainId]);

  return {
    events,
    loading,
    error,
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
