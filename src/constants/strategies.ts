export const BASE_STRATEGIES = [
  { id: "usdn-noble", protocol: "Noble", name: "USDN", chain: "Noble" },
  { id: "aave-eth-real", protocol: "AAVE", name: "USDC", chain: "Ethereum" },
  {
    id: "compound-eth-real",
    protocol: "Compound",
    name: "USDC",
    chain: "Ethereum",
  },
] as const;

export type BaseStrategy = (typeof BASE_STRATEGIES)[number];
