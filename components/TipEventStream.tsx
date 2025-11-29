"use client";

import { useLiveEvents } from "@/hooks/useLiveEvents";
import { formatEther } from "viem";
import { motion, AnimatePresence } from "framer-motion";

interface TipEventStreamProps {
  chainId: number;
  roomId?: number;
  maxDisplay?: number;
}

/**
 * 打赏事件序列实时展示组件
 * 用于显示实时飞屏动画效果
 */
export function TipEventStream({
  chainId,
  roomId,
  maxDisplay = 10,
}: TipEventStreamProps) {
  const { events, loading, error } = useLiveEvents(chainId, roomId);

  // 只显示最近的几条
  const displayEvents = events.slice(0, maxDisplay);

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-600">
        <p className="text-sm">事件监听失败: {error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg bg-gray-50 p-4">
        <p className="text-sm text-gray-500">正在连接实时事件流...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">实时打赏</h3>
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 animate-pulse rounded-full bg-green-500" />
          <span className="text-xs text-gray-500">实时更新中</span>
        </div>
      </div>

      <div className="relative h-[400px] overflow-hidden rounded-lg bg-gradient-to-b from-purple-50 to-pink-50 p-4">
        <AnimatePresence mode="popLayout">
          {displayEvents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex h-full items-center justify-center"
            >
              <p className="text-sm text-gray-400">等待打赏...</p>
            </motion.div>
          ) : (
            <div className="space-y-2">
              {displayEvents.map((event, index) => (
                <motion.div
                  key={`${event.txHash}-${index}`}
                  initial={{ x: 300, opacity: 0, scale: 0.8 }}
                  animate={{ x: 0, opacity: 1, scale: 1 }}
                  exit={{ x: -300, opacity: 0, scale: 0.8 }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                  className="rounded-lg bg-white/80 p-3 shadow-md backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {/* 用户头像 */}
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                        {event.tipper.slice(2, 4).toUpperCase()}
                      </div>

                      {/* 用户信息 */}
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {event.tipper.slice(0, 6)}...{event.tipper.slice(-4)}
                        </p>
                        <p className="text-xs text-gray-500">
                          打赏了直播间 #{Number(event.roomId)}
                        </p>
                      </div>
                    </div>

                    {/* 金额显示 */}
                    <div className="text-right">
                      <p className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        {formatEther(event.amount)} MON
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(Number(event.timestamp) * 1000).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  {/* 特效：大额打赏 */}
                  {Number(formatEther(event.amount)) >= 1 && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 rounded-lg bg-gradient-to-r from-yellow-400/20 to-orange-400/20 pointer-events-none"
                    />
                  )}
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* 统计信息 */}
        {events.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute bottom-4 left-4 right-4 rounded-lg bg-white/90 p-3 shadow-lg backdrop-blur-sm"
          >
            <div className="flex justify-around text-center">
              <div>
                <p className="text-2xl font-bold text-purple-600">{events.length}</p>
                <p className="text-xs text-gray-500">总打赏次数</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-pink-600">
                  {formatEther(
                    events.reduce((sum, e) => sum + e.amount, 0n)
                  )}
                </p>
                <p className="text-xs text-gray-500">总金额 (MON)</p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
