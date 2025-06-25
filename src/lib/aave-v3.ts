import { ethers } from "ethers";
import { UiPoolDataProvider, ChainId } from "@aave/contract-helpers";
import { AaveV3Ethereum } from "@bgd-labs/aave-address-book";
import { formatReserves, formatUserSummary } from "@aave/math-utils";
import dayjs from "dayjs";

export interface AaveV3Balance {
  asset: string;
  symbol: string;
  aTokenBalance: number;
  stableDebt: number;
  variableDebt: number;
  totalBalance: number;
  totalDebt: number;
  netPosition: number;
  price: number;
  valueUSD: number;
  healthFactor: string;
}

export class AaveV3Client {
  private provider: ethers.providers.Provider;
  private poolDataProvider: UiPoolDataProvider;

  constructor(rpcUrl: string = "https://eth-mainnet.public.blastapi.io") {
    // Note: `@aave/contract-helpers` requires ethers v5, ensure compatibility
    this.provider = new ethers.providers.JsonRpcProvider(
      rpcUrl,
      ChainId.mainnet
    );
    this.poolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: AaveV3Ethereum.UI_POOL_DATA_PROVIDER,
      provider: this.provider,
      chainId: ChainId.mainnet,
    });
  }

  static parseCAIP10(caip10: string): { chainId: string; address: string } {
    const parts = caip10.split(":");
    if (parts.length !== 3 || parts[0] !== "eip155") {
      throw new Error(
        "Invalid CAIP-10 format. Expected: eip155:chainId:address"
      );
    }
    return {
      chainId: parts[1],
      address: parts[2],
    };
  }

  async queryBalances(caip10Address: string): Promise<AaveV3Balance[]> {
    const { address: user } = AaveV3Client.parseCAIP10(caip10Address);
    const currentTimestamp = dayjs().unix();

    try {
      console.log("getting reserves");
      const reserves = await this.poolDataProvider.getReservesHumanized({
        lendingPoolAddressProvider: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
      });
      console.log("got reserves");

      const userReserves = await this.poolDataProvider.getUserReservesHumanized(
        {
          lendingPoolAddressProvider: AaveV3Ethereum.POOL_ADDRESSES_PROVIDER,
          user,
        }
      );

      console.log("got user reserves");

      const formattedPoolReserves = formatReserves({
        reserves: reserves.reservesData,
        currentTimestamp,
        marketReferenceCurrencyDecimals:
          reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
        marketReferencePriceInUsd:
          reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
      });

      const userSummary = formatUserSummary({
        currentTimestamp,
        marketReferencePriceInUsd:
          reserves.baseCurrencyData.marketReferenceCurrencyPriceInUsd,
        marketReferenceCurrencyDecimals:
          reserves.baseCurrencyData.marketReferenceCurrencyDecimals,
        userReserves: userReserves.userReserves,
        formattedReserves: formattedPoolReserves,
        userEmodeCategoryId: userReserves.userEmodeCategoryId,
      });

      if (!userSummary || userSummary.userReservesData.length === 0) {
        return [];
      }

      return userSummary.userReservesData
        .filter(
          (reserve) =>
            Number(reserve.underlyingBalance) > 0 ||
            Number(reserve.totalBorrows) > 0
        )
        .map((reserve) => {
          const reserveData = formattedPoolReserves.find(
            (r) => r.underlyingAsset === reserve.underlyingAsset
          );

          const price = parseFloat(reserveData?.priceInUSD ?? "0");
          const aTokenBalance = parseFloat(reserve.underlyingBalance);
          const stableDebt = 0;
          const variableDebt = 0;
          const totalBalance = aTokenBalance;
          const totalDebt = parseFloat(reserve.totalBorrows);
          const netPosition = totalBalance - totalDebt;
          const valueUSD = netPosition * price;

          return {
            asset: reserve.underlyingAsset,
            symbol: reserve.reserve.symbol,
            aTokenBalance,
            stableDebt,
            variableDebt,
            totalBalance,
            totalDebt,
            netPosition,
            price,
            valueUSD,
            healthFactor: userSummary.healthFactor,
          };
        });
    } catch (error) {
      console.error(
        "Error fetching Aave V3 balances with contract-helpers:",
        error
      );
      return [];
    }
  }
}

export const aaveV3Client = new AaveV3Client();
