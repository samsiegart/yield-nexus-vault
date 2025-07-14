import { useQuery } from "@tanstack/react-query";
import { fetchRealStrategies } from "@/queries/portfolioQueries";

export interface LiveStrategy {
  id: string;
  protocol: string;
  name: string;
  apy?: number; // may be undefined until loaded
  tvl?: string; // may be undefined until loaded
  chain: string;
  riskLevel?: string;
  description?: string;
  minDeposit?: number;
}

const initialRealStrategies: LiveStrategy[] = [
  {
    id: "usdn-noble",
    protocol: "Noble",
    name: "USDN",
    chain: "Noble",
  },
  {
    id: "aave-eth-real",
    protocol: "AAVE",
    name: "USDC",
    chain: "Ethereum",
  },
  {
    id: "compound-eth-real",
    protocol: "Compound",
    name: "USDC",
    chain: "Ethereum",
  },
];

/**
 * React-query hook to fetch and cache real DeFi strategies with live APY/TVL.
 */
export const useRealStrategies = () => {
  return useQuery({
    queryKey: ["realStrategies"],
    queryFn: fetchRealStrategies,
    initialData: initialRealStrategies,
    select: (fetched) => {
      const map = new Map(initialRealStrategies.map((s) => [s.id, { ...s }]));
      fetched.forEach((s) => map.set(s.id, { ...map.get(s.id), ...s }));
      return Array.from(map.values());
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });
};
