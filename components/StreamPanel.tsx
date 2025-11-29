"use client";

import { useState, useEffect } from "react";
import { useStreamTipping } from "@/hooks/useStreamTipping";
import { formatEther, parseEther } from "ethers";

interface StreamPanelProps {
  roomId: number;
  chainId?: number;
}

export default function StreamPanel({
  roomId,
  chainId = 10143,
}: StreamPanelProps) {
  const {
    streamState,
    isLoading,
    error,
    txHash,
    startStream,
    stopStream,
    topUpStream,
    checkLowBalance,
  } = useStreamTipping(chainId);

  // 流式打赏配置
  const [ratePerSecond, setRatePerSecond] = useState("0.0001"); // 每秒 0.0001 MON
  const [initialBalance, setInitialBalance] = useState("1"); // 初始余额 1 MON
  const [topUpAmount, setTopUpAmount] = useState("0.5"); // 充值金额 0.5 MON

  // 实时状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLowBalance, setIsLowBalance] = useState(false);

  // 更新实时状态
  useEffect(() => {
    if (!streamState?.active) {
      setElapsedTime(0);
      setCurrentAmount(0);
      setRemainingBalance(0);
      setRemainingTime(0);
      return;
    }

    const updateRealTimeStats = () => {
      const now = Math.floor(Date.now() / 1000);
      const startTimestamp = Number(streamState.startTime);
      const elapsed = now - startTimestamp;
      setElapsedTime(elapsed);

      const rate = Number(formatEther(streamState.ratePerSecond));
      const balance = Number(formatEther(streamState.balance));

      const calculated = elapsed * rate;
      const current = Math.min(calculated, balance);
      setCurrentAmount(current);

      const remaining = Math.max(balance - calculated, 0);
      setRemainingBalance(remaining);

      const timeLeft = remaining > 0 ? Math.floor(remaining / rate) : 0;
      setRemainingTime(timeLeft);
    };

    updateRealTimeStats();
    const interval = setInterval(updateRealTimeStats, 1000);

    return () => clearInterval(interval);
  }, [streamState]);

  // 检查余额不足
  useEffect(() => {
    if (!streamState?.active) return;

    const checkBalance = async () => {
      const { isLow } = await checkLowBalance();
      setIsLowBalance(isLow);
    };

    checkBalance();
    const interval = setInterval(checkBalance, 10000); // 每 10 秒检查一次

    return () => clearInterval(interval);
  }, [streamState?.active, checkLowBalance]);

  // 处理开始流式打赏
  const handleStartStream = async () => {
    try {
      const rateWei = parseEther(ratePerSecond).toString();
      const balanceWei = parseEther(initialBalance).toString();
      await startStream(roomId, rateWei, balanceWei);
    } catch (err) {
      console.error("Start stream failed:", err);
    }
  };

  // 处理停止流式打赏
  const handleStopStream = async () => {
    try {
      await stopStream();
    } catch (err) {
      console.error("Stop stream failed:", err);
    }
  };

  // 处理充值
  const handleTopUp = async () => {
    try {
      const amountWei = parseEther(topUpAmount).toString();
      await topUpStream(amountWei);
    } catch (err) {
      console.error("Top up failed:", err);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  return (
    <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">流式打赏</h3>
        <div className="flex items-center gap-2">
          <div
            className={`h-2 w-2 rounded-full ${
              streamState?.active ? "bg-green-500 animate-pulse" : "bg-gray-500"
            }`}
          ></div>
          <span className="text-sm text-gray-400">
            {streamState?.active ? "进行中" : "未开启"}
          </span>
        </div>
      </div>

      {/* 流式打赏未开启 */}
      {!streamState?.active && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              每秒费率 (MON/秒)
            </label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {["0.0001", "0.0005", "0.001"].map((rate) => (
                <button
                  key={rate}
                  onClick={() => setRatePerSecond(rate)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    ratePerSecond === rate
                      ? "bg-purple-600 text-white"
                      : "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                  }`}
                >
                  {rate}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.0001"
              value={ratePerSecond}
              onChange={(e) => setRatePerSecond(e.target.value)}
              className="w-full px-4 py-2 bg-purple-900/20 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="自定义费率"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              初始余额 (MON)
            </label>
            <div className="grid grid-cols-4 gap-2 mb-2">
              {["0.5", "1", "2", "5"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setInitialBalance(amount)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    initialBalance === amount
                      ? "bg-purple-600 text-white"
                      : "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>
            <input
              type="number"
              step="0.1"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
              className="w-full px-4 py-2 bg-purple-900/20 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="自定义金额"
            />
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">预计持续时间</span>
              <span className="text-white font-medium">
                {formatTime(
                  Math.floor(
                    parseFloat(initialBalance) / parseFloat(ratePerSecond)
                  )
                )}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">每小时消费</span>
              <span className="text-white font-medium">
                {(parseFloat(ratePerSecond) * 3600).toFixed(4)} MON
              </span>
            </div>
          </div>

          <button
            onClick={handleStartStream}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "处理中..." : "开启流式打赏"}
          </button>
        </div>
      )}

      {/* 流式打赏进行中 */}
      {streamState?.active && (
        <div className="space-y-4">
          {/* 余额警告 */}
          {isLowBalance && (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <span className="text-sm text-yellow-400 font-medium">
                  余额不足！剩余时间少于 {formatTime(remainingTime)}
                </span>
              </div>
            </div>
          )}

          {/* 实时统计 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
              <div className="text-xs text-gray-400 mb-1">持续时间</div>
              <div className="text-2xl font-bold text-white">
                {formatTime(elapsedTime)}
              </div>
            </div>
            <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
              <div className="text-xs text-gray-400 mb-1">已打赏</div>
              <div className="text-2xl font-bold text-purple-400">
                {currentAmount.toFixed(4)} MON
              </div>
            </div>
          </div>

          <div className="bg-purple-900/20 rounded-lg p-4 border border-purple-700/30">
            <div className="flex justify-between items-center mb-3">
              <span className="text-sm text-gray-400">剩余余额</span>
              <span className="text-lg font-bold text-white">
                {remainingBalance.toFixed(4)} MON
              </span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2 mb-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.max(
                    0,
                    Math.min(
                      100,
                      (remainingBalance / parseFloat(initialBalance)) * 100
                    )
                  )}%`,
                }}
              ></div>
            </div>
            <div className="flex justify-between text-xs text-gray-500">
              <span>剩余时间: {formatTime(remainingTime)}</span>
              <span>费率: {formatEther(streamState.ratePerSecond)} MON/s</span>
            </div>
          </div>

          {/* 充值区域 */}
          <div className="bg-purple-900/10 rounded-lg p-4 border border-purple-700/20">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              充值金额 (MON)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.1"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                className="flex-1 px-3 py-2 bg-purple-900/20 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
                placeholder="充值金额"
              />
              <button
                onClick={handleTopUp}
                disabled={isLoading}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "..." : "充值"}
              </button>
            </div>
          </div>

          {/* 停止按钮 */}
          <button
            onClick={handleStopStream}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 rounded-lg font-medium hover:from-red-700 hover:to-red-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "处理中..." : "停止流式打赏"}
          </button>
        </div>
      )}

      {/* 错误提示 */}
      {error && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm text-red-400">{error}</p>
        </div>
      )}

      {/* 交易哈希 */}
      {txHash && (
        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-sm text-green-400">
            交易已提交: {txHash.slice(0, 10)}...{txHash.slice(-8)}
          </p>
        </div>
      )}
    </div>
  );
}
