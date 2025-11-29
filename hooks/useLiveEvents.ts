'use client'

import { useState, useEffect, useRef } from 'react'
import { useUnifiedTipping, ContractStats } from './useLiveRoom'
import { parseEther } from 'viem'

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
 * 生成默认的模拟打赏数据
 */
function generateMockTipEvents(): TipEvent[] {
  const now = Math.floor(Date.now() / 1000)
  const mockEvents: TipEvent[] = []

  for (let i = 0; i < 10; i++) {
    // 生成0.001到0.002之间的随机金额
    const randomAmount = (Math.random() * 0.001 + 0.001).toFixed(6)
    // 随机选择类型
    const type = Math.random() > 0.5 ? 'instant' : 'stream'
    // 时间戳递减，让新的在前面
    const timestamp = now - i * 60 // 每条相隔60秒
    // 生成随机地址
    const randomAddress = `0x${Math.random().toString(16).substring(2, 42).padEnd(40, '0')}`

    mockEvents.push({
      amount: parseEther(randomAmount),
      timestamp: BigInt(timestamp),
      type,
      tipper: randomAddress
    })
  }

  return mockEvents
}

/**
 * 基于合约统计数据变化生成打赏事件流
 * 这样可以确保数据来源统一，避免事件监听失败的问题
 */
export function useLiveEvents(chainId: number) {
  const { contractStats, loading } = useUnifiedTipping(chainId)
  const [events, setEvents] = useState<TipEvent[]>(generateMockTipEvents())
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
