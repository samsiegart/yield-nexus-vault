import { useState, useEffect, useCallback } from "react";
import { aaveV3Client, AaveV3Balance } from "@/lib/aave-v3";

export interface UseAaveV3Options {
  rpcUrl?: string;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export interface UseAaveV3Return {
  balances: AaveV3Balance[];
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  queryBalances: (caip10Address: string) => Promise<void>;
  refresh: () => Promise<void>;
  totalValueUSD: number;
  healthFactor: string | null;
}

export function useAaveV3(options: UseAaveV3Options = {}): UseAaveV3Return {
  const { autoRefresh = false, refreshInterval = 30000 } = options;

  const [balances, setBalances] = useState<AaveV3Balance[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [currentAddress, setCurrentAddress] = useState<string | null>(null);

  const client = aaveV3Client;

  const queryBalances = useCallback(
    async (caip10Address: string) => {
      setIsLoading(true);
      setIsError(false);
      setError(null);
      setCurrentAddress(caip10Address);

      try {
        const balanceData = await client.queryBalances(caip10Address);
        setBalances(balanceData);
      } catch (err) {
        setIsError(true);
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        console.error("Error querying Aave V3 balances:", err);
        setBalances([]); // Clear balances on error
      } finally {
        setIsLoading(false);
      }
    },
    [client]
  );

  const refresh = useCallback(async () => {
    if (currentAddress) {
      await queryBalances(currentAddress);
    }
  }, [currentAddress, queryBalances]);

  useEffect(() => {
    if (!autoRefresh || !currentAddress) return;

    const interval = setInterval(refresh, refreshInterval);
    return () => clearInterval(interval);
  }, [autoRefresh, currentAddress, refresh, refreshInterval]);

  const totalValueUSD = balances.reduce(
    (sum, balance) => sum + balance.valueUSD,
    0
  );

  const healthFactor = balances.length > 0 ? balances[0].healthFactor : null;

  return {
    balances,
    isLoading,
    isError,
    error,
    queryBalances,
    refresh,
    totalValueUSD,
    healthFactor,
  };
}

// Convenience hook for querying a specific address
export function useAaveV3Balances(
  caip10Address: string | null,
  options: UseAaveV3Options = {}
): UseAaveV3Return {
  const hook = useAaveV3(options);

  useEffect(() => {
    if (caip10Address) {
      hook.queryBalances(caip10Address);
    }
  }, [caip10Address, hook.queryBalances]);

  return hook;
}
