import React, { useState, useEffect } from "react";
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
import { ArrowRight, Wallet, Plus, Star, TrendingUp } from "lucide-react";
import { useAgoric } from "@agoric/react-components";
import WalletConnection from "@/components/WalletConnection";
import { usePortfolioStore } from "@/store";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import EnterStrategyModal from "@/components/EnterStrategyModal";
import { BASE_STRATEGIES, BaseStrategy } from "@/constants/strategies";
import { useStrategyMetrics } from "@/hooks/useStrategyMetrics";
import { formatApy } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Strategy {
  id: string;
  allocationKey: string;
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
  onNavigateToOpportunities: () => void;
}

export const PoolPlaces = {
  USDN: { protocol: "USDN", vault: null, chainName: "noble" }, // MsgSwap only
  USDNVault: { protocol: "USDN", vault: 1, chainName: "noble" }, // MsgSwap, MsgLock
  Aave_Ethereum: { protocol: "Aave", chainName: "Ethereum" },
  Aave_Avalanche: { protocol: "Aave", chainName: "Avalanche" },
  Aave_Optimism: { protocol: "Aave", chainName: "Optimism" },
  Aave_Arbitrum: { protocol: "Aave", chainName: "Arbitrum" },
  Aave_Polygon: { protocol: "Aave", chainName: "Polygon" },
  Aave_Fantom: { protocol: "Aave", chainName: "Fantom" },
  Aave_Binance: { protocol: "Aave", chainName: "Binance" },
  Compound_Ethereum: { protocol: "Compound", chainName: "Ethereum" },
  Compound_Avalanche: { protocol: "Compound", chainName: "Avalanche" },
  Compound_Optimism: { protocol: "Compound", chainName: "Optimism" },
  Compound_Arbitrum: { protocol: "Compound", chainName: "Arbitrum" },
  Compound_Polygon: { protocol: "Compound", chainName: "Polygon" },
  Compound_Fantom: { protocol: "Compound", chainName: "Fantom" },
  Compound_Binance: { protocol: "Compound", chainName: "Binance" },
};

