import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { YIELD_STRATEGIES as strategies } from "@/components/StrategyDashboard";
import EnterStrategyModal from "@/components/EnterStrategyModal";
import { usePortfolioStore } from "@/store";
import { useRealStrategies } from "@/hooks/useRealStrategies";
import { formatApy, formatUsdCompact } from "@/lib/utils";
import { BASE_STRATEGIES } from "@/constants/strategies";
import { useStrategyMetrics } from "@/hooks/useStrategyMetrics";

// Remote icon URLs (fallback to text if not available)
const protocolIcons: Record<string, string> = {
  AAVE: "/icons/aave.png",
  Beefy: "/icons/beefy.png",
  Compound: "/icons/compound.png",
  Yearn: "/icons/yearn.jpg",
  Curve: "/icons/curve.png",
  Convex: "/icons/convex.png",
  Noble: "/icons/USDN.svg",
  Boost: "",
};

const chainIcons: Record<string, string> = {
  Ethereum: "/icons/ethereum.png",
  Polygon: "/icons/polygon.png",
  Noble: "/icons/noble.png",
};

type StrategyType = (typeof strategies)[number];

const OpportunitiesView: React.FC = () => {
  const [enterOpen, setEnterOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType | null>(
    null
  );

  const { dataMode } = usePortfolioStore();

  const { data: realStrategies = [], isLoading: isQueryLoading } =
    useRealStrategies();
  const isLoadingAprs = isQueryLoading;

  // Use appropriate strategies based on dataMode
  const availableStrategies: StrategyType[] =
    dataMode === "real-data" ? (BASE_STRATEGIES as any) : strategies;

  const OpportunityRow: React.FC<{ strat: StrategyType }> = ({ strat }) => {
    if (dataMode !== "real-data") {
      return (
        <tr className="border-b border-slate-700 hover:bg-slate-700/50">
          <td className="py-3 pr-4 flex items-center space-x-2 align-middle">
            {protocolIcons[strat.protocol] ? (
              <img
                src={protocolIcons[strat.protocol]}
                alt="p"
                className="w-5 h-5"
              />
            ) : null}
            <span>{strat.protocol}</span>
          </td>
          <td className="py-3 pr-4">{strat.name}</td>
          <td className="py-3 pr-4 flex items-center space-x-2 align-middle">
            {chainIcons[strat.chain] && (
              <img src={chainIcons[strat.chain]} alt="c" className="w-5 h-5" />
            )}
            <span>{strat.chain}</span>
          </td>
          <td className="py-3 pr-4 font-semibold text-green-400">
            {formatApy((strat as any).apy)}
          </td>
          <td className="py-3 pr-4 align-middle">
            {(strat as any).tvl ?? "TBD"}
          </td>
          <td className="py-3 pr-4">${(strat as any).minDeposit ?? 0}</td>
          <td className="py-3 pr-4">
            <Button
              className="bg-orange-600 hover:bg-orange-700 text-white border-0 py-1 px-3 text-xs"
              onClick={() => {
                setSelectedStrategy(strat as any);
                setEnterOpen(true);
              }}
            >
              Enter
            </Button>
          </td>
        </tr>
      );
    }

    const { data, isLoading } = useStrategyMetrics(strat.id);

    return (
      <tr className="border-b border-slate-700 hover:bg-slate-700/50">
        <td className="py-3 pr-4 align-middle whitespace-nowrap">
          <div className="inline-flex items-center space-x-2">
            {protocolIcons[strat.protocol] && (
              <img
                src={protocolIcons[strat.protocol]}
                alt="p"
                className="w-5 h-5"
              />
            )}
            <span>{strat.protocol}</span>
          </div>
        </td>
        <td className="py-3 pr-4">{strat.name}</td>
        <td className="py-3 pr-4 align-middle whitespace-nowrap">
          <div className="inline-flex items-center space-x-2">
            {chainIcons[strat.chain] && (
              <img src={chainIcons[strat.chain]} alt="c" className="w-5 h-5" />
            )}
            <span>{strat.chain}</span>
          </div>
        </td>
        <td className="py-3 pr-4 font-semibold text-green-400">
          {isLoading || data?.apy === undefined ? (
            <div className="animate-spin h-3 w-3 border-2 border-green-400/60 border-t-transparent rounded-full" />
          ) : (
            formatApy(data.apy)
          )}
        </td>
        <td className="py-3 pr-4 align-middle">
          {isLoading ? (
            <div className="animate-pulse h-4 w-16 bg-slate-700/50 rounded" />
          ) : typeof data?.tvl === "number" ? (
            formatUsdCompact(data.tvl)
          ) : (
            "TBD"
          )}
        </td>
        <td className="py-3 pr-4">$0</td>
        <td className="py-3 pr-4">
          <Button
            className="bg-orange-600 hover:bg-orange-700 text-white border-0 py-1 px-3 text-xs"
            onClick={() => {
              setSelectedStrategy(strat as any);
              setEnterOpen(true);
            }}
          >
            Enter
          </Button>
        </td>
      </tr>
    );
  };

  return (
    <>
      <Card className="bg-slate-800/60 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white">
            All Available Opportunities
          </CardTitle>
          <CardDescription className="text-slate-400">
            Compare and sort available yield opportunities
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="min-w-full text-sm text-slate-300">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400 text-left">
                <th className="py-3 pr-4">Protocol</th>
                <th className="py-3 pr-4">Pool</th>
                <th className="py-3 pr-4">Chain</th>
                <th className="py-3 pr-4">APY</th>
                <th className="py-3 pr-4">TVL</th>
                <th className="py-3 pr-4">Min</th>
                <th className="py-3 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {availableStrategies.map((s) => (
                <OpportunityRow key={s.id} strat={s} />
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <EnterStrategyModal
        strategy={selectedStrategy}
        open={enterOpen}
        onOpenChange={setEnterOpen}
      />
    </>
  );
};

export default OpportunitiesView;
