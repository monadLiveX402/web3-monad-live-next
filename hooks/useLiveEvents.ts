'use client'

import { useState, useEffect, useRef } from 'react'
import { useUnifiedTipping, ContractStats } from './useLiveRoom'

/**
 * 打赏事件数据结构
 */
export interface TipEvent {
  amount: bigint
  timestamp: bigint
  type: 'instant' | 'stream'
  tipper: string
}

/**
 * 基于合约统计数据变化生成打赏事件流
 * 这样可以确保数据来源统一，避免事件监听失败的问题
 */
export function useLiveEvents(chainId: number) {
  const { contractStats, loading } = useUnifiedTipping(chainId)
  const [events, setEvents] = useState<TipEvent[]>([])
  const prevStatsRef = useRef<ContractStats | null>(null)

  useEffect(() => {
    if (!contractStats || loading) return

    const prevStats = prevStatsRef.current

    // 首次加载，不生成事件
    if (!prevStats) {
      prevStatsRef.current = contractStats
      return
    }

    const now = BigInt(Math.floor(Date.now() / 1000))

    // 检测即时打赏变化
    if (contractStats.instantVolume > prevStats.instantVolume) {
      const diff = contractStats.instantVolume - prevStats.instantVolume
      const newEvent: TipEvent = {
        amount: diff,
        timestamp: now,
        type: 'instant',
        tipper: '0x0000000000000000000000000000000000000000'
      }
      setEvents((prev) => [newEvent, ...prev].slice(0, 50))
    }

    // 检测流式打赏变化
    if (contractStats.streamVolume > prevStats.streamVolume) {
      const diff = contractStats.streamVolume - prevStats.streamVolume
      const newEvent: TipEvent = {
        amount: diff,
        timestamp: now,
        type: 'stream',
        tipper: '0x0000000000000000000000000000000000000000'
      }
      setEvents((prev) => [newEvent, ...prev].slice(0, 50))
    }

    // 更新上一次的统计数据
    prevStatsRef.current = contractStats
  }, [contractStats, loading])

  return {
    events,
    isListening: !loading
  }
}
