import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ArrowRight, Wallet, TrendingUp, Plus } from "lucide-react";
import PortfolioChart from "./PortfolioChart";
import { useAgoric } from "@agoric/react-components";
import WalletConnection from "@/components/WalletConnection";
import { usePortfolioStore } from "@/store";

interface Strategy {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  tvl: string;
  riskLevel: "Low" | "Medium" | "High";
  chain: string;
  description: string;
  minDeposit: number;
}

interface StrategyDashboardProps {
  onSelectStrategy: (strategy: Strategy) => void;
  onSelectPresetStrategies: (strategies: Strategy[]) => void;
  onNavigateToDeposit: () => void;
}

const strategies: Strategy[] = [
  {
    id: "aave-eth",
    protocol: "AAVE",
    name: "USAV",
    apy: 14.0,
    tvl: "$1.2B",
    riskLevel: "Low",
    chain: "Ethereum",
    description: "Aave's USDC vault with automated yield optimization",
    minDeposit: 100,
  },
  {
    id: "beefy-polygon",
    protocol: "Beefy",
    name: "USDC",
    apy: 10.0,
    tvl: "$850M",
    riskLevel: "Low",
    chain: "Polygon",
    description: "Beefy Finance USDC yield farming on Polygon",
    minDeposit: 50,
  },
  {
    id: "compound-eth",
    protocol: "Compound",
    name: "USDC",
    apy: 4.0,
    tvl: "$2.1B",
    riskLevel: "Low",
    chain: "Ethereum",
    description: "Compound's USDC lending protocol",
    minDeposit: 100,
  },
  {
    id: "yearn-eth",
    protocol: "Yearn",
    name: "USDC Vault",
    apy: 8.5,
    tvl: "$650M",
    riskLevel: "Medium",
    chain: "Ethereum",
    description: "Yearn Finance USDC vault with automated strategies",
    minDeposit: 1000,
  },
  {
    id: "curve-eth",
    protocol: "Curve",
    name: "3Pool",
    apy: 6.2,
    tvl: "$3.2B",
    riskLevel: "Low",
    chain: "Ethereum",
    description: "Curve's 3Pool stablecoin liquidity pool",
    minDeposit: 100,
  },
  {
    id: "convex-eth",
    protocol: "Convex",
    name: "USDC",
    apy: 12.5,
    tvl: "$1.8B",
    riskLevel: "Medium",
    chain: "Ethereum",
    description: "Convex Finance Curve LP staking",
    minDeposit: 500,
  },
];

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
  onSelectStrategy,
  onSelectPresetStrategies,
  onNavigateToDeposit,
}) => {
  const { walletConnection } = useAgoric();
  const { currentBalance, weeklyReturn, positions, isLoading } =
    usePortfolioStore();
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const handleQuickDeposit = () => {
    // This would handle the deposit logic
    console.log(`Depositing $${depositAmount} USDC`);
    setShowDepositDialog(false);
    setDepositAmount("");
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Balance Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Your Portfolio Balance
        </h2>

        <Card className="bg-slate-800/60 border-slate-700 relative">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div
                  className={`text-3xl font-bold text-white ${
                    !walletConnection ? "blur-sm" : ""
                  }`}
                >
                  ${currentBalance.toLocaleString()}
                </div>
                <div
                  className={`text-green-400 ${
                    !walletConnection ? "blur-sm" : ""
                  }`}
                >
                  +{weeklyReturn}% WoW
                </div>
              </div>
              {walletConnection && (
                <Dialog
                  open={showDepositDialog}
                  onOpenChange={setShowDepositDialog}
                >
                  <DialogTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white border-0">
                      <Plus className="w-4 h-4 mr-2" />
                      Deposit more
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-slate-900 border-slate-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">
                        Quick Deposit
                      </DialogTitle>
                      <DialogDescription className="text-slate-400">
                        Deposit USDC that will be allocated proportionally to
                        your current distribution
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="deposit-amount" className="text-white">
                          Amount (USDC)
                        </Label>
                        <Input
                          id="deposit-amount"
                          type="number"
                          value={depositAmount}
                          onChange={(e) => setDepositAmount(e.target.value)}
                          className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>

                      <div className="text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                        <p className="mb-2">Current allocation:</p>
                        <ul className="space-y-1">
                          {positions.map((position) => (
                            <li key={position.id}>
                              • {position.protocol} {position.name}:{" "}
                              {position.percentage}% ($
                              {position.value.toLocaleString()})
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        onClick={handleQuickDeposit}
                        disabled={!depositAmount || Number(depositAmount) <= 0}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                      >
                        Confirm Deposit
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className={walletConnection ? "" : "blur-sm"}>
                <PortfolioChart height="h-32" />
              </div>
              {!walletConnection && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <WalletConnection />
                </div>
              )}
            </div>
            <div className="flex justify-between mt-4 text-sm text-slate-400">
              <span>D</span>
              <span>W</span>
              <span>M</span>
              <span>All</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yield Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Yield Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategies.map((strategy) => (
            <Card
              key={strategy.id}
              className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all cursor-pointer"
            >
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-lg font-semibold text-white">
                    {strategy.protocol}
                  </div>
                  <div className="text-sm text-slate-300">{strategy.name}</div>
                  <div className="text-2xl font-bold text-green-400 mt-2">
                    {strategy.apy}%
                  </div>
                  <div className="text-xs text-slate-400">APY</div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* AI Chat Section */}
      <Card className="bg-slate-800/60 border-slate-700">
        <CardContent className="p-6">
          <h3 className="text-xl font-bold text-white mb-4">Choosing yield?</h3>
          <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
            <p className="text-slate-300 text-sm">
              Ask me anything about yield strategies, risk assessment, or
              portfolio optimization...
            </p>
          </div>
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
            Start Conversation
          </Button>
        </CardContent>
      </Card>

      {/* Distribution (Your Positions) */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Your Active Positions
        </h2>

        {!walletConnection ? (
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="text-center py-12">
              <Wallet className="w-12 h-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                Connect Your Wallet
              </h3>
              <p className="text-slate-300 mb-6">
                Connect your wallet to view and manage your positions
              </p>
              <WalletConnection />
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {positions.map((position) => (
              <Card
                key={position.id}
                className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all cursor-pointer"
                onClick={() => onNavigateToDeposit()}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-lg font-semibold text-white">
                      {position.protocol}
                    </div>
                    <Badge
                      variant="secondary"
                      className="bg-slate-700 text-slate-300"
                    >
                      {position.chain}
                    </Badge>
                  </div>
                  <div className="text-sm text-slate-300 mb-2">
                    {position.name}
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="text-xl font-bold text-green-400">
                        {position.apy}%
                      </div>
                      <div className="text-xs text-slate-400">APY</div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-white">
                        {position.percentage}%
                      </div>
                      <div className="text-sm text-slate-400">
                        ${position.value.toLocaleString()}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategyDashboard;
