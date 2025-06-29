import React, { useState } from "react";
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

// Remote icon URLs (fallback to text if not available)
const protocolIcons: Record<string, string> = {
  AAVE: "/icons/aave.png",
  Beefy: "/icons/beefy.png",
  Compound: "/icons/compound.png",
  Yearn: "/icons/yearn.jpg",
  Curve: "/icons/curve.png",
  Convex: "/icons/convex.png",
  Boost: "",
};

const chainIcons: Record<string, string> = {
  Ethereum: "/icons/ethereum.png",
  Polygon: "/icons/polygon.png",
  Noble: "",
};

type StrategyType = (typeof strategies)[number];

const OpportunitiesView: React.FC = () => {
  const [enterOpen, setEnterOpen] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState<StrategyType | null>(
    null
  );

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
              {strategies
                .sort((a, b) => b.apy - a.apy)
                .map((s) => (
                  <tr
                    key={s.id}
                    className="border-b border-slate-700 hover:bg-slate-700/50"
                  >
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-2">
                        {protocolIcons[s.protocol] ? (
                          <img
                            src={protocolIcons[s.protocol]}
                            alt={s.protocol}
                            className="w-5 h-5 object-contain"
                          />
                        ) : (
                          <Badge>{s.protocol.charAt(0)}</Badge>
                        )}
                        <span>{s.protocol}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4">{s.name}</td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center space-x-2">
                        {chainIcons[s.chain] && (
                          <img
                            src={chainIcons[s.chain]}
                            alt={s.chain}
                            className="w-5 h-5 object-contain"
                          />
                        )}
                        <span>{s.chain}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 font-semibold text-green-400">
                      {s.apy}%
                    </td>
                    <td className="py-3 pr-4">{s.tvl}</td>
                    <td className="py-3 pr-4">${s.minDeposit}</td>
                    <td className="py-3 pr-4">
                      <Button
                        className="bg-orange-600 hover:bg-orange-700 text-white border-0 py-1 px-3 text-xs"
                        onClick={() => {
                          setSelectedStrategy(s);
                          setEnterOpen(true);
                        }}
                      >
                        Enter
                      </Button>
                    </td>
                  </tr>
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
