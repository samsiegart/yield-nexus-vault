import { mockPortfolioData } from "../data/mockPortfolioData";
import { PortfolioData, DataMode } from "../store";
import { fetchRealAprs } from "../services/spectrumApi";

export const fetchPortfolioData = async (
  dataMode: DataMode = "has-positions"
): Promise<Omit<PortfolioData, "isLoading" | "isLoaded" | "error">> => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  switch (dataMode) {
    case "no-positions":
      return {
        ...mockPortfolioData,
        currentBalance: 0,
        totalDeposits: 0,
        totalYield: 0,
        weeklyReturn: 0,
        positions: [],
        dataMode,
        isLoadingAprs: false,
      };

    case "real-data": {
      // TODO: Implement real API calls to fetch user's actual positions
      // For now, return empty positions until we fetch real user data
      console.log(
        "Real data mode - fetching actual user positions from blockchain/API"
      );

      // TODO: When implementing real API calls, check if user has positions in:
      // - USDN on Noble (id: "usdn-noble")
      // - AAVE USDC on Ethereum (id: "aave-eth-real")
      // - Compound USDC on Ethereum (id: "compound-eth-real")
      // Only return positions where user has actual balances > 0

      return {
        currentBalance: 0,
        totalDeposits: 0,
        totalYield: 0,
        weeklyReturn: 0,
        positions: [], // Empty until real positions are fetched
        dataMode,
        isLoadingAprs: false,
      };
    }

    case "has-positions":
    default:
      return {
        ...mockPortfolioData,
        dataMode,
        isLoadingAprs: false,
      };
  }
};

export const fetchUserPositions = async (
  dataMode: DataMode = "has-positions"
) => {
  switch (dataMode) {
    case "real-data": {
      // TODO: Implement real API call to fetch user's actual positions from blockchain
      console.log("Fetching real user positions from blockchain...");

      // TODO: When implementing real API calls, fetch actual positions from:
      // - USDN on Noble (id: "usdn-noble")
      // - AAVE USDC on Ethereum (id: "aave-eth-real")
      // - Compound USDC on Ethereum (id: "compound-eth-real")
      // Only return positions where user has actual balances > 0

      return []; // Empty until real positions are fetched
    }
    case "no-positions":
      return [];
    case "has-positions":
    default:
      return mockPortfolioData.positions;
  }
};

export const fetchRealStrategies = async () => {
  console.log(
    "Fetching real strategy data with live APRs from Spectrum API..."
  );

  try {
    // Fetch real APRs from Spectrum API
    const aprData = await fetchRealAprs();

    // Only return these three strategies in real data mode with real APRs
    const realStrategies = [
      {
        id: "usdn-noble",
        protocol: "Noble",
        name: "USDN",
        apy: aprData["usdn-noble"], // Real APR from API (currently 0 - not supported)
        tvl: "TBD", // Will be fetched from Noble API when available
        riskLevel: "Low" as const,
        chain: "Noble",
        description: "Noble USDN staking with real-time APY",
        minDeposit: 1,
      },
      {
        id: "aave-eth-real",
        protocol: "AAVE",
        name: "USDC",
        apy: aprData["aave-ethereum"], // Real APR from Spectrum API
        tvl: "TBD", // Will be fetched from Aave API when available
        riskLevel: "Low" as const,
        chain: "Ethereum",
        description: "Aave USDC lending with real-time APY",
        minDeposit: 10,
      },
      {
        id: "compound-eth-real",
        protocol: "Compound",
        name: "USDC",
        apy: aprData["compound-ethereum"], // Real APR from Spectrum API
        tvl: "TBD", // Will be fetched from Compound API when available
        riskLevel: "Low" as const,
        chain: "Ethereum",
        description: "Compound USDC lending with real-time APY",
        minDeposit: 10,
      },
    ];

    return realStrategies;
  } catch (error) {
    console.error(
      "Failed to fetch real APRs, falling back to zero values:",
      error
    );

    // Fallback to zero values if API fails
    const fallbackStrategies = [
      {
        id: "usdn-noble",
        protocol: "Noble",
        name: "USDN",
        apy: 0,
        tvl: "TBD",
        riskLevel: "Low" as const,
        chain: "Noble",
        description: "Noble USDN staking (APY unavailable)",
        minDeposit: 1,
      },
      {
        id: "aave-eth-real",
        protocol: "AAVE",
        name: "USDC",
        apy: 0,
        tvl: "TBD",
        riskLevel: "Low" as const,
        chain: "Ethereum",
        description: "Aave USDC lending (APY unavailable)",
        minDeposit: 10,
      },
      {
        id: "compound-eth-real",
        protocol: "Compound",
        name: "USDC",
        apy: 0,
        tvl: "TBD",
        riskLevel: "Low" as const,
        chain: "Ethereum",
        description: "Compound USDC lending (APY unavailable)",
        minDeposit: 10,
      },
    ];

    return fallbackStrategies;
  }
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
