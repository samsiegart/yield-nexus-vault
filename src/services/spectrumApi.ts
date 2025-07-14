// Spectrum API service for fetching real APR data
const isDevelopment = import.meta.env.MODE === "development";
const BASE_URL = isDevelopment
  ? "/api/spectrum" // Use proxy in development
  : "https://pools-api.spectrumnodes.com"; // Direct URL in production

type Chain =
  | "ethereum"
  | "optimism"
  | "polygon"
  | "arbitrum"
  | "base"
  | "avalanche";
type Pool = "aave" | "compound";

interface AprResponse {
  apr: number;
  chain: string;
  pool: string;
}

interface PoolBalanceResponse {
  balance: string;
  chain: string;
  pool: string;
  address: string;
}

/**
 * Fetch APR data for a specific pool and chain
 */
export async function fetchApr(chain: Chain, pool: Pool): Promise<number> {
  try {
    const response = await fetch(`${BASE_URL}/apr?chain=${chain}&pool=${pool}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch APR: ${response.statusText}`);
    }

    const data: AprResponse = await response.json();
    return data.apr;
  } catch (error) {
    console.error(`Error fetching APR for ${pool} on ${chain}:`, error);
    return 0; // Return 0 as fallback
  }
}

/**
 * Fetch pool balance for a wallet address
 */
export async function fetchPoolBalance(
  chain: Chain,
  pool: Pool,
  address: string
): Promise<string> {
  try {
    const response = await fetch(
      `${BASE_URL}/pool-balance?pool=${pool}&chain=${chain}&address=${address}`
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch pool balance: ${response.statusText}`);
    }

    const data: PoolBalanceResponse = await response.json();
    return data.balance;
  } catch (error) {
    console.error(
      `Error fetching pool balance for ${pool} on ${chain}:`,
      error
    );
    return "0"; // Return 0 as fallback
  }
}

/**
 * Fetch real APR data for all supported protocols
 */
export async function fetchRealAprs(): Promise<Record<string, number>> {
  const aprPromises = [
    fetchApr("ethereum", "aave"),
    fetchApr("ethereum", "compound"),
  ];

  const results = await Promise.allSettled(aprPromises);

  return {
    "aave-ethereum": results[0].status === "fulfilled" ? results[0].value : 0,
    "compound-ethereum":
      results[1].status === "fulfilled" ? results[1].value : 0,
    "usdn-noble": 0, // Not supported by Spectrum API yet
  };
}
