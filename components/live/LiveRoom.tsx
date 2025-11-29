"use client";

import React, { useState } from "react";
import { Card, CardHeader, CardContent, CardFooter } from "../ui/Card";
import { Button } from "../ui/Button";
import { useTipping } from "@/hooks/useTipping";
import { performanceTracker } from "@/lib/thirdweb";
import type { Wallet, Account } from "thirdweb/wallets";

interface LiveRoomProps {
  roomId: number;
  streamerName: string;
  streamerAddress: string;
  wallet: Wallet | null;
  account: Account | null;
  chainId: number;
  onTipSuccess?: () => void;
}

export function LiveRoom({
  roomId,
  streamerName,
  streamerAddress,
  wallet,
  account,
  chainId,
  onTipSuccess,
}: LiveRoomProps) {
  const { loading, sendTip, sendMultipleTips } = useTipping();
  const [tipAmount, setTipAmount] = useState("0.001");
  const [showSuccess, setShowSuccess] = useState(false);

  const handleTip = async () => {
    if (!wallet || !account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      // Convert to wei (assuming MON/ETH has 18 decimals)
      const amountWei = (parseFloat(tipAmount) * 1e18).toString();

      const result = await sendTip(wallet, account, roomId, amountWei, chainId);

      if (result.success) {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        onTipSuccess?.();
      } else {
        alert(`Tip failed: ${result.error}`);
      }
    } catch (error) {
      console.error("Tip error:", error);
      alert("Failed to send tip");
    }
  };

  const quickTipAmounts = ["0.001", "0.01", "0.1", "1.0"];

  return (
    <Card>
      <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">{streamerName}&apos;s Live Room</h2>
            <p className="text-sm opacity-90 mt-1 font-mono">Room #{roomId}</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">LIVE</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Placeholder */}
        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg flex items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20"></div>
          <div className="relative z-10 text-center text-white">
            <div className="text-6xl mb-4">🎥</div>
            <p className="text-xl font-semibold">Live Stream</p>
            <p className="text-sm opacity-75 mt-2">
              Real-time blockchain tipping demo
            </p>
          </div>
        </div>

        {/* Streamer Info */}
        <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Streamer Address</p>
            <p className="font-mono text-sm text-gray-900 dark:text-white mt-1">
              {streamerAddress.slice(0, 6)}...{streamerAddress.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 dark:text-gray-400">Network</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mt-1">
              {chainId === 10143 ? "Monad Testnet" : "Ethereum Sepolia"}
            </p>
          </div>
        </div>

        {/* Tipping Interface */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tip Amount ({chainId === 10143 ? "MON" : "ETH"})
            </label>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              {quickTipAmounts.map((amount) => (
                <button
                  key={amount}
                  onClick={() => setTipAmount(amount)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    tipAmount === amount
                      ? "bg-purple-600 text-white"
                      : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600"
                  }`}
                >
                  {amount}
                </button>
              ))}
            </div>

            {/* Custom Amount Input */}
            <input
              type="number"
              step="0.001"
              min="0"
              value={tipAmount}
              onChange={(e) => setTipAmount(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Enter custom amount"
            />
          </div>

          <Button
            onClick={handleTip}
            loading={loading}
            disabled={!wallet || !account || loading || parseFloat(tipAmount) <= 0}
            className="w-full"
            size="lg"
          >
            {!wallet || !account
              ? "Connect Wallet to Tip"
              : loading
              ? "Sending Tip..."
              : `Send Tip (${tipAmount} ${chainId === 10143 ? "MON" : "ETH"})`}
          </Button>
        </div>

        {/* Success Animation */}
        {showSuccess && (
          <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 animate-bounce">
              <div className="text-center">
                <div className="text-6xl mb-4">🚀</div>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Tip Sent!
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  Flying to {streamerName}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <div className="w-full space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Tips sent this session:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {performanceTracker.getMetrics().filter(m => m.status === "confirmed").length}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Average confirmation:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {performanceTracker.getAverageTime(chainId) > 0
                ? `${(performanceTracker.getAverageTime(chainId) / 1000).toFixed(2)}s`
                : "—"}
            </span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
