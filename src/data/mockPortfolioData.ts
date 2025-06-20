import { PortfolioData, Position } from "../store";

export const mockPositions: Position[] = [
  {
    id: "aave-eth",
    protocol: "AAVE",
    name: "USAV",
    apy: 14.0,
    chain: "Ethereum",
    value: 43437,
    percentage: 30,
    spread: 30,
  },
  {
    id: "beefy-polygon",
    protocol: "Beefy",
    name: "USDC",
    apy: 10.0,
    chain: "Polygon",
    value: 0,
    percentage: 0,
    spread: 0,
  },
  {
    id: "compound-eth",
    protocol: "Compound",
    name: "USDC",
    apy: 4.0,
    chain: "Ethereum",
    value: 57916,
    percentage: 40,
    spread: 40,
  },
  {
    id: "yearn-eth",
    protocol: "Yearn",
    name: "USDC Vault",
    apy: 8.5,
    chain: "Ethereum",
    value: 43437,
    percentage: 30,
    spread: 30,
  },
];

export const mockPortfolioData: Omit<
  PortfolioData,
  "isLoading" | "isLoaded" | "error"
> = {
  currentBalance: 144789,
  totalDeposits: 134000,
  totalYield: 10789,
  weeklyReturn: 7.7,
  positions: mockPositions,
};
