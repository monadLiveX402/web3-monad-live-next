'use client'

import { useState, useEffect, useCallback } from 'react'
import { getContract, readContract } from 'thirdweb'
import { client } from '@/lib/thirdweb'
import { UNIFIED_TIPPING_ABI, getContractAddress } from '@/lib/contracts'
import { monadTestnet, ethereumSepolia } from '@/lib/chains'

/**
 * 合约统计信息
 */
export interface ContractStats {
  instantVolume: bigint
  streamVolume: bigint
  activeStreams: bigint
  totalVolume: bigint
}

/**
 * UnifiedTipping 合约数据 Hook
 */
export function useUnifiedTipping(chainId: number) {
  const [contractStats, setContractStats] = useState<ContractStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 获取合约实例
  const getContractInstance = useCallback(() => {
    const chain = chainId === 10143 ? monadTestnet : ethereumSepolia
    const contractAddress = getContractAddress(chainId)
    if (!contractAddress) {
      throw new Error(
        'Missing unifiedTipping contract address for current chain'
      )
    }

    return getContract({
      client,
      chain,
      address: contractAddress,
      abi: UNIFIED_TIPPING_ABI
    })
  }, [chainId])

  // 获取合约统计
  const fetchContractStats = useCallback(async () => {
    try {
      const contract = getContractInstance()

      const result = await readContract({
        contract,
        method: 'getStats',
        params: []
      })

      const [instantVolume, streamVolume, activeStreams] = result as [
        bigint,
        bigint,
        bigint
      ]

      setContractStats({
        instantVolume,
        streamVolume,
        activeStreams,
        totalVolume: instantVolume + streamVolume
      })
      setError(null)
    } catch (err: any) {
      const message = String(err?.message || err)
      if (message.includes('Cannot decode zero data')) {
        // 合约地址无效或未部署，返回空数据并提示
        setContractStats(null)
        setError('未能读取合约统计：可能合约地址未配置或未部署')
      } else {
        console.error('Failed to fetch contract stats:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch contract stats'
        )
      }
    }
  }, [getContractInstance])

  // 刷新所有数据
  const refresh = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      await Promise.all([fetchContractStats()])
    } catch (err) {
      console.error('Failed to refresh data:', err)
      if (
        err instanceof Error &&
        err.message.includes('Missing unifiedTipping contract address')
      ) {
        setError('当前链缺少 UnifiedTipping 合约地址，请检查配置')
      } else {
        setError(err instanceof Error ? err.message : 'Failed to refresh data')
      }
    } finally {
      setLoading(false)
    }
  }, [fetchContractStats])

  // 初始加载
  useEffect(() => {
    refresh()
  }, [refresh])

  // 定期刷新（每30秒）
  useEffect(() => {
    const interval = setInterval(() => {
      refresh()
    }, 30000)

    return () => clearInterval(interval)
  }, [refresh])

  return {
    contractStats,
    loading,
    error,
    refresh
  }
}
