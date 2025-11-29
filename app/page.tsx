'use client'

import { useState } from 'react'
import {
  ConnectButton,
  useActiveAccount,
  useSwitchActiveWalletChain,
  useActiveWallet
} from 'thirdweb/react'
import { client } from '@/lib/thirdweb'
import { monadTestnet, ethereumSepolia } from '@/lib/chains'
import { defaultStream } from '@/lib/livestream-config'
import dynamic from 'next/dynamic'
import TipPanel from '@/components/TipPanel'
import { TipEventStream } from '@/components/TipEventStream'
import { useUnifiedTipping } from '@/hooks/useLiveRoom'
import { formatEther } from 'viem'
import { DashboardCharts } from '@/components/DashboardCharts'

// Dynamically import HLS player to avoid SSR issues
const HLSPlayerComponent = dynamic(
  () => import('@/components/HLSPlayerComponent'),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center">
        <div className="text-white">加载播放器...</div>
      </div>
    )
  }
)

export default function Home() {
  const [activeTab, setActiveTab] = useState<'live' | 'dashboard'>('live')
  const [currentChain, setCurrentChain] = useState<'monad' | 'ethereum'>(
    'monad'
  )

  const account = useActiveAccount()
  const switchChain = useSwitchActiveWalletChain()

  // Handle chain switching
  const handleChainSwitch = async (chain: 'monad' | 'ethereum') => {
    setCurrentChain(chain)
    if (account) {
      try {
        await switchChain(chain === 'monad' ? monadTestnet : ethereumSepolia)
      } catch (error) {
        console.error('Failed to switch chain:', error)
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Header */}
      <header className="border-b border-purple-800/30 bg-[#1a0b2e]/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold">
                M
              </div>
              <span className="text-white font-semibold text-lg">
                Monad Live
              </span>
              <span className="text-gray-400 ml-6">直播场景：CryptoFlow</span>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 bg-[#2d1b4e]/50 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('live')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'live'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                直播页面
              </button>
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`px-6 py-2 rounded-lg font-medium transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                仪表板页面
              </button>
            </div>

            {/* Chain Switcher & Connect Wallet */}
            <div className="flex items-center gap-3">
              {/* Chain Switcher */}
              <div className="flex gap-2 bg-[#2d1b4e]/50 rounded-lg p-1">
                <button
                  onClick={() => handleChainSwitch('monad')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentChain === 'monad'
                      ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-purple-400"></div>
                  Monad
                </button>
                <button
                  onClick={() => handleChainSwitch('ethereum')}
                  className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                    currentChain === 'ethereum'
                      ? 'bg-gradient-to-r from-blue-600 to-cyan-600 text-white'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                  Ethereum
                </button>
              </div>

              {/* Connect Wallet */}
              <ConnectButton
                client={client}
                chain={
                  currentChain === 'monad' ? monadTestnet : ethereumSepolia
                }
                theme="dark"
                connectButton={{
                  label: 'Connect Wallet',
                  className:
                    '!px-6 !py-2.5 !bg-gradient-to-r !from-purple-600 !to-blue-600 hover:!from-purple-700 hover:!to-blue-700 !text-white !rounded-lg !font-medium !transition-all'
                }}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-6 py-8">
        {activeTab === 'live' ? (
          <LivePage currentChain={currentChain} />
        ) : (
          <DashboardPage currentChain={currentChain} />
        )}
      </main>
    </div>
  )
}

function LivePage({ currentChain }: { currentChain: 'monad' | 'ethereum' }) {
  const account = useActiveAccount()
  const wallet = useActiveWallet()

  const chainId = currentChain === 'monad' ? 10143 : 11155111
  const { contractStats, loading: statsLoading, refresh } =
    useUnifiedTipping(chainId)

  // 打赏成功后刷新统计数据
  const handleTipSuccess = () => {
    refresh()
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left: Video Stream */}
      <div className="lg:col-span-2 space-y-6">
        {/* Video Player */}
        <div className="bg-[#0a0118] rounded-2xl overflow-hidden border border-purple-800/30">
          <div className="relative">
            {/* HLS Player */}
            <HLSPlayerComponent streamUrl={defaultStream.url} />

            {/* Live Badge - Overlaid on player */}
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-lg z-10 shadow-lg">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-white text-sm font-medium">直播中</span>
            </div>

            {/* Viewer Count - Overlaid on player */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm px-3 py-2 rounded-lg z-10 shadow-lg">
              <svg
                className="w-5 h-5 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              <span className="text-white font-medium">在线人数：5,432</span>
            </div>
          </div>
        </div>

        {/* Real-time Tip Events - Using blockchain data */}
        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <TipEventStream
            chainId={chainId}
            maxDisplay={5}
          />
        </div>
      </div>

      {/* Right: Tipping Controls */}
      <div className="space-y-6">
        {/* Stats Card */}
        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">支付礼上见直播区</h3>
            <svg
              className="w-5 h-5 text-purple-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
              />
            </svg>
          </div>

          <div className="space-y-4">
            {/* Chain Indicator */}
            <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-lg p-3 mb-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-300">当前链:</span>
                <span
                  className={`font-semibold ${
                    currentChain === 'monad'
                      ? 'text-purple-400'
                      : 'text-blue-400'
                  }`}
                >
                  {currentChain === 'monad'
                    ? 'Monad Testnet'
                    : 'Ethereum Sepolia'}
                </span>
              </div>
            </div>

            <div className="bg-[#1a0b2e]/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">即时打赏总额:</div>
              <div className="text-3xl font-bold text-white">
                {statsLoading
                  ? '...'
                  : `${Number(
                      formatEther(contractStats?.instantVolume || BigInt(0))
                    ).toFixed(4)} ${currentChain === 'monad' ? 'MON' : 'ETH'}`}
              </div>
            </div>

            <div className="bg-[#1a0b2e]/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">流式消耗总额:</div>
              <div className="text-3xl font-bold text-white">
                {statsLoading
                  ? '...'
                  : `${Number(
                      formatEther(contractStats?.streamVolume || BigInt(0))
                    ).toFixed(4)} ${currentChain === 'monad' ? 'MON' : 'ETH'}`}
              </div>
            </div>

            <div className="bg-[#1a0b2e]/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">当前活跃流:</div>
              <div className="text-3xl font-bold text-white">
                {statsLoading
                  ? '...'
                  : Number(contractStats?.activeStreams || BigInt(0))}
              </div>
            </div>

            <div className="bg-[#1a0b2e]/50 rounded-lg p-4">
              <div className="text-gray-400 text-sm mb-1">累计合计:</div>
              <div className="text-3xl font-bold text-white text-base">
                {statsLoading
                  ? '...'
                  : `${Number(
                      formatEther(contractStats?.totalVolume || BigInt(0))
                    ).toFixed(4)} ${currentChain === 'monad' ? 'MON' : 'ETH'}`}
              </div>
            </div>
          </div>
        </div>

        {/* Unified Tip Panel */}
        <TipPanel
          chainId={chainId}
          wallet={wallet || null}
          account={account || null}
          onTipSuccess={handleTipSuccess}
        />
      </div>
    </div>
  )
}

function DashboardPage({
  currentChain
}: {
  currentChain: 'monad' | 'ethereum'
}) {
  const chainId = currentChain === 'monad' ? 10143 : 11155111
  const { contractStats, loading: statsLoading } = useUnifiedTipping(chainId)

  const currency = currentChain === 'monad' ? 'MON' : 'ETH'
  const totalVolume = statsLoading
    ? '...'
    : Number(formatEther(contractStats?.totalVolume || BigInt(0))).toFixed(4)
  const instantVolume = statsLoading
    ? '...'
    : Number(formatEther(contractStats?.instantVolume || BigInt(0))).toFixed(4)
  const streamVolume = statsLoading
    ? '...'
    : Number(formatEther(contractStats?.streamVolume || BigInt(0))).toFixed(4)
  const instantValue = statsLoading
    ? 0
    : Number(formatEther(contractStats?.instantVolume || BigInt(0)))
  const streamValue = statsLoading
    ? 0
    : Number(formatEther(contractStats?.streamVolume || BigInt(0)))

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">仪表板</h1>
        <div className="px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/50 rounded-lg">
          <span className="text-sm text-gray-300">当前链: </span>
          <span
            className={`font-semibold ${
              currentChain === 'monad' ? 'text-purple-400' : 'text-blue-400'
            }`}
          >
            {currentChain === 'monad' ? 'Monad Testnet' : 'Ethereum Sepolia'}
          </span>
        </div>
      </div>

      {/* Stats Grid - Using Real Contract Data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">即时打赏总额</span>
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center text-white text-lg">
              ⚡
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {instantVolume} {currency}
          </div>
        </div>

        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">流式消耗总额</span>
            <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center text-white text-lg">
              💧
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {streamVolume} {currency}
          </div>
        </div>

        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">总打赏金额</span>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center text-white text-lg">
              💰
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {totalVolume} {currency}
          </div>
        </div>

        <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-sm">活跃流数量</span>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center text-white text-lg">
              📊
            </div>
          </div>
          <div className="text-2xl font-bold text-white">
            {statsLoading ? '...' : Number(contractStats?.activeStreams || BigInt(0))}
          </div>
          <div className="text-xs text-green-400 mt-1">✓ 持续流中</div>
        </div>
      </div>

      {/* Charts Row */}
      <DashboardCharts
        instantVolume={instantValue}
        streamVolume={streamValue}
        currency={currency}
      />

      {/* Transaction Table - Real Tip History */}
      <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
        <h3 className="text-white font-semibold mb-6">打赏历史记录</h3>
        <TipEventStream chainId={chainId} maxDisplay={10} />
      </div>
    </div>
  )
}
