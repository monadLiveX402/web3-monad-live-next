'use client'

import { useLiveEvents } from '@/hooks/useLiveEvents'
import { formatEther } from 'viem'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface TipLeaderboardProps {
  chainId: number
  limit?: number
}

interface TipperStats {
  address: string
  totalAmount: bigint
  tipCount: number
  lastTipTime: bigint
}

/**
 * 支付礼上见直播区榜单组件
 * 展示打赏排行榜和统计数据
 */
export function TipLeaderboard({ chainId, limit = 50 }: TipLeaderboardProps) {
  // 仅使用实时事件（合约无历史查询接口）
  const { events: liveEvents, isListening } = useLiveEvents(chainId)
  const loadingEvents = !isListening && liveEvents.length === 0
  const currency = chainId === 10143 ? 'MON' : 'ETH'

  // 合并历史数据和实时数据，并计算排行榜
  const leaderboard = useMemo(() => {
    const allTips = liveEvents.slice(0, limit)
    const statsMap = new Map<string, TipperStats>()

    // 聚合每个用户的打赏数据
    allTips.forEach((tip) => {
      const existing = statsMap.get(tip.tipper)
      if (existing) {
        existing.totalAmount += tip.amount
        existing.tipCount += 1
        if (tip.timestamp > existing.lastTipTime) {
          existing.lastTipTime = tip.timestamp
        }
      } else {
        statsMap.set(tip.tipper, {
          address: tip.tipper,
          totalAmount: tip.amount,
          tipCount: 1,
          lastTipTime: tip.timestamp
        })
      }
    })

    // 转换为数组并按总金额排序
    return Array.from(statsMap.values())
      .sort((a, b) => {
        const diff = Number(b.totalAmount - a.totalAmount)
        if (diff !== 0) return diff
        return Number(b.lastTipTime - a.lastTipTime)
      })
      .slice(0, 10) // 只显示前10名
  }, [liveEvents, limit])

  // 计算总统计
  const totalStats = useMemo(() => {
    const total = leaderboard.reduce(
      (acc, user) => ({
        amount: acc.amount + user.totalAmount,
        count: acc.count + user.tipCount
      }),
      { amount: 0n, count: 0 }
    )
    return total
  }, [leaderboard])

  if (loadingEvents) {
    return (
      <div className="rounded-lg bg-gray-50 p-8 text-center">
        <div className="animate-spin h-8 w-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-sm text-gray-500">加载榜单数据...</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 标题和总统计 */}
      <div className="rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">打赏排行榜 🏆</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">总打赏金额</p>
            <p className="text-2xl font-bold">
              {formatEther(totalStats.amount)} {currency}
            </p>
          </div>
          <div className="rounded-lg bg-white/20 p-4 backdrop-blur-sm">
            <p className="text-sm opacity-90">总打赏次数</p>
            <p className="text-2xl font-bold">{totalStats.count}</p>
          </div>
        </div>
      </div>

      {/* 排行榜列表 */}
      <div className="space-y-2">
        {leaderboard.length === 0 ? (
          <div className="rounded-lg bg-gray-50 p-8 text-center">
            <p className="text-gray-400">暂无打赏记录</p>
          </div>
        ) : (
          leaderboard.map((user, index) => (
            <motion.div
              key={user.address}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg bg-white p-4 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between">
                {/* 排名和用户信息 */}
                <div className="flex items-center gap-4">
                  {/* 排名徽章 */}
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full text-white font-bold text-lg ${
                      index === 0
                        ? 'bg-gradient-to-br from-yellow-400 to-yellow-600'
                        : index === 1
                        ? 'bg-gradient-to-br from-gray-300 to-gray-500'
                        : index === 2
                        ? 'bg-gradient-to-br from-orange-400 to-orange-600'
                        : 'bg-gradient-to-br from-purple-400 to-purple-600'
                    }`}
                  >
                    {index === 0
                      ? '🥇'
                      : index === 1
                      ? '🥈'
                      : index === 2
                      ? '🥉'
                      : index + 1}
                  </div>

                  {/* 用户地址 */}
                  <div>
                    <p className="font-mono text-sm font-medium text-gray-900">
                      {user.address.slice(0, 8)}...{user.address.slice(-6)}
                    </p>
                    <p className="text-xs text-gray-500">
                      打赏 {user.tipCount} 次
                    </p>
                  </div>
                </div>

                {/* 金额显示 */}
                <div className="text-right">
                  <p className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                    {formatEther(user.totalAmount)}
                  </p>
                  <p className="text-xs text-gray-400">{currency}</p>
                </div>
              </div>

              {/* 进度条 */}
              <div className="mt-3 h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{
                    width: `${
                      leaderboard[0]
                        ? (Number(user.totalAmount) /
                            Number(leaderboard[0].totalAmount)) *
                          100
                        : 0
                    }%`
                  }}
                  transition={{ duration: 0.5, delay: index * 0.05 }}
                  className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                />
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* 最后更新时间 */}
      <div className="text-center text-xs text-gray-400">
        <p>数据实时更新 • 最后更新: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  )
}
