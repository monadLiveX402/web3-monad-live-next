"use client";

import { useLiveEvents } from "@/hooks/useLiveEvents";
import { formatEther } from "viem";

interface TipEventStreamProps {
  chainId: number;
}

/**
 * 打赏事件流组件 - 轻量级版本
 * 只展示最新50条打赏记录
 */
export function TipEventStream({ chainId }: TipEventStreamProps) {
  const { events, isListening } = useLiveEvents(chainId);
  const currency = chainId === 10143 ? "MON" : "ETH";

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-600">实时打赏</h3>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              isListening ? "bg-green-500 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-xs text-gray-500">
            {isListening ? "监听中" : "未连接"}
          </span>
        </div>
      </div>

      <div className="h-[400px] overflow-y-auto rounded-lg bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        {events.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">等待打赏中...</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event, index) => (
              <div
                key={`${event.timestamp}-${index}`}
                className="rounded-lg bg-white/90 p-3 shadow-sm backdrop-blur-sm transition-all hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">💰</span>
                    <p className="text-sm font-medium text-gray-700">
                      大佬打赏了
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                      {formatEther(event.amount)} {currency}
                    </p>
                    <p className="text-xs text-gray-400">
                      {new Date(Number(event.timestamp) * 1000).toLocaleTimeString("zh-CN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部统计 */}
      {events.length > 0 && (
        <div className="rounded-lg bg-white/90 p-3 text-center">
          <p className="text-xs text-gray-500">
            已收到 <span className="font-bold text-purple-600">{events.length}</span> 次打赏
          </p>
        </div>
      )}
    </div>
  );
}
