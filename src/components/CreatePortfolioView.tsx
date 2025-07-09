import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Trash2, Plus, ArrowRight, Info } from "lucide-react";
import { useAgoric } from "@agoric/react-components";
import WalletConnection from "@/components/WalletConnection";
import { YIELD_STRATEGIES } from "@/components/StrategyDashboard";

interface SelectedOpportunity {
  id: string;
  protocol: string;
  name: string;
  apy: number;
  tvl: string;
  chain: string;
  allocation: number;
}

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

const CreatePortfolioView: React.FC = () => {
  const { walletConnection, purses } = useAgoric();
  const [selectedOpportunities, setSelectedOpportunities] = useState<
    SelectedOpportunity[]
  >([]);
  const [initialFunding, setInitialFunding] = useState<string>("");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState("agoric");

  // Get top 3 strategies by APY
  const topStrategies = [...YIELD_STRATEGIES]
    .sort((a, b) => b.apy - a.apy)
    .slice(0, 3);

  // Calculate total allocation
  const totalAllocation = selectedOpportunities.reduce(
    (sum, opp) => sum + opp.allocation,
    0
  );

  const handleAddOpportunity = (strategy: (typeof YIELD_STRATEGIES)[0]) => {
    const newOpportunity: SelectedOpportunity = {
      id: strategy.id,
      protocol: strategy.protocol,
      name: strategy.name,
      apy: strategy.apy,
      tvl: strategy.tvl,
      chain: strategy.chain,
      allocation: selectedOpportunities.length === 0 ? 100 : 0,
    };

    setSelectedOpportunities([...selectedOpportunities, newOpportunity]);
  };

  const handleRemoveOpportunity = (id: string) => {
    setSelectedOpportunities(
      selectedOpportunities.filter((opp) => opp.id !== id)
    );
  };

  const handleAllocationChange = (id: string, allocation: number) => {
    setSelectedOpportunities(
      selectedOpportunities.map((opp) =>
        opp.id === id ? { ...opp, allocation } : opp
      )
    );
  };

  const isOpportunitySelected = (id: string) => {
    return selectedOpportunities.some((opp) => opp.id === id);
  };

  const isTopOpportunity = (id: string) => {
    return topStrategies.some((strategy) => strategy.id === id);
  };

  const canCreatePortfolio =
    selectedOpportunities.length > 0 &&
    totalAllocation === 100 &&
    initialFunding;

  // Supported chains for funding
  const supportedChains = [
    { id: "agoric", name: "Agoric", available: true },
    { id: "ethereum", name: "Ethereum", available: false },
    { id: "polygon", name: "Polygon", available: false },
    { id: "arbitrum", name: "Arbitrum", available: false },
    { id: "optimism", name: "Optimism", available: false },
  ];

  // Get USDC balance from purses
  const getUSDCBalance = () => {
    if (!purses) return 0;
    const usdcPurse = purses.find(
      (p) => p.brandPetname?.toLowerCase() === "usdc"
    );
    return usdcPurse ? Number(usdcPurse.currentAmount.value) / 1_000_000 : 0;
  };

  const availableBalance = getUSDCBalance();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Your Portfolio
        </h1>
        <p className="text-slate-400">Build your diversified yield portfolio</p>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
        {/* Your Portfolio */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">Your Portfolio</h2>

          <Card className="bg-slate-800/60 border-slate-700 mb-6">
            <CardContent className="p-6">
              {!walletConnection ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white mb-2">
                    Connect Your Wallet
                  </h3>
                  <p className="text-slate-400 mb-6">
                    Connect your wallet to start building your portfolio
                  </p>
                  <WalletConnection />
                </div>
              ) : selectedOpportunities.length === 0 ? (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-6 h-6 text-slate-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    No pools selected yet
                  </h3>
                  <p className="text-slate-400">
                    Add opportunities below to start building your portfolio
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedOpportunities.map((opportunity) => (
                    <div
                      key={opportunity.id}
                      className="flex items-center justify-between p-4 bg-slate-900/50 border border-slate-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-semibold text-sm">
                            {opportunity.protocol.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">
                              {opportunity.protocol} {opportunity.name}
                            </span>
                            <Badge
                              variant="secondary"
                              className="bg-slate-700 text-slate-300"
                            >
                              {opportunity.apy}%
                            </Badge>
                          </div>
                          <div className="text-sm text-slate-400">
                            {opportunity.chain} • {opportunity.tvl}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-slate-400">
                            Allocation:
                          </span>
                          <Input
                            type="number"
                            value={opportunity.allocation}
                            onChange={(e) =>
                              handleAllocationChange(
                                opportunity.id,
                                Number(e.target.value)
                              )
                            }
                            className="w-20 bg-slate-700/50 border-slate-600 text-white text-center"
                            min="0"
                            max="100"
                          />
                          <span className="text-sm text-slate-400">%</span>
                        </div>
                        <Button
                          onClick={() =>
                            handleRemoveOpportunity(opportunity.id)
                          }
                          variant="ghost"
                          size="sm"
                          className="text-slate-400 hover:text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Total Allocation */}
              {selectedOpportunities.length > 0 && (
                <div className="mt-6 pt-4 border-t border-slate-700">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span className="text-white">Total Allocation:</span>
                    <span
                      className={`${
                        totalAllocation === 100
                          ? "text-green-400"
                          : "text-yellow-400"
                      }`}
                    >
                      {totalAllocation}%
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Initial Funding */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-6">
            Initial Funding
          </h2>

          <Card className="bg-slate-800/60 border-slate-700">
            <CardContent className="p-6 space-y-4">
              <div>
                <Label htmlFor="funding-chain" className="text-white text-sm">
                  Funding Chain
                </Label>
                <Select value={selectedChain} onValueChange={setSelectedChain}>
                  <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                    <SelectValue placeholder="Select chain" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {supportedChains.map((chain) => (
                      <SelectItem
                        key={chain.id}
                        value={chain.id}
                        disabled={!chain.available}
                        className={`${
                          chain.available
                            ? "text-white hover:bg-slate-700"
                            : "text-slate-500 cursor-not-allowed"
                        }`}
                      >
                        {chain.name}
                        {!chain.available && " (Coming Soon)"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="funding-amount" className="text-white text-sm">
                  Total Amount (USDC)
                </Label>
                <Input
                  id="funding-amount"
                  type="number"
                  value={initialFunding}
                  onChange={(e) => setInitialFunding(e.target.value)}
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-400 focus:border-blue-500"
                  placeholder="0.00"
                />
                {walletConnection && selectedChain === "agoric" && (
                  <p className="text-xs text-slate-400 mt-1">
                    Available Balance: {availableBalance.toFixed(2)} USDC
                  </p>
                )}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                disabled={!canCreatePortfolio}
                onClick={() => setShowConfirmModal(true)}
              >
                Create Portfolio
              </Button>

              {selectedOpportunities.length === 0 && (
                <p className="text-slate-400 text-sm text-center">
                  Add pools to enable creation
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Top Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          Top Opportunities
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {topStrategies.map((strategy) => (
            <Card
              key={strategy.id}
              className={`bg-slate-800/60 border-slate-700 hover:bg-slate-700/60 transition-all ${
                isOpportunitySelected(strategy.id)
                  ? "ring-2 ring-orange-500"
                  : ""
              }`}
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
                  <div className="text-2xl font-bold text-green-400">
                    {strategy.apy}%
                  </div>
                </div>
                <div className="flex-1" />
                <Button
                  size="sm"
                  className={`rounded-full px-5 py-1 self-center mt-4 ${
                    !walletConnection || isOpportunitySelected(strategy.id)
                      ? "bg-slate-600 text-slate-300 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                  }`}
                  onClick={() => handleAddOpportunity(strategy)}
                  disabled={
                    !walletConnection || isOpportunitySelected(strategy.id)
                  }
                >
                  {!walletConnection ? (
                    "Connect Wallet"
                  ) : isOpportunitySelected(strategy.id) ? (
                    "Added to Portfolio"
                  ) : (
                    <>
                      <Plus className="w-3 h-3 mr-1" />
                      Add
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* All Opportunities */}
      <div>
        <h2 className="text-2xl font-bold text-white mb-6">
          All Opportunities
        </h2>

        <Card className="bg-slate-800/60 border-slate-700">
          <CardContent className="overflow-x-auto">
            <table className="min-w-full text-sm text-slate-300">
              <thead>
                <tr className="border-b border-slate-700 text-slate-400 text-left">
                  <th className="py-3 pl-6 pr-2">Protocol</th>
                  <th className="py-3 px-2">Pool</th>
                  <th className="py-3 px-2">Chain</th>
                  <th className="py-3 px-2">APY</th>
                  <th className="py-3 px-2">TVL</th>
                  <th className="py-3 px-2">Min</th>
                  <th className="py-3 pl-2 pr-6">Action</th>
                </tr>
              </thead>
              <tbody>
                {YIELD_STRATEGIES.sort((a, b) => b.apy - a.apy).map(
                  (strategy) => (
                    <tr
                      key={strategy.id}
                      className={`border-b border-slate-700 hover:bg-slate-700/50 ${
                        isTopOpportunity(strategy.id)
                          ? "bg-gradient-to-r from-amber-500/10 via-orange-500/5 to-amber-500/10"
                          : ""
                      }`}
                    >
                      <td className="py-3 pl-6 pr-2">
                        <div className="flex items-center space-x-2">
                          {protocolIcons[strategy.protocol] ? (
                            <img
                              src={protocolIcons[strategy.protocol]}
                              alt={strategy.protocol}
                              className="w-5 h-5 object-contain"
                            />
                          ) : (
                            <Badge>{strategy.protocol.charAt(0)}</Badge>
                          )}
                          <span>{strategy.protocol}</span>
                          {isTopOpportunity(strategy.id) && (
                            <Badge className="bg-gradient-to-r from-orange-500 to-amber-500 text-white text-xs">
                              Top
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">{strategy.name}</td>
                      <td className="py-3 px-2">
                        <div className="flex items-center space-x-2">
                          {chainIcons[strategy.chain] && (
                            <img
                              src={chainIcons[strategy.chain]}
                              alt={strategy.chain}
                              className="w-5 h-5 object-contain"
                            />
                          )}
                          <span>{strategy.chain}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 font-semibold text-green-400">
                        {strategy.apy}%
                      </td>
                      <td className="py-3 px-2">{strategy.tvl}</td>
                      <td className="py-3 px-2">${strategy.minDeposit}</td>
                      <td className="py-3 pl-2 pr-6">
                        <Button
                          className={`py-1 px-3 text-xs ${
                            !walletConnection ||
                            isOpportunitySelected(strategy.id)
                              ? "bg-slate-600 text-slate-300 cursor-not-allowed border-0"
                              : "bg-orange-600 hover:bg-orange-700 text-white border-0"
                          }`}
                          onClick={() => handleAddOpportunity(strategy)}
                          disabled={
                            !walletConnection ||
                            isOpportunitySelected(strategy.id)
                          }
                        >
                          {!walletConnection ? (
                            "Connect Wallet"
                          ) : isOpportunitySelected(strategy.id) ? (
                            "Added"
                          ) : (
                            <>
                              <Plus className="w-3 h-3 mr-1" />
                              Add
                            </>
                          )}
                        </Button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={showConfirmModal} onOpenChange={setShowConfirmModal}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-white">
              Portfolio Summary
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-slate-300">Total Amount:</span>
              <span className="text-white font-semibold">
                ${initialFunding} USDC
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300">Pools Selected:</span>
              <span className="text-white font-semibold">
                {selectedOpportunities.length}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-slate-300">Funding Source:</span>
              <span className="text-white font-semibold">
                {
                  supportedChains.find((chain) => chain.id === selectedChain)
                    ?.name
                }{" "}
                Wallet
              </span>
            </div>
          </div>

          <Button
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white mt-6"
            onClick={() => {
              // Here you would handle the actual portfolio creation
              console.log("Creating portfolio...");
              setShowConfirmModal(false);
            }}
          >
            <span>Confirm Portfolio Creation</span>
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>

          <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mt-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-slate-300 leading-relaxed">
                When you confirm this and authorize it with your wallet, the
                YMAX contract will orchestrate the transfers, bridging, and
                operations required to accomplish your request. For details
                click the information icon.
                <br />
                <br />
                Please be aware of smart contract and stablecoin risks. Digital
                assets involve risk and may lose value.
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CreatePortfolioView;
