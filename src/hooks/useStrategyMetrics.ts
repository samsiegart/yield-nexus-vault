import { useQuery } from "@tanstack/react-query";
import { fetchRealAprs } from "@/services/spectrumApi";

async function fetchNobleMetrics() {
  const [apyRes, tvlRes] = await Promise.all([
    fetch("https://worker.dollar.noble.xyz/"),
    fetch(
      "https://noble-api.polkachu.com/cosmos/bank/v1beta1/supply/by_denom?denom=uusdn"
    ),
  ]);
  const apyJson = await apyRes.json();
  const tvlJson = await tvlRes.json();
  const apy = Number(apyJson.earner_rate) / 100;
  const tvl = Number(tvlJson.amount.amount) / 1_000_000;
  return { apy, tvl };
}

async function fetchEvmMetrics(protocolKey: string) {
  const aprs = await fetchRealAprs();
  const apy = aprs[protocolKey] ?? 0;
  return { apy, tvl: undefined };
}

export const useStrategyMetrics = (id: string) => {
  return useQuery({
    queryKey: ["strategyMetrics", id],
    queryFn: async () => {
      switch (id) {
        case "usdn-noble":
          return fetchNobleMetrics();
        case "aave-eth-real":
          return fetchEvmMetrics("aave-ethereum");
        case "compound-eth-real":
          return fetchEvmMetrics("compound-ethereum");
        default:
          return { apy: 0, tvl: undefined };
      }
    },
    staleTime: 5 * 60 * 1000,
  });
};
