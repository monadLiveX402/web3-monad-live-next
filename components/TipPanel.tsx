"use client";

import { useState, useEffect } from "react";
import { useStreamTipping } from "@/hooks/useStreamTipping";
import { useTipping } from "@/hooks/useTipping";
import { formatEther, parseEther } from "ethers";
import type { Wallet, Account } from "thirdweb/wallets";

interface TipPanelProps {
  roomId: number;
  chainId?: number;
  wallet: Wallet | null;
  account: Account | null;
  onTipSuccess?: () => void;
}

type TipMode = "instant" | "stream";

export default function TipPanel({
  roomId,
  chainId = 10143,
  wallet,
  account,
  onTipSuccess,
}: TipPanelProps) {
  const [mode, setMode] = useState<TipMode>("instant");

  // 流式打赏 hooks
  const {
    streamState,
    isLoading: streamLoading,
    error: streamError,
    txHash: streamTxHash,
    startStream,
    stopStream,
    topUpStream,
    checkLowBalance,
  } = useStreamTipping(chainId);

  // 一次性打赏 hooks
  const { loading: tipLoading, sendTip } = useTipping();

  // 一次性打赏状态
  const [tipAmount, setTipAmount] = useState("0.001");
  const [showSuccess, setShowSuccess] = useState(false);

  // 流式打赏配置
  const [ratePerSecond, setRatePerSecond] = useState("0.0001");
  const [initialBalance, setInitialBalance] = useState("1");
  const [topUpAmount, setTopUpAmount] = useState("0.5");

  // 流式打赏实时状态
  const [elapsedTime, setElapsedTime] = useState(0);
  const [currentAmount, setCurrentAmount] = useState(0);
  const [remainingBalance, setRemainingBalance] = useState(0);
  const [remainingTime, setRemainingTime] = useState(0);
  const [isLowBalance, setIsLowBalance] = useState(false);

  // 更新流式打赏实时状态
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
    const interval = setInterval(checkBalance, 10000);

    return () => clearInterval(interval);
  }, [streamState?.active, checkLowBalance]);

  // 处理一次性打赏
  const handleInstantTip = async () => {
    if (!wallet || !account) {
      alert("请先连接钱包");
      return;
    }

    try {
      const amountWei = (parseFloat(tipAmount) * 1e18).toString();
      const result = await sendTip(wallet, account, roomId, amountWei, chainId);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        onTipSuccess?.();
      } else {
        alert(`打赏失败: ${result.error}`);
      }
    } catch (error) {
      console.error("打赏错误:", error);
      alert("发送打赏失败");
    }
  };

  // 处理开始流式打赏
  const handleStartStream = async () => {
    try {
      const rateWei = parseEther(ratePerSecond).toString();
      const balanceWei = parseEther(initialBalance).toString();
      await startStream(roomId, rateWei, balanceWei);
    } catch (err) {
      console.error("开始流式打赏失败:", err);
    }
  };

  // 处理停止流式打赏
  const handleStopStream = async () => {
    try {
      await stopStream();
    } catch (err) {
      console.error("停止流式打赏失败:", err);
    }
  };

  // 处理充值
  const handleTopUp = async () => {
    try {
      const amountWei = parseEther(topUpAmount).toString();
      await topUpStream(amountWei);
    } catch (err) {
      console.error("充值失败:", err);
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

  const isLoading = streamLoading || tipLoading;
  const currency = chainId === 10143 ? "MON" : "ETH";

  return (
    <div className="bg-[#0a0118] rounded-2xl p-6 border border-purple-800/30">
      {/* Tab 切换 */}
      <div className="flex items-center gap-2 mb-6 bg-purple-900/20 rounded-lg p-1">
        <button
          onClick={() => setMode("instant")}
          className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
            mode === "instant"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          💸 即时打赏
        </button>
        <button
          onClick={() => setMode("stream")}
          className={`flex-1 px-4 py-2.5 rounded-md font-medium transition-all ${
            mode === "stream"
              ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg"
              : "text-gray-400 hover:text-white"
          }`}
        >
          ⚡ 流式打赏
        </button>
      </div>

      {/* 即时打赏模式 */}
      {mode === "instant" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">即时打赏</h3>
            <div className="text-sm text-gray-400">一次性支付</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              打赏金额 ({currency})
            </label>

            {/* 快速金额按钮 */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {["0.001", "0.01", "0.1", "1.0"].map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    tipAmount === amount
                      ? "bg-purple-600 text-white"
                      : "bg-purple-900/30 text-purple-300 hover:bg-purple-900/50"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* 自定义金额输入 */}
            <input
              type="number"
              step="0.001"
              min="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full px-4 py-3 bg-purple-900/20 border border-purple-700/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500"
              placeholder="输入自定义金额"
            />
          </div>

          <button
            onClick={handleInstantTip}
            disabled={
              !wallet || !account || isLoading || parseFloat(tipAmount) <= 0
            }
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!wallet || !account
              ? "请先连接钱包"
              : isLoading
              ? "发送中..."
              : `发送打赏 (${tipAmount} ${currency})`}
          </button>

          {/* 成功动画 */}
          {showSuccess && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="text-3xl">🚀</div>
                <div>
                  <p className="text-green-400 font-bold">打赏已发送！</p>
                  <p className="text-sm text-green-300/70">
                    交易已提交到区块链
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 流式打赏模式 */}
      {mode === "stream" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white">流式打赏</h3>
            <div className="flex items-center gap-2">
              <div
                className={`h-2 w-2 rounded-full ${
                  streamState?.active
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-500"
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
                  每秒费率 ({currency}/秒)
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
                  初始余额 ({currency})
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
                    {(parseFloat(ratePerSecond) * 3600).toFixed(4)} {currency}
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
                    {currentAmount.toFixed(4)} {currency}
                  </div>
                </div>
              </div>

              {/* 余额进度条 - 增强版 */}
              <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/20 rounded-xl p-5 border border-purple-700/40 shadow-lg">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <div className="text-xs text-gray-400 mb-1">剩余余额</div>
                    <div className="text-2xl font-bold text-white">
                      {remainingBalance.toFixed(4)} <span className="text-lg text-gray-400">{currency}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-400 mb-1">初始余额</div>
                    <div className="text-lg font-medium text-gray-300">
                      {parseFloat(initialBalance).toFixed(4)} {currency}
                    </div>
                  </div>
                </div>

                {/* 进度条 */}
                <div className="relative">
                  <div className="w-full bg-gray-800/50 rounded-full h-4 mb-2 overflow-hidden border border-purple-700/30">
                    <div
                      className={`h-4 rounded-full transition-all duration-1000 ${
                        remainingBalance / parseFloat(initialBalance) > 0.5
                          ? "bg-gradient-to-r from-green-500 to-emerald-500"
                          : remainingBalance / parseFloat(initialBalance) > 0.2
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-red-500 to-pink-500 animate-pulse"
                      }`}
                      style={{
                        width: `${Math.max(
                          0,
                          Math.min(
                            100,
                            (remainingBalance / parseFloat(initialBalance)) * 100
                          )
                        )}%`,
                      }}
                    >
                      <div className="h-full w-full bg-white/20"></div>
                    </div>
                  </div>

                  {/* 百分比标签 */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-purple-900/90 px-3 py-1 rounded-full border border-purple-600/50">
                    <span className="text-xs font-bold text-white">
                      {((remainingBalance / parseFloat(initialBalance)) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* 详细信息 */}
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="bg-purple-950/40 rounded-lg p-2 border border-purple-700/20">
                    <div className="text-xs text-gray-400">⏱️ 剩余时间</div>
                    <div className="text-sm font-bold text-purple-300 mt-1">
                      {formatTime(remainingTime)}
                    </div>
                  </div>
                  <div className="bg-purple-950/40 rounded-lg p-2 border border-purple-700/20">
                    <div className="text-xs text-gray-400">⚡ 费率</div>
                    <div className="text-sm font-bold text-purple-300 mt-1">
                      {formatEther(streamState.ratePerSecond)} {currency}/s
                    </div>
                  </div>
                </div>

                {/* 预计耗尽时间 */}
                {remainingTime > 0 && (
                  <div className="mt-3 text-center">
                    <div className="text-xs text-gray-500">
                      预计 {new Date(Date.now() + remainingTime * 1000).toLocaleString('zh-CN', {
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })} 余额耗尽
                    </div>
                  </div>
                )}
              </div>

              {/* 充值区域 */}
              <div className="bg-purple-900/10 rounded-lg p-4 border border-purple-700/20">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  充值金额 ({currency})
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
        </div>
      )}

      {/* 错误提示 */}
      {streamError && (
        <div className="mt-4 bg-red-500/10 border border-red-500/30 rounded-lg p-3">
          <p className="text-sm text-red-400">{streamError}</p>
        </div>
      )}

      {/* 交易哈希 */}
      {streamTxHash && (
        <div className="mt-4 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <p className="text-sm text-green-400">
            交易已提交: {streamTxHash.slice(0, 10)}...{streamTxHash.slice(-8)}
          </p>
        </div>
      )}
    </div>
  );
}
