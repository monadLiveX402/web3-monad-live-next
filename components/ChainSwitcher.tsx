"use client";

import React from "react";
import { Button } from "./ui/Button";
import type { Chain } from "@/hooks/useWallet";

interface ChainSwitcherProps {
  currentChain: Chain;
  onSwitchChain: (chain: Chain) => void;
  disabled?: boolean;
}

export function ChainSwitcher({
  currentChain,
  onSwitchChain,
  disabled = false,
}: ChainSwitcherProps) {
  const chains = [
    {
      id: "monad" as Chain,
      name: "Monad Testnet",
      symbol: "MON",
      color: "from-purple-600 to-blue-600",
      description: "High-performance EVM chain",
    },
    {
      id: "ethereum" as Chain,
      name: "Ethereum Sepolia",
      symbol: "ETH",
      color: "from-blue-600 to-cyan-600",
      description: "Ethereum test network",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Select Network
        </h3>
        <div className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full text-white text-sm font-medium">
          Active: {chains.find((c) => c.id === currentChain)?.name}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {chains.map((chain) => {
          const isActive = currentChain === chain.id;

          return (
            <button
              key={chain.id}
              onClick={() => onSwitchChain(chain.id)}
              disabled={disabled || isActive}
              className={`
                relative overflow-hidden rounded-xl p-6 border-2 transition-all duration-300
                ${
                  isActive
                    ? "border-purple-500 bg-purple-50 dark:bg-purple-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700"
                }
                ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              {/* Background gradient */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${chain.color} opacity-0 ${
                  isActive ? "opacity-10" : "group-hover:opacity-5"
                } transition-opacity duration-300`}
              ></div>

              {/* Content */}
              <div className="relative z-10 flex flex-col items-start gap-2">
                <div className="flex items-center justify-between w-full">
                  <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                    {chain.name}
                  </h4>
                  {isActive && (
                    <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">Connected</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <div
                    className={`w-3 h-3 rounded-full bg-gradient-to-br ${chain.color}`}
                  ></div>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {chain.symbol}
                  </span>
                </div>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {chain.description}
                </p>

                {chain.id === "monad" && (
                  <div className="mt-2 px-2 py-1 bg-yellow-100 dark:bg-yellow-900/30 rounded text-xs text-yellow-800 dark:text-yellow-300 font-medium">
                    0.4s block time
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          <div className="flex-1">
            <h5 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
              Performance Comparison
            </h5>
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Send the same transaction on both networks to compare Monad&apos;s superior
              speed and lower costs.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
