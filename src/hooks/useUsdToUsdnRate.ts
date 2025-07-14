import { useQuery } from "@tanstack/react-query";

/**
 * Fetches the USDN/USDC swap price from Noble swap API.
 * Returns price as a JS number (uusdn priced in uusdc) e.g. 1.000002.
 */
export const useUsdToUsdnRate = () => {
  return useQuery<number>({
    queryKey: ["usdToUsdnRate"],
    queryFn: async () => {
      const res = await fetch(
        "https://noble-api.polkachu.com/noble/swap/v1/rates/uusdn"
      );
      if (!res.ok) throw new Error("Failed to fetch Noble swap rate");
      const json: unknown = await res.json();

      const priceStr = (json as { rates?: { price?: string }[] })?.rates?.[0]
        ?.price;
      if (!priceStr) throw new Error("price missing");
      return Number(priceStr); // price of 1 USDN in USDC
    },
    staleTime: 5 * 60 * 1000,
  });
};