const strategies: Strategy[] = [
  {
    id: "Aave_Ethereum",
    allocationKey: "Aave_Ethereum",
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
    allocationKey: "Beefy_Polygon",
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
    allocationKey: "Compound_Ethereum",
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
    allocationKey: "Yearn_Ethereum",
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
    allocationKey: "Curve_Ethereum",
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
    allocationKey: "Convex_Ethereum",
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

// export strategies so other pages (e.g. Opportunities) can reuse the same source of truth
export const YIELD_STRATEGIES = strategies;

const protocolIcons: Record<string, string> = {
  AAVE: "/icons/aave.png",
  Beefy: "/icons/beefy.png",
  Compound: "/icons/compound.png",
  Yearn: "/icons/yearn.jpg",
  Curve: "/icons/curve.png",
  Convex: "/icons/convex.png",
  Noble: "/icons/USDN.svg",
  Boost: "", // placeholder
};

const chainIcons: Record<string, string> = {
  Ethereum: "/icons/ethereum.png",
  Polygon: "/icons/polygon.png",
  Noble: "/icons/noble.png",
};

const StrategyDashboard: React.FC<StrategyDashboardProps> = ({
  onSelectStrategy,
  onSelectPresetStrategies,
  onNavigateToDeposit,
  onNavigateToOpportunities,
}) => {
  const { toast } = useToast();
  const { walletConnection, purses } = useAgoric();
  const {
    currentBalance,
    totalDeposits,
    positions,
    dataMode,
    portfolioOfferId,
  } = usePortfolioStore();
  const gainsValue = currentBalance - totalDeposits;
  const [showDepositDialog, setShowDepositDialog] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");

  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  // enter opportunity modal
  const [enterOpen, setEnterOpen] = useState(false);
  const [selectedEnterStrategy, setSelectedEnterStrategy] = useState<
    Strategy | BaseStrategy | null
  >(null);

  const availableStrategies: (Strategy | BaseStrategy)[] =
    dataMode === "real-data" ? [...BASE_STRATEGIES] : strategies;

  const handleQuickWithdraw = () => {
    console.log(`Withdrawing $${withdrawAmount} USDC`);
    setShowWithdrawDialog(false);
    setWithdrawAmount("");
  };

  const handleQuickDeposit = () => {
    // This would handle the deposit logic
    console.log(`Depositing $${depositAmount} USDC`);
    const parsedAmount = Number(depositAmount) * 1_000_000;
    const depositAmountBigInt = BigInt(parsedAmount);
    if (!walletConnection) {
      toast({
        title: "Wallet not connected",
        description: "Please connect your wallet first.",
        variant: "destructive",
      });
      return;
    }
    if (depositAmountBigInt === 0n) {
      toast({
        title: "Invalid amount",
        description: "Please enter a non-zero amount.",
        variant: "destructive",
      });
      return;
    }
    if (!portfolioOfferId) {
      toast({
        title: "Portfolio Not Found",
        description:
          "A portfolio must be created before making a quick deposit.",
        variant: "destructive",
      });
      return;
    }
    const USDCBrand = usdcPurse?.brand;
    if (!USDCBrand) {
      toast({
        title: "Missing brand",
        description: "Required brand (USDC) is not available in purses.",
        variant: "destructive",
      });
      return;
    }

    const offerId = Date.now();
    const usdcAmount = {
      brand: USDCBrand as Brand<"nat">,
      value: depositAmountBigInt,
    };

    walletConnection.makeOffer(
      {
        source: "continuing",
        invitationMakerName: "Rebalance",
        previousOffer: portfolioOfferId,
      },
      {
        give: {
          Deposit: usdcAmount,
        },
      },
      {
        flow: [
          {
            src: "<Deposit>",
            dest: "@agoric",
            amount: usdcAmount,
          },
        ],
      },
      (update) => {
        console.log("Deposit offer update", update);
        toast({
          title: `Offer ${update.status}`,
          // Show description only if message exists (e.g., Error objects)
          description:
            update.data &&
            typeof update.data === "object" &&
            "message" in update.data
              ? (update.data as { message: string }).message
              : undefined,
          variant:
            update.status === "error" || update.status === "rejected"
              ? "destructive"
              : update.status === "accepted"
              ? "success"
              : "default",
        });
      },
      offerId
    );
  };

  // Derive the top 3 strategies with the highest APY
  const topStrategies = availableStrategies.slice(0, 3);

  // --------------------- Deposit source selection ---------------------
  const supportedChains = [
    { id: "agoric", name: "Agoric", available: true },
    { id: "1", name: "Ethereum", available: false },
    { id: "137", name: "Polygon", available: false },
    { id: "42161", name: "Arbitrum", available: false },
    { id: "10", name: "Optimism", available: false },
  ];

  const [selectedChain, setSelectedChain] = useState("agoric");

  const getUSDCBalance = () => {
    if (!purses) return null;
    const usdcPurse = purses.find(
      (p) => p.brandPetname?.toLowerCase() === "usdc"
    );
    return usdcPurse || null;
  };

  const usdcPurse = getUSDCBalance();

  //----------------------------------------------
  // Optimization suggestions (simple static logic for demo)
  //----------------------------------------------
  type Suggestion = {
    id: string;
    title: string;
    subtitle: string;
    gain: number;
    sourceId: string;
    targetId: string;
    percent: number;
  };

  const suggestions: Suggestion[] = positions.length
    ? [
        {
          id: "s1",
          title: "Shift 15% from Compound to Aave",
          subtitle:
            "Aave currently offers higher APY than your Compound position",
          gain: 1234,
          sourceId:
            dataMode === "real-data" ? "compound-eth-real" : "compound-eth",
          targetId: dataMode === "real-data" ? "aave-eth-real" : "aave-eth",
          percent: 15,
        },
      ].filter((s) => positions.find((p) => p.id === s.sourceId))
    : [];

  const [optOpen, setOptOpen] = useState(false);
  const [optSelected, setOptSelected] = useState<{
    suggestion: Suggestion;
    targetStrat: Strategy;
    defaultAmt: number;
  } | null>(null);

  // Helper function to determine badge color based on target vs actual percentage
  const getPercentageBadgeColor = (actual: number, target: number) => {
    return actual === target
      ? "bg-green-500/20 text-green-400 border-green-500/30"
      : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  };

  return (
    <div className="space-y-8">
      {/* Portfolio Balance Section */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Portfolio Overview
        </h2>

        <Card className="bg-slate-800/60 border-slate-700">
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
                  {gainsValue >= 0 ? "+" : "-"}$
                  {Math.abs(gainsValue).toLocaleString()} gains
                </div>
              </div>
              {walletConnection && (
                <div className="flex space-x-2">
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
                        {/* Deposit Source */}
                        <div>
                          <Label className="text-white mb-1 block">
                            Source Chain
                          </Label>
                          <Select
                            value={selectedChain}
                            onValueChange={setSelectedChain}
                          >
                            <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent className="bg-slate-800 border-slate-600 text-white">
                              {supportedChains.map((chain) => (
                                <SelectItem
                                  key={chain.id}
                                  value={chain.id}
                                  disabled={!chain.available}
                                  className={
                                    chain.available
                                      ? ""
                                      : "opacity-50 cursor-not-allowed"
                                  }
                                >
                                  {chain.name}
                                  {!chain.available && (
                                    <span className="text-xs ml-2 text-slate-400">
                                      Coming soon
                                    </span>
                                  )}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {selectedChain === "agoric" && usdcPurse && (
                            <p className="text-xs text-slate-400 mt-1">
                              Available:{" "}
                              {(
                                Number(usdcPurse.currentAmount.value) /
                                1_000_000
                              ).toLocaleString()}{" "}
                              USDC
                            </p>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor="deposit-amount"
                            className="text-white"
                          >
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

                        {/* Current allocation list */}
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
                          disabled={
                            !depositAmount || Number(depositAmount) <= 0
                          }
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
                        >
                          Confirm Deposit
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>

                  {/* Withdraw Button */}
                  <Dialog
                    open={showWithdrawDialog}
                    onOpenChange={setShowWithdrawDialog}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-red-600 hover:bg-red-700 text-white border-0">
                        Withdraw
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">
                          Quick Withdraw
                        </DialogTitle>
                        <DialogDescription className="text-slate-400">
                          Withdraw USDC proportionally from your current
                          distribution
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label
                            htmlFor="withdraw-amount"
                            className="text-white"
                          >
                            Amount (USDC)
                          </Label>
                          <Input
                            id="withdraw-amount"
                            type="number"
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>

                        {/* Current allocation list */}
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

                        <p className="text-xs text-slate-400">
                          Total available to withdraw: $
                          {currentBalance.toLocaleString()} USDC
                        </p>
                        <Button
                          onClick={handleQuickWithdraw}
                          disabled={
                            !withdrawAmount || Number(withdrawAmount) <= 0
                          }
                          className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white border-0"
                        >
                          Confirm Withdraw
                          <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </div>
          </CardHeader>
        </Card>
      </div>

      {/* Yield Opportunities */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
            <Star className="w-6 h-6 text-yellow-400" />
            <span>Top Opportunities</span>
          </h2>
          <Button
            onClick={onNavigateToOpportunities}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topStrategies.map((strategy) => (
            <StrategyCard
              key={strategy.id}
              strategy={strategy}
              onEnter={() => {
                setSelectedEnterStrategy(strategy);
                setEnterOpen(true);
              }}
            />
          ))}
        </div>
      </div>

      {/* Optimization Suggestions */}
      {suggestions.length > 0 && (
        <div className="space-y-4 mt-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-white flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-yellow-400" />
              <span>Optimization Suggestions</span>
            </h2>
          </div>

          {suggestions.map((sugg) => {
            const targetStrat = availableStrategies.find(
              (st) => st.id === sugg.targetId
            );
            const sourcePos = positions.find((p) => p.id === sugg.sourceId);
            const defaultAmt = sourcePos
              ? Number(((sugg.percent / 100) * sourcePos.value).toFixed(2))
              : 0;
            return (
              <Card key={sugg.id} className="bg-slate-800/60 border-slate-700">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-white mb-1">
                      {sugg.title}
                    </div>
                    <div className="text-slate-400 text-sm mb-1">
                      {sugg.subtitle}
                    </div>
                    <div className="text-green-400 text-sm">
                      +${sugg.gain.toLocaleString()}/year
                    </div>
                  </div>
                  <Button
                    className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-6"
                    onClick={() => {
                      setOptSelected({
                        suggestion: sugg,
                        targetStrat: targetStrat! as Strategy,
                        defaultAmt,
                      });
                      setOptOpen(true);
                    }}
                  >
                    Apply
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {optSelected && (
        <EnterStrategyModal
          strategy={optSelected.targetStrat as Strategy}
          open={optOpen}
          onOpenChange={setOptOpen}
          defaultSourceId={optSelected.suggestion.sourceId}
          defaultAmount={optSelected.defaultAmt}
        />
      )}

      {/* Distribution (Your Positions) */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-white">Current Portfolio</h2>
          <Button
            onClick={onNavigateToDeposit}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0"
          >
            Manage
          </Button>
        </div>

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
          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-sm text-slate-300">
                <thead>
                  <tr className="border-b border-slate-700 text-slate-400 text-left">
                    <th className="py-3 pr-4">Protocol</th>
                    <th className="py-3 pr-4">Pool</th>
                    <th className="py-3 pr-4">Chain</th>
                    <th className="py-3 pr-4">APY</th>
                    <th className="py-3 pr-4">Target %</th>
                    <th className="py-3 pr-4">Actual %</th>
                    <th className="py-3 pr-4">Value</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((position) => (
                    <tr
                      key={position.id}
                      className="border-b border-slate-700 hover:bg-slate-700/50 cursor-pointer"
                      onClick={() => onNavigateToDeposit()}
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center space-x-2">
                          {protocolIcons[position.protocol] ? (
                            <img
                              src={protocolIcons[position.protocol]}
                              alt={position.protocol}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <Badge>{position.protocol.charAt(0)}</Badge>
                          )}
                          <span>{position.protocol}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4">{position.name}</td>
                      <td className="py-3 pr-4">
                        <div className="flex items-center space-x-2">
                          {chainIcons[position.chain] && (
                            <img
                              src={chainIcons[position.chain]}
                              alt={position.chain}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span>{position.chain}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-green-400">
                        {formatApy(position.apy)}
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">
                        {position.targetPercentage.toFixed(0)}%
                      </td>
                      <td className="py-3 pr-4">
                        <Badge
                          variant="secondary"
                          className={`${getPercentageBadgeColor(
                            position.percentage,
                            position.targetPercentage
                          )} text-xs`}
                        >
                          {position.percentage.toFixed(2)}%
                        </Badge>
                      </td>
                      <td className="py-3 pr-4 font-semibold text-white">
                        ${position.value.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      <EnterStrategyModal
        strategy={
          selectedEnterStrategy
            ? ({
                ...YIELD_STRATEGIES.find(
                  (s) => s.id === selectedEnterStrategy.id
                ),
                ...selectedEnterStrategy,
              } as Strategy)
            : null
        }
        open={enterOpen}
        onOpenChange={setEnterOpen}
      />
    </div>
  );
};

const StrategyCard: React.FC<{
  strategy: Strategy | BaseStrategy;
  onEnter: () => void;
}> = ({ strategy, onEnter }) => {
  const { dataMode } = usePortfolioStore();
  const { data, isLoading } = useStrategyMetrics(strategy.id);

  const apy = dataMode === "real-data" ? data?.apy : (strategy as Strategy).apy;
  const displayApy =
    isLoading || apy === undefined ? (
      <div className="flex items-center">
        <div className="animate-spin h-4 w-4 border-2 border-green-400/60 border-t-transparent rounded-full" />
      </div>
    ) : (
      formatApy(apy)
    );

  return (
    <Card
      key={strategy.id}
      className="bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all cursor-pointer"
    >
      <CardContent className="p-4 flex flex-col h-full">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {protocolIcons[strategy.protocol] && (
              <img
                src={protocolIcons[strategy.protocol]}
                alt="protocol"
                className="w-5 h-5"
              />
            )}
            {chainIcons[strategy.chain] && (
              <img
                src={chainIcons[strategy.chain]}
                alt="chain"
                className="w-5 h-5"
              />
            )}
            <span className="font-semibold text-white">
              {strategy.protocol} {strategy.name}
            </span>
          </div>
          <div className="text-2xl font-bold text-green-400">{displayApy}</div>
        </div>
        <div className="flex-1" />
        <Button
          size="sm"
          className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-full px-5 py-1 self-center mt-4"
          onClick={onEnter}
        >
          Enter
        </Button>
      </CardContent>
    </Card>
  );
};

export default StrategyDashboard;
