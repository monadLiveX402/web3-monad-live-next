"use client";

import { useState } from "react";
import { prepareContractCall, sendTransaction, waitForReceipt } from "thirdweb";
import { getContract } from "thirdweb";
import { client, performanceTracker } from "@/lib/thirdweb";
import { LIVE_ROOM_ABI, getContractAddress } from "@/lib/contracts";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";
import type { Account, Wallet } from "thirdweb/wallets";
import type { PerformanceMetrics } from "@/lib/thirdweb";

export interface TipResult {
  success: boolean;
  txHash?: string;
  blockNumber?: number;
  metrics: PerformanceMetrics;
  error?: string;
}

export function useTipping() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Send a tip to a live room
   */
  const sendTip = async (
    wallet: Wallet,
    account: Account,
    roomId: number,
    amount: string,
    chainId: number
  ): Promise<TipResult> => {
    try {
      setLoading(true);
      setError(null);

      const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
      const chainName = chainId === 10143 ? "Monad Testnet" : "Ethereum Sepolia";

      // Start performance tracking
      const metrics = performanceTracker.startTracking(chainId, chainName);

      // Get contract
      const contractAddress = getContractAddress(chainId, "liveRoom");
      const contract = getContract({
        client,
        chain,
        address: contractAddress,
        abi: LIVE_ROOM_ABI,
      });

      // Prepare transaction
      const transaction = prepareContractCall({
        contract,
        method: "function tip(uint256 _roomId) external payable",
        params: [BigInt(roomId)],
        value: BigInt(amount),
      });

      // Send transaction
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      metrics.transactionHash = transactionHash;
      performanceTracker.updateMetrics(metrics, {
        transactionHash,
      });

      // Wait for receipt
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash,
      });

      // Update metrics
      performanceTracker.updateMetrics(metrics, {
        confirmationTime: Date.now(),
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === "success" ? "confirmed" : "failed",
      });

      return {
        success: receipt.status === "success",
        txHash: transactionHash,
        blockNumber: Number(receipt.blockNumber),
        metrics,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Tip failed";
      setError(errorMessage);
      console.error("Tip error:", err);

      return {
        success: false,
        error: errorMessage,
        metrics: performanceTracker.startTracking(chainId, "Unknown"),
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Send multiple tips at once
   */
  const sendMultipleTips = async (
    wallet: Wallet,
    account: Account,
    roomId: number,
    amount: string,
    count: number,
    chainId: number
  ): Promise<TipResult> => {
    try {
      setLoading(true);
      setError(null);

      const chain = chainId === 10143 ? monadTestnet : ethereumSepolia;
      const chainName = chainId === 10143 ? "Monad Testnet" : "Ethereum Sepolia";

      // Start performance tracking
      const metrics = performanceTracker.startTracking(chainId, chainName);

      // Get contract
      const contractAddress = getContractAddress(chainId, "liveRoom");
      const contract = getContract({
        client,
        chain,
        address: contractAddress,
        abi: LIVE_ROOM_ABI,
      });

      // Prepare transaction
      const transaction = prepareContractCall({
        contract,
        method: "function tipMultiple(uint256 _roomId, uint256 _count) external payable",
        params: [BigInt(roomId), BigInt(count)],
        value: BigInt(amount),
      });

      // Send transaction
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      metrics.transactionHash = transactionHash;
      performanceTracker.updateMetrics(metrics, {
        transactionHash,
      });

      // Wait for receipt
      const receipt = await waitForReceipt({
        client,
        chain,
        transactionHash,
      });

      // Update metrics
      performanceTracker.updateMetrics(metrics, {
        confirmationTime: Date.now(),
        blockNumber: Number(receipt.blockNumber),
        gasUsed: receipt.gasUsed.toString(),
        status: receipt.status === "success" ? "confirmed" : "failed",
      });

      return {
        success: receipt.status === "success",
        txHash: transactionHash,
        blockNumber: Number(receipt.blockNumber),
        metrics,
      };
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Multiple tips failed";
      setError(errorMessage);
      console.error("Multiple tips error:", err);

      return {
        success: false,
        error: errorMessage,
        metrics: performanceTracker.startTracking(chainId, "Unknown"),
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    sendTip,
    sendMultipleTips,
  };
}
