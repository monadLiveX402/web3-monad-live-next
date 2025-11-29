"use client";

import { useState, useEffect, useCallback } from "react";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { getContract } from "thirdweb";
import { useActiveAccount, useActiveWallet } from "thirdweb/react";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";
import { UNIFIED_TIPPING_ABI, getContractAddress } from "@/lib/contracts";
import { client } from "@/lib/thirdweb";

/**
 * 流式打赏状态
 */
export interface StreamState {
  ratePerSecond: bigint;
  startTime: bigint;
  balance: bigint;
  active: boolean;
  currentAmount: bigint;
}

/**
 * 流式打赏 Hook
 * 提供开始、停止、充值流式打赏功能
 */
export function useStreamTipping(chainId: number = 10143) {
  const wallet = useActiveWallet();
  const account = useActiveAccount();

  const [streamState, setStreamState] = useState<StreamState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // 获取当前链 - Monad Testnet (10143) or Ethereum Sepolia (11155111)
  const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;

  // 获取合约实例
  const getContractSafe = useCallback(() => {
    const address = getContractAddress(chainId);
    return getContract({
      client,
      chain,
      address,
      abi: UNIFIED_TIPPING_ABI,
    });
  }, [chain, chainId]);

  /**
   * 加载用户的流式打赏状态
   */
  const loadStreamState = useCallback(async () => {
    if (!account?.address || !wallet) {
      setStreamState(null);
      return;
    }

    try {
      const contract = getContractSafe();
      const result = await readContract({
        contract,
        method: "function getStream(address _user) external view returns (uint256 ratePerSecond, uint256 startTime, uint256 balance, bool active, uint256 currentAmount)",
        params: [account.address],
      });

      const [ratePerSecond, startTime, balance, active, currentAmount] = result;

      if (active) {
        setStreamState({
          ratePerSecond,
          startTime,
          balance,
          active,
          currentAmount,
        });
      } else {
        setStreamState(null);
      }
    } catch (err: any) {
      console.error("Failed to load stream state:", err);
      setError(err?.message || "读取流式打赏状态失败");
      setStreamState(null);
    }
  }, [account?.address, wallet, getContractSafe]);

  /**
   * 检查余额是否不足
   */
  const checkLowBalance = useCallback(async () => {
    if (!account?.address || !wallet || !streamState?.active) {
      return { isLow: false, remainingTime: 0 };
    }

    try {
      const contract = getContractSafe();
      const result = await readContract({
        contract,
        method: "function isStreamLowBalance(address _user) external view returns (bool, uint256)",
        params: [account.address],
      });

      const [isLow, remainingTime] = result;
      return { isLow, remainingTime: Number(remainingTime) };
    } catch (err) {
      console.error("Failed to check low balance:", err);
      return { isLow: false, remainingTime: 0 };
    }
  }, [account?.address, wallet, getContractSafe, streamState?.active]);

  /**
   * 开始流式打赏
   * @param ratePerSecond 每秒打赏金额（wei）
   * @param initialBalance 初始余额（wei）
   */
  const startStream = async (
    ratePerSecond: string,
    initialBalance: string
  ) => {
    if (!wallet || !account) {
      setError("请先连接钱包");
      return;
    }

    const rate = BigInt(ratePerSecond);
    const balance = BigInt(initialBalance);
    if (rate <= 0n) {
      setError("每秒费率必须大于 0");
      return;
    }
    if (balance <= 0n) {
      setError("初始余额必须大于 0");
      return;
    }
    if (rate > balance) {
      setError("费率不能大于初始余额");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const contract = getContractSafe();
      const transaction = prepareContractCall({
        contract,
        method: "function startStream(uint256 _ratePerSecond) external payable",
        params: [rate],
        value: balance,
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(transactionHash);

      // 等待交易确认后重新加载状态
      setTimeout(() => {
        loadStreamState();
      }, 2000);

      return transactionHash;
    } catch (err: any) {
      console.error("Failed to start stream:", err);
      setError(err.message || "开启流式打赏失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 停止流式打赏
   */
  const stopStream = async () => {
    if (!wallet || !account) {
      setError("请先连接钱包");
      return;
    }

    if (!streamState?.active) {
      setError("没有正在进行的流式打赏");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const contract = getContractSafe();
      const transaction = prepareContractCall({
        contract,
        method: "function stopStream() external",
        params: [],
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(transactionHash);

      // 等待交易确认后重新加载状态
      setTimeout(() => {
        loadStreamState();
      }, 2000);

      return transactionHash;
    } catch (err: any) {
      console.error("Failed to stop stream:", err);
      setError(err.message || "停止流式打赏失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * 为流式打赏充值
   * @param amount 充值金额（wei）
   */
  const topUpStream = async (amount: string) => {
    if (!wallet || !account) {
      setError("请先连接钱包");
      return;
    }

    if (!streamState?.active) {
      setError("没有正在进行的流式打赏");
      return;
    }

    const topUp = BigInt(amount);
    if (topUp <= 0n) {
      setError("充值金额必须大于 0");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTxHash(null);

    try {
      const contract = getContractSafe();
      const transaction = prepareContractCall({
        contract,
        method: "function topUpStream() external payable",
        params: [],
        value: topUp,
      });

      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      setTxHash(transactionHash);

      // 等待交易确认后重新加载状态
      setTimeout(() => {
        loadStreamState();
      }, 2000);

      return transactionHash;
    } catch (err: any) {
      console.error("Failed to top up stream:", err);
      setError(err.message || "充值失败");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // 自动加载流状态
  useEffect(() => {
    loadStreamState();

    // 每 5 秒刷新一次状态
    const interval = setInterval(loadStreamState, 5000);
    return () => clearInterval(interval);
  }, [loadStreamState]);

  return {
    streamState,
    isLoading,
    error,
    txHash,
    startStream,
    stopStream,
    topUpStream,
    checkLowBalance,
    refreshState: loadStreamState,
  };
}
