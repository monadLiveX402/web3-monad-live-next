"use client";

import React from "react";
import { Card, CardHeader, CardContent } from "./ui/Card";
import type { PerformanceMetrics } from "@/lib/thirdweb";

interface PerformanceComparisonProps {
  metrics: PerformanceMetrics[];
}

export function PerformanceComparison({ metrics }: PerformanceComparisonProps) {
  // Group metrics by chain
  const monadMetrics = metrics.filter((m) => m.chainId === 10143 && m.confirmationTime);
  const ethereumMetrics = metrics.filter((m) => m.chainId === 11155111 && m.confirmationTime);

  // Calculate averages
  const monadAvg =
    monadMetrics.length > 0
      ? monadMetrics.reduce((sum, m) => sum + (m.totalTime || 0), 0) / monadMetrics.length
      : 0;

  const ethereumAvg =
    ethereumMetrics.length > 0
      ? ethereumMetrics.reduce((sum, m) => sum + (m.totalTime || 0), 0) / ethereumMetrics.length
      : 0;

  const speedup = ethereumAvg > 0 ? (ethereumAvg / monadAvg).toFixed(2) : "N/A";

  return (
    <Card>
      <CardHeader>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
          Performance Comparison
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Real-time comparison of transaction confirmation times
        </p>
      </CardHeader>

      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800">
            <div className="text-sm text-purple-600 dark:text-purple-400 font-medium mb-1">
              Monad Testnet
            </div>
            <div className="text-3xl font-bold text-purple-900 dark:text-purple-300">
              {monadAvg > 0 ? `${(monadAvg / 1000).toFixed(2)}s` : "—"}
            </div>
            <div className="text-xs text-purple-600 dark:text-purple-400 mt-1">
              {monadMetrics.length} transactions
            </div>
          </div>

          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <div className="text-sm text-blue-600 dark:text-blue-400 font-medium mb-1">
              Ethereum Sepolia
            </div>
            <div className="text-3xl font-bold text-blue-900 dark:text-blue-300">
              {ethereumAvg > 0 ? `${(ethereumAvg / 1000).toFixed(2)}s` : "—"}
            </div>
            <div className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              {ethereumMetrics.length} transactions
            </div>
          </div>

          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
            <div className="text-sm text-green-600 dark:text-green-400 font-medium mb-1">
              Speed Improvement
            </div>
            <div className="text-3xl font-bold text-green-900 dark:text-green-300">
              {speedup !== "N/A" ? `${speedup}x` : "—"}
            </div>
            <div className="text-xs text-green-600 dark:text-green-400 mt-1">
              faster on Monad
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
            Recent Transactions
          </h4>

          {metrics.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No transactions yet. Send a tip to start comparing performance!
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics
                .slice()
                .reverse()
                .slice(0, 10)
                .map((metric, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg border ${
                      metric.chainId === 10143
                        ? "bg-purple-50 dark:bg-purple-900/10 border-purple-200 dark:border-purple-800"
                        : "bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            metric.status === "confirmed"
                              ? "bg-green-500"
                              : metric.status === "failed"
                              ? "bg-red-500"
                              : "bg-yellow-500"
                          }`}
                        ></div>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {metric.chainName}
                        </span>
                      </div>
                      <span
                        className={`text-sm font-bold ${
                          metric.chainId === 10143
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-blue-600 dark:text-blue-400"
                        }`}
                      >
                        {metric.totalTime ? `${(metric.totalTime / 1000).toFixed(2)}s` : "—"}
                      </span>
                    </div>

                    {metric.transactionHash && (
                      <div className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                        {metric.transactionHash}
                      </div>
                    )}

                    {metric.blockNumber && (
                      <div className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        Block #{metric.blockNumber}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
