export const BASE_STRATEGIES = [
  {
    id: "usdn-noble",
    allocationKey: "USDN",
    protocol: "Noble",
    name: "USDN",
    chain: "Noble",
  },
  {
    id: "aave-eth-real",
    allocationKey: "Aave_Ethereum",
    protocol: "AAVE",
    name: "USDC",
    chain: "Ethereum",
  },
  {
    id: "compound-eth-real",
    allocationKey: "Compound_Ethereum",
    protocol: "Compound",
    name: "USDC",
    chain: "Ethereum",
  },
] as const;

export type BaseStrategy = (typeof BASE_STRATEGIES)[number];
