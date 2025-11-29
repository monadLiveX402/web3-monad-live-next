"use client";

import { useState, useEffect } from "react";
import { createWallet, injectedProvider } from "thirdweb/wallets";
import { client } from "@/lib/thirdweb";
import { monadTestnet, ethereumSepolia } from "@/lib/chains";
import type { Account, Wallet } from "thirdweb/wallets";

export type Chain = "monad" | "ethereum";

export function useWallet() {
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [account, setAccount] = useState<Account | null>(null);
  const [address, setAddress] = useState<string>("");
  const [currentChain, setCurrentChain] = useState<Chain>("monad");
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Connect wallet
   */
  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Create wallet instance
      const walletInstance = createWallet("io.metamask");

      // Connect to the wallet
      const acc = await walletInstance.connect({
        client,
        chain: currentChain === "monad" ? monadTestnet : ethereumSepolia,
      });

      setWallet(walletInstance);
      setAccount(acc);
      setAddress(acc.address);

      return walletInstance;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to connect wallet";
      setError(errorMessage);
      console.error("Wallet connection error:", err);
      throw err;
    } finally {
      setIsConnecting(false);
    }
  };

  /**
   * Disconnect wallet
   */
  const disconnectWallet = () => {
    if (wallet) {
      wallet.disconnect();
    }
    setWallet(null);
    setAccount(null);
    setAddress("");
    setError(null);
  };

  /**
   * Switch chain
   */
  const switchChain = async (chain: Chain) => {
    try {
      setError(null);
      setCurrentChain(chain);

      if (wallet && account) {
        // Reconnect with new chain
        const newAccount = await wallet.connect({
          client,
          chain: chain === "monad" ? monadTestnet : ethereumSepolia,
        });
        setAccount(newAccount);
        setAddress(newAccount.address);
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : "Failed to switch chain";
      setError(errorMessage);
      console.error("Chain switch error:", err);
      throw err;
    }
  };

  /**
   * Auto-connect on mount if provider exists
   */
  useEffect(() => {
    const autoConnect = async () => {
      const provider = injectedProvider("io.metamask");
      if (provider) {
        try {
          await connectWallet();
        } catch (err) {
          // Silent fail for auto-connect
          console.log("Auto-connect failed:", err);
        }
      }
    };

    autoConnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    wallet,
    account,
    address,
    currentChain,
    isConnecting,
    error,
    isConnected: !!wallet && !!account,
    connectWallet,
    disconnectWallet,
    switchChain,
  };
}
