import { mockPortfolioData } from "../data/mockPortfolioData";
import { PortfolioData, DataMode } from "../store";
import { fetchRealAprs } from "../services/spectrumApi";

/**
 * Fetch Noble USDN APY (earner_rate) from publicly available worker endpoint.
 * Returns percentage value (e.g., 4.15 for 4.15%).
 */
async function fetchNobleApy(): Promise<number> {
  try {
    const res = await fetch("https://worker.dollar.noble.xyz/");
    if (!res.ok) throw new Error(`Noble API status ${res.status}`);
    const data = await res.json();
    const bps = Number(data.earner_rate);
    if (Number.isFinite(bps)) {
      return bps / 100; // convert basis points -> percent
    }
    throw new Error("Invalid earner_rate");
  } catch (err) {
    console.error("Failed to fetch Noble APY", err);
    return 0;
  }
}

/**
 * Fetch Noble USDN circulating supply (TVL proxy) in uusdn.
 */
async function fetchNobleTvl(): Promise<number> {
  try {
    const res = await fetch(
      "https://noble-api.polkachu.com/cosmos/bank/v1beta1/supply/by_denom?denom=uusdn"
    );
    if (!res.ok) throw new Error(`Noble TVL status ${res.status}`);
    const json = await res.json();
    const amtStr = json.amount?.amount as string | undefined;
    if (!amtStr) throw new Error("amount missing");
    const usdn = Number(amtStr) / 1_000_000; // convert uusdn -> usdn
    return usdn; // raw number in USDN (≈ USD)
  } catch (err) {
    console.error("Failed to fetch Noble TVL", err);
    return 0;
  }
}

function formatTvl(num: number): string {
  if (!Number.isFinite(num) || num === 0) return "TBD";
  if (num >= 1_000_000_000) return `$${(num / 1_000_000_000).toFixed(1)}B`;
  if (num >= 1_000_000) return `$${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `$${(num / 1_000).toFixed(1)}K`;
  return `$${num.toFixed(0)}`;
}

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
    // Fetch APRs: Spectrum (multi-chain) + Noble worker
    const [aprData, nobleApy, nobleTvl] = await Promise.all([
      fetchRealAprs(),
      fetchNobleApy(),
      fetchNobleTvl(),
    ]);

    // Only return these three strategies in real data mode with real APRs
    const realStrategies = [
      {
        id: "usdn-noble",
        protocol: "Noble",
        name: "USDN",
        apy: nobleApy,
        tvl: formatTvl(nobleTvl),
        riskLevel: "Low" as const,
        chain: "Noble",
        description: "Noble USDN staking with real-time APY",
        minDeposit: 1,
      },
      {
        id: "aave-eth-real",
        protocol: "AAVE",
        name: "USDC",
        apy: aprData["aave-ethereum"],
        tvl: "TBD",
        riskLevel: "Low" as const,
        chain: "Ethereum",
        description: "Aave USDC lending with real-time APY",
        minDeposit: 10,
      },
      {
        id: "compound-eth-real",
        protocol: "Compound",
        name: "USDC",
        apy: aprData["compound-ethereum"],
        tvl: "TBD",
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
