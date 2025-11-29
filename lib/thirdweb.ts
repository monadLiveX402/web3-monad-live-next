import { createThirdwebClient } from "thirdweb";

/**
 * Get Thirdweb client ID from environment
 * For development, you can use a demo client ID
 * Get your own from https://thirdweb.com/dashboard
 */
const getClientId = () => {
  const clientId = process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID;

  // If no client ID is provided, return a placeholder that will work for UI demo
  // but won't allow actual transactions
  if (!clientId || clientId === "demo_client_id_replace_me") {
    console.warn(
      "⚠️ No Thirdweb Client ID found. Get one from https://thirdweb.com/dashboard"
    );
    // Return a valid format but non-functional ID for demo purposes
    return "placeholder_client_id_for_demo_only";
  }

  return clientId;
};

/**
 * Thirdweb client for frontend
 */
export const client = createThirdwebClient({
  clientId: getClientId(),
});

/**
 * Performance metrics tracker
 */
export interface PerformanceMetrics {
  chainId: number;
  chainName: string;
  transactionHash?: string;
  startTime: number;
  confirmationTime?: number;
  totalTime?: number;
  blockNumber?: number;
  gasUsed?: string;
  gasPrice?: string;
  status: "pending" | "confirmed" | "failed";
  error?: string;
}

/**
 * Track transaction performance
 */
export class PerformanceTracker {
  private metrics: PerformanceMetrics[] = [];

  startTracking(chainId: number, chainName: string): PerformanceMetrics {
    const metric: PerformanceMetrics = {
      chainId,
      chainName,
      startTime: Date.now(),
      status: "pending",
    };
    this.metrics.push(metric);
    return metric;
  }

  updateMetrics(
    metric: PerformanceMetrics,
    data: Partial<PerformanceMetrics>
  ): void {
    Object.assign(metric, data);
    if (data.confirmationTime) {
      metric.totalTime = Date.now() - metric.startTime;
    }
  }

  getMetrics(): PerformanceMetrics[] {
    return this.metrics;
  }

  getAverageTime(chainId: number): number {
    const chainMetrics = this.metrics.filter(
      (m) => m.chainId === chainId && m.totalTime
    );
    if (chainMetrics.length === 0) return 0;
    const total = chainMetrics.reduce((sum, m) => sum + (m.totalTime || 0), 0);
    return total / chainMetrics.length;
  }

  clear(): void {
    this.metrics = [];
  }
}

export const performanceTracker = new PerformanceTracker();
