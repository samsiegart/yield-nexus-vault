import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useAaveV3 } from "@/hooks/useAaveV3";
import {
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  DollarSign,
} from "lucide-react";

const AaveV3BalanceViewer: React.FC = () => {
  const [inputAddress, setInputAddress] = useState(
    "eip155:1:0xc7Bfd896cc6A8BF1D09486Dd08f590691b20C2Ff"
  ); // Try this address or find one with Aave V3 positions

  const {
    balances,
    userData,
    isLoading,
    isError,
    error,
    queryBalances,
    refresh,
    totalValueUSD,
    totalCollateralUSD,
    totalDebtUSD,
    netPositionUSD,
  } = useAaveV3({ autoRefresh: true, refreshInterval: 30000 });

  const handleQuery = () => {
    if (inputAddress) {
      queryBalances(inputAddress);
    }
  };

  const formatBigInt = (value: bigint, decimals: number = 18): string => {
    const divisor = BigInt(10 ** decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
    const fractionStr = fraction.toString().padStart(decimals, "0");
    return `${whole}.${fractionStr}`;
  };

  const formatUSD = (value: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">Aave V3 Balance Query</CardTitle>
          <CardDescription className="text-slate-300">
            Query Aave V3 balances for any Ethereum address using CAIP-10 format
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="address" className="text-white">
              Ethereum Address (CAIP-10 format)
            </Label>
            <div className="flex space-x-2">
              <Input
                id="address"
                value={inputAddress}
                onChange={(e) => setInputAddress(e.target.value)}
                placeholder="eip155:1:0x..."
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400"
              />
              <Button
                onClick={handleQuery}
                disabled={isLoading || !inputAddress}
                className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              >
                {isLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  "Query"
                )}
              </Button>
            </div>
            <p className="text-sm text-slate-400">
              Example: eip155:1:0x3dA3050208a3F2e0d04b33674aAa7b1A9F9B313C
            </p>
            <div className="text-xs text-slate-500 mt-2 p-3 bg-slate-700/30 rounded-lg">
              <strong>Tip:</strong> To find addresses with Aave V3 positions,
              you can:
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Check Aave's official dashboard</li>
                <li>Use Etherscan to look at Aave V3 contract interactions</li>
                <li>
                  Look for addresses that have interacted with Aave V3 Pool
                  contract
                </li>
              </ul>
            </div>
          </div>

          {isError && (
            <div className="flex items-center space-x-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">
                Error: {error?.message || "Unknown error occurred"}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {balances.length > 0 && (
        <div className="grid md:grid-cols-4 gap-4">
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-green-400" />
                <span className="text-sm text-slate-300">Total Value</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {formatUSD(totalValueUSD)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span className="text-sm text-slate-300">Collateral</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {formatUSD(totalCollateralUSD)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <TrendingDown className="w-4 h-4 text-red-400" />
                <span className="text-sm text-slate-300">Total Debt</span>
              </div>
              <div className="text-xl font-bold text-white mt-1">
                {formatUSD(totalDebtUSD)}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <DollarSign className="w-4 h-4 text-purple-400" />
                <span className="text-sm text-slate-300">Net Position</span>
              </div>
              <div
                className={`text-xl font-bold mt-1 ${
                  netPositionUSD >= 0 ? "text-green-400" : "text-red-400"
                }`}
              >
                {formatUSD(netPositionUSD)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* User Account Data */}
      {userData && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white">Account Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label className="text-sm text-slate-400">Health Factor</Label>
                <div className="text-lg font-semibold text-white">
                  {userData.healthFactor > 0
                    ? (Number(userData.healthFactor) / 1e18).toFixed(2)
                    : "N/A"}
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-400">LTV</Label>
                <div className="text-lg font-semibold text-white">
                  {(Number(userData.ltv) / 1e4).toFixed(2)}%
                </div>
              </div>
              <div>
                <Label className="text-sm text-slate-400">
                  Liquidation Threshold
                </Label>
                <div className="text-lg font-semibold text-white">
                  {(Number(userData.currentLiquidationThreshold) / 1e4).toFixed(
                    2
                  )}
                  %
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Individual Balances */}
      {balances.length > 0 && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-white">Asset Balances</CardTitle>
              <Button
                onClick={refresh}
                disabled={isLoading}
                variant="outline"
                size="sm"
                className="bg-slate-700/50 border-slate-600 text-white hover:bg-slate-600/50"
              >
                <RefreshCw
                  className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {balances.map((balance, index) => (
                <div key={balance.asset}>
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-white">
                          {balance.symbol}
                        </span>
                        <Badge
                          variant="secondary"
                          className="bg-slate-600 text-slate-300"
                        >
                          {balance.asset.slice(0, 6)}...
                          {balance.asset.slice(-4)}
                        </Badge>
                      </div>
                      <div className="text-sm text-slate-400 mt-1">
                        Price: ${(Number(balance.price) / 1e8).toFixed(2)}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {formatUSD(balance.valueUSD)}
                      </div>
                      <div className="text-sm text-slate-400">
                        {formatBigInt(balance.totalBalance, 18)}{" "}
                        {balance.symbol}
                      </div>
                    </div>
                  </div>

                  {/* Debt information if any */}
                  {(balance.stableDebt > 0n || balance.variableDebt > 0n) && (
                    <div className="ml-4 mt-2 p-3 bg-red-900/20 border border-red-500/30 rounded-lg">
                      <div className="text-sm text-red-400 font-medium">
                        Debt Position
                      </div>
                      <div className="text-sm text-slate-300 mt-1">
                        Stable Debt: {formatBigInt(balance.stableDebt, 18)}{" "}
                        {balance.symbol}
                      </div>
                      <div className="text-sm text-slate-300">
                        Variable Debt: {formatBigInt(balance.variableDebt, 18)}{" "}
                        {balance.symbol}
                      </div>
                    </div>
                  )}

                  {index < balances.length - 1 && (
                    <Separator className="bg-slate-600" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No balances state */}
      {!isLoading && !isError && balances.length === 0 && inputAddress && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="text-center py-8">
            <div className="text-slate-400 mb-2">
              No Aave V3 positions found for this address.
            </div>
            <div className="text-sm text-slate-500">
              This address either has no positions on Aave V3 or has never
              interacted with the protocol.
            </div>
            <div className="mt-4 text-xs text-slate-500">
              Try a different address or check if the address has deposited
              assets to Aave V3.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error state */}
      {isError && (
        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="text-center py-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <AlertTriangle className="w-6 h-6 text-red-400" />
              <span className="text-red-400 font-medium">Error occurred</span>
            </div>
            <div className="text-slate-400 mb-2">
              {error?.message || "Unknown error occurred"}
            </div>
            <div className="text-sm text-slate-500">
              Please check the address format and try again.
            </div>
            <Button
              onClick={handleQuery}
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white border-0"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AaveV3BalanceViewer;
