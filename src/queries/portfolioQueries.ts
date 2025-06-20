import { mockPortfolioData } from "../data/mockPortfolioData";
import { PortfolioData } from "../store";

export const fetchPortfolioData = async (): Promise<
  Omit<PortfolioData, "isLoading" | "isLoaded" | "error">
> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // For now, return mock data
  // TODO: Replace with actual API calls when backend is ready
  return mockPortfolioData;
};

export const fetchUserPositions = async () => {
  // TODO: Implement real API call to fetch user positions
  return mockPortfolioData.positions;
};

export const fetchPortfolioBalance = async () => {
  // TODO: Implement real API call to fetch portfolio balance
  return {
    currentBalance: mockPortfolioData.currentBalance,
    totalDeposits: mockPortfolioData.totalDeposits,
    totalYield: mockPortfolioData.totalYield,
    weeklyReturn: mockPortfolioData.weeklyReturn,
  };
};
